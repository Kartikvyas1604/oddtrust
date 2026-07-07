import { loadEnv } from './config/env.js';
import { createLogger, getLogger } from './lib/logger.js';
import { createPostgresPool, runMigrations, closePostgresPool } from './lib/postgres.js';
import { createRedis, closeRedis } from './lib/redis.js';
import { createSubmissionQueue, createQueueEvents, closeQueue } from './lib/queue.js';
import { startSubmissionWorker, stopSubmissionWorker } from './chain/queue.js';
import { TxLINEClient } from './ingestion/client.js';
import { FixtureIngester } from './ingestion/fixtures.js';
import { TxLINEStream } from './ingestion/stream.js';
import { DetectionPipeline } from './detection/pipeline.js';
import { metricsRegistry } from './metrics/registry.js';

async function main() {
  loadEnv();
  createLogger();
  const log = getLogger();
  log.info('Starting OddsTrust ingestion worker');

  const pool = createPostgresPool();
  const redis = createRedis();
  const submissionQueue = createSubmissionQueue();
  createQueueEvents();

  await redis.connect();
  await runMigrations();

  await submissionQueue.waitUntilReady();
  startSubmissionWorker();

  const txline = new TxLINEClient();
  await txline.authenticate();
  await txline.subscribe();

  const ingester = new FixtureIngester(txline);
  await ingester.syncAllFixtures();
  metricsRegistry.txlineConnectionStatus.set(1);

  const stream = new TxLINEStream(txline['apiToken']!);
  const pipeline = new DetectionPipeline(txline);

  stream.onMessage(async (msg) => {
    if (msg.type === 'odds_update' && typeof msg.data === 'object' && msg.data !== null) {
      const oddsData = msg.data as {
        fixture_id: string;
        markets: Array<{ type: string; odds: Record<string, number>; proof_ref?: string }>;
        snapshot_hash: string;
      };

      const odds = {
        fixture_id: oddsData.fixture_id,
        markets: oddsData.markets.map((m) => ({
          type: m.type,
          odds: m.odds,
          last_update: msg.timestamp,
          proof_ref: m.proof_ref,
        })),
        snapshot_hash: oddsData.snapshot_hash,
        timestamp: msg.timestamp,
      };

      try {
        const results = await pipeline.handleOddsUpdate(odds);
        for (const r of results) {
          metricsRegistry.checksTotal.inc({
            result: r.isConsistent ? 'consistent' : 'inconsistent',
          });
          if (!r.isConsistent) {
            metricsRegistry.inconsistenciesFound.inc();
          }
        }
        metricsRegistry.lastSuccessfulCheck.setToCurrentTime();
      } catch (err) {
        log.error({ err, fixtureId: msg.fixture_id }, 'Pipeline error processing odds update');
      }
    }
  });

  stream.connect().catch((err) => {
    log.error({ err }, 'Failed to connect TxLINE stream');
    metricsRegistry.txlineConnectionStatus.set(0);
  });

  const gracefulShutdown = async (signal: string) => {
    log.info({ signal }, 'Shutting down worker');
    stream.disconnect();
    await stopSubmissionWorker();
    await closeQueue();
    await closeRedis();
    await closePostgresPool();
    log.info('Worker shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  log.info('OddsTrust ingestion worker ready');
}

main().catch((err) => {
  const log = getLogger();
  log.fatal({ err }, 'Fatal worker startup error');
  process.exit(1);
});
