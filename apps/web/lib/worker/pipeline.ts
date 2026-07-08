import crypto from 'node:crypto';
import { getPostgresPool } from '../postgres';
import { getRedis } from '../redis';
import { getLogger } from '../logger';
import { checkConsistency } from './consistency';
import type { ConsistencyCheckResult, MarketOdds } from './types';

interface CoveringSetConfigEntry {
  id: number;
  markets: string[];
  created_at: string;
}

const DEFAULT_COVERING_SETS: string[][] = [
  ['match_winner'],
  ['double_chance'],
  ['match_winner', 'double_chance'],
];

const COVERING_SETS_CACHE_TTL = 300_000;
const COVERING_SETS_CACHE_KEY = 'pipeline:covering_sets';

export class DetectionPipeline {
  private processedSnapshots = new Set<string>();
  private coveringSetsCache: { timestamp: number; sets: string[][] } | null = null;

  constructor(private readonly maxCacheSize = 10000) {}

  private async loadCoveringSets(): Promise<string[][]> {
    if (
      this.coveringSetsCache &&
      Date.now() - this.coveringSetsCache.timestamp < COVERING_SETS_CACHE_TTL
    ) {
      return this.coveringSetsCache.sets;
    }

    try {
      const pool = getPostgresPool();
      const result = await pool.query(
        `SELECT value FROM oracle_config WHERE key = 'covering_sets'`,
      );
      if (result.rows.length > 0) {
        const parsed = JSON.parse(result.rows[0].value) as string[][];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.coveringSetsCache = { timestamp: Date.now(), sets: parsed };
          return parsed;
        }
      }
    } catch {
      /* use defaults */
    }

    this.coveringSetsCache = { timestamp: Date.now(), sets: DEFAULT_COVERING_SETS };
    return DEFAULT_COVERING_SETS;
  }

  async processOddsUpdate(data: Record<string, unknown>): Promise<ConsistencyCheckResult | null> {
    const log = getLogger();
    const fixtureId = data.fixture_id as string;
    const markets = data.markets as Array<{ type: string; odds: Record<string, number>; proof_ref?: string }> | undefined;

    if (!fixtureId || !markets || markets.length === 0) {
      return null;
    }

    const oddsSnapshotHash = this.computeSnapshotHash(markets);
    if (this.processedSnapshots.has(oddsSnapshotHash)) {
      return null;
    }

    this.processedSnapshots.add(oddsSnapshotHash);
    if (this.processedSnapshots.size > this.maxCacheSize) {
      const entries = this.processedSnapshots.values();
      for (let i = 0; i < 1000; i++) {
        const entry = entries.next();
        if (entry.done) break;
        this.processedSnapshots.delete(entry.value);
      }
    }

    const parsedMarkets: MarketOdds[] = markets.map((m) => ({
      type: m.type,
      outcomes: m.odds,
    }));

    const marketTypes = parsedMarkets.map((m) => m.type);
    const coveringSets = await this.loadCoveringSets();
    const available = coveringSets.filter((set) => set.every((m) => marketTypes.includes(m)));

    if (available.length === 0) {
      return null;
    }

    const selectedMarketTypes = available[0];
    const result = checkConsistency(
      fixtureId,
      parsedMarkets,
      selectedMarketTypes,
      oddsSnapshotHash,
      data.proof_ref as string | null ?? null,
    );

    try {
      const pool = getPostgresPool();
      await pool.query(
        `INSERT INTO odds_snapshots (fixture_id, snapshot_hash, markets, proof_ref, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [fixtureId, oddsSnapshotHash, JSON.stringify(parsedMarkets), data.proof_ref ?? null],
      );

      const check = await pool.query(
        `INSERT INTO consistency_checks (fixture_id, is_consistent, margin_bps, market_set, odds_snapshot_hash, txline_proof_ref)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          fixtureId,
          result.isConsistent,
          Math.round(result.margin * 10000),
          JSON.stringify(result.marketSet),
          oddsSnapshotHash,
          result.txlineProofRef ?? null,
        ],
      );

      if (!result.isConsistent) {
        const redis = getRedis();
        await redis.publish(
          'proof-feed:live',
          JSON.stringify({
            type: 'FLAGGED',
            fixtureId,
            margin: result.margin,
            checkId: check.rows[0]?.id ?? null,
            timestamp: new Date().toISOString(),
            oddsSnapshotHash,
          }),
        );
      }

      log.info({ fixtureId, consistent: result.isConsistent, margin: result.margin }, 'Pipeline: odds update processed');
    } catch (err) {
      log.error({ err, fixtureId }, 'Pipeline: database write failed');
      return null;
    }

    return result;
  }

  private computeSnapshotHash(markets: Array<{ type: string; odds: Record<string, number> }>): string {
    const sorted = [...markets]
      .sort((a, b) => a.type.localeCompare(b.type))
      .map((m) => `${m.type}:${JSON.stringify(m.odds, Object.keys(m.odds).sort())}`)
      .join('|');
    return crypto.createHash('sha256').update(sorted).digest('hex').slice(0, 16);
  }

  clearCache(): void {
    this.processedSnapshots.clear();
    this.coveringSetsCache = null;
  }
}
