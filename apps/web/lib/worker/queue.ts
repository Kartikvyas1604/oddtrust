import { Queue, Worker, QueueEvents } from 'bullmq';
import { getEnv } from '../config';
import { getLogger } from '../logger';
import { getPostgresPool } from '../postgres';
import { OracleClient } from './oracle-client';
import type { SubmissionJobData, SubmissionJobResult } from './types';

const QUEUE_NAME = 'onchain-submissions';

let submissionQueue: Queue<SubmissionJobData, SubmissionJobResult> | null = null;
let queueEvents: QueueEvents | null = null;

function getConnection(): { url: string } {
  return { url: getEnv().REDIS_URL };
}

export function createSubmissionQueue(): Queue<SubmissionJobData, SubmissionJobResult> {
  if (submissionQueue) return submissionQueue;
  submissionQueue = new Queue<SubmissionJobData, SubmissionJobResult>(QUEUE_NAME, {
    connection: getConnection(),
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
  return submissionQueue;
}

export function getSubmissionQueue(): Queue<SubmissionJobData, SubmissionJobResult> {
  if (!submissionQueue) throw new Error('Queue not created. Call createSubmissionQueue() first.');
  return submissionQueue;
}

export function createQueueEvents(): QueueEvents {
  if (queueEvents) return queueEvents;
  queueEvents = new QueueEvents(QUEUE_NAME, {
    connection: getConnection(),
  });
  return queueEvents;
}

export function getQueueEvents(): QueueEvents {
  if (!queueEvents) throw new Error('QueueEvents not created. Call createQueueEvents() first.');
  return queueEvents;
}

export function createSubmissionWorker(): Worker<SubmissionJobData, SubmissionJobResult> {
  const log = getLogger();
  const worker = new Worker<SubmissionJobData, SubmissionJobResult>(
    QUEUE_NAME,
    async (job) => {
      const { fixtureId, isConsistent, margin } = job.data;
      log.info({ jobId: job.id, fixtureId }, 'Processing on-chain submission');

      const oracle = new OracleClient();
      const result = await oracle.submitConsistencyCheck(job.data);

      const pool = getPostgresPool();
      await pool.query(
        `INSERT INTO proof_log (fixture_id, action, signature, slot, block_time, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          fixtureId,
          isConsistent ? 'CHECK_PASSED' : 'CHECK_FLAGGED',
          result.signature,
          result.slot,
          result.blockTime ? new Date(result.blockTime * 1000).toISOString() : null,
          JSON.stringify({ margin, checkId: job.data.checkId }),
        ],
      );

      return result;
    },
    {
      connection: getConnection(),
      concurrency: 5,
    },
  );

  worker.on('completed', (job) => {
    log.info({ jobId: job.id, fixtureId: job.data.fixtureId }, 'Submission completed');
  });

  worker.on('failed', (job, err) => {
    log.error({ jobId: job?.id, fixtureId: job?.data.fixtureId, err }, 'Submission failed');
  });

  return worker;
}

export async function enqueueSubmission(data: SubmissionJobData): Promise<string> {
  const queue = getSubmissionQueue();
  const job = await queue.add('check-submission', data);
  return job.id ?? '';
}

export async function closeQueue(): Promise<void> {
  await Promise.all([
    submissionQueue?.close(),
    queueEvents?.close(),
  ]);
}
