import { getLogger } from '../lib/logger.js';
import { getPostgresPool } from '../lib/postgres.js';
import { getRedis } from '../lib/redis.js';
import { getSubmissionQueue } from '../lib/queue.js';
import { TxLINEClient } from '../ingestion/client.js';
import type { TxLINEFixtureOdds } from '../ingestion/types.js';
import type { MarketOdds, ConsistencyCheckResult } from './types.js';
import { checkConsistency } from './consistency.js';
import { oddsToProbability, getBookmakerMargin } from './market.js';
import { COVERING_SETS, SINGLE_OUTCOME_SETS } from './types.js';

const ODC_CACHE_TTL = 300;
const PROOF_FEED_CHANNEL = 'proof-feed:live';

export class DetectionPipeline {
  private client: TxLINEClient;
  private running = false;

  constructor(client: TxLINEClient) {
    this.client = client;
  }

  async handleOddsUpdate(odds: TxLINEFixtureOdds): Promise<ConsistencyCheckResult[]> {
    const log = getLogger();
    const pool = getPostgresPool();
    const redis = getRedis();
    const queue = getSubmissionQueue();
    const results: ConsistencyCheckResult[] = [];
    const markets: MarketOdds[] = odds.markets.map((m) => ({
      type: m.type,
      outcomes: m.odds,
    }));

    const availableTypes = markets.map((m) => m.type);

    const setToCheck = availableTypes.includes('match_winner')
      ? [...new Set([...SINGLE_OUTCOME_SETS, ...COVERING_SETS])]
      : COVERING_SETS;

    for (const marketSet of setToCheck) {
      if (!marketSet.every((t) => availableTypes.includes(t))) continue;

      const result = checkConsistency(
        odds.fixture_id,
        markets,
        marketSet,
        odds.snapshot_hash,
        odds.markets[0]?.proof_ref ?? null,
      );

      const dedupKey = `dedup:${odds.fixture_id}:${marketSet.join('+')}:${odds.snapshot_hash}`;
      const alreadySeen = await redis.set(dedupKey, '1', 'EX', 86400, 'NX');
      if (alreadySeen !== 'OK') {
        log.debug({ fixtureId: odds.fixture_id, marketSet }, 'Skipping duplicate odds snapshot');
        continue;
      }

      results.push(result);

      const margin = getBookmakerMargin(
        Object.assign({}, ...markets.map((m) => oddsToProbability(m).outcomes)),
      );

      const snapResult = await pool.query(
        `INSERT INTO odds_snapshots (fixture_id, market_type, raw_odds, implied_probabilities, bookmaker_margin, snapshot_hash, txline_proof_ref, txline_timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (fixture_id, market_type, snapshot_hash) DO NOTHING`,
        [
          odds.fixture_id,
          marketSet.join('+'),
          JSON.stringify(odds.markets),
          JSON.stringify(result),
          margin,
          odds.snapshot_hash,
          result.txlineProofRef,
        ],
      );

      const dbResult = await pool.query(
        `INSERT INTO consistency_checks (fixture_id, market_set, summed_implied_probability, is_consistent, margin, optimal_stakes, odds_snapshot_hash, txline_proof_ref, on_chain_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
         RETURNING id`,
        [
          odds.fixture_id,
          marketSet,
          result.summedImpliedProbability,
          result.isConsistent,
          result.margin,
          result.optimalStakes ? JSON.stringify(result.optimalStakes) : null,
          odds.snapshot_hash,
          result.txlineProofRef,
        ],
      );

      const checkId = dbResult.rows[0].id;

      if (!result.isConsistent) {
        await pool.query(
          `INSERT INTO proof_log (check_id, fixture_id, consensus, margin, summary)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            checkId,
            odds.fixture_id,
            false,
            result.margin,
            `Arbitrage: Σ(1/odds)=${result.summedImpliedProbability} for ${marketSet.join('+')} on fixture ${odds.fixture_id}`,
          ],
        );
      }

      const proofEvent = {
        id: checkId,
        fixtureId: odds.fixture_id,
        marketSet: marketSet.join('+'),
        summedImpliedProbability: result.summedImpliedProbability,
        isConsistent: result.isConsistent,
        margin: result.margin,
        timestamp: new Date().toISOString(),
      };

      await redis.publish(PROOF_FEED_CHANNEL, JSON.stringify(proofEvent));
      await redis.setex(`proof:latest:${odds.fixture_id}`, ODC_CACHE_TTL, JSON.stringify(proofEvent));

      queue.add('submit-check', {
        checkId,
        fixtureId: odds.fixture_id,
        marketSet,
        summedImpliedProbability: result.summedImpliedProbability,
        isConsistent: result.isConsistent,
        margin: result.margin,
      });
    }

    await redis.setex(`odds:latest:${odds.fixture_id}`, ODC_CACHE_TTL, JSON.stringify(odds));

    return results;
  }
}
