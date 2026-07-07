import { Worker } from 'bullmq';
import { getRedis } from '../lib/redis.js';
import { getLogger } from '../lib/logger.js';
import { getPostgresPool } from '../lib/postgres.js';
import { metricsRegistry } from '../metrics/registry.js';
import { OracleClient } from './oracle.js';
import type { SubmissionJobData, SubmissionJobResult } from './types.js';

const SUBMISSION_QUEUE_NAME = 'onchain-submissions';

let worker: Worker;

export function startSubmissionWorker(): void {
  const log = getLogger();
  const oracle = new OracleClient();
  const redis = getRedis();

  worker = new Worker<SubmissionJobData, SubmissionJobResult>(
    SUBMISSION_QUEUE_NAME,
    async (job) => {
      const { data } = job;
      const startTime = Date.now();
      log.info({ jobId: job.id, fixtureId: data.fixtureId }, 'Processing on-chain submission');

      try {
        const result = await oracle.submitConsistencyCheck(data);
        const latency = Date.now() - startTime;

        metricsRegistry.submissionLatency.observe(latency);
        metricsRegistry.submissionsTotal.inc({ status: 'success' });

        const pool = getPostgresPool();
        await pool.query(
          `UPDATE consistency_checks
           SET on_chain_tx = $1, on_chain_status = 'confirmed'
           WHERE id = $2`,
          [result.signature, data.checkId],
        );

        await pool.query(
          `UPDATE proof_log
           SET on_chain_tx = $1, on_chain_slot = $2
           WHERE check_id = $3`,
          [result.signature, result.slot, data.checkId],
        );

        log.info({
          jobId: job.id,
          signature: result.signature,
          slot: result.slot,
          latency,
        }, 'On-chain submission confirmed');

        return result;
      } catch (err) {
        metricsRegistry.submissionsTotal.inc({ status: 'failed' });
        log.error({ err, jobId: job.id }, 'On-chain submission failed');

        const pool = getPostgresPool();
        await pool.query(
          `UPDATE consistency_checks
           SET on_chain_status = 'failed'
           WHERE id = $1`,
          [data.checkId],
        );

        throw err;
      }
    },
    {
      connection: redis as any,
      concurrency: 5,
      lockDuration: 30000,
    },
  );

  worker.on('failed', (job, err) => {
    log.error({ jobId: job?.id, err }, 'Submission job failed after retries');
  });

  log.info('On-chain submission worker started');
}

export async function stopSubmissionWorker(): Promise<void> {
  if (worker) {
    await worker.close();
  }
}
