import { loadEnv, getEnv } from './config';
import { createLogger, getLogger } from './logger';
import { createPostgresPool } from './postgres';
import { createRedis } from './redis';

let initialized = false;

export function ensureInit(): void {
  if (initialized) return;
  initialized = true;

  loadEnv();
  createLogger();

  const env = getEnv();
  createPostgresPool({ connectionString: env.DATABASE_URL });
  createRedis(env.REDIS_URL);

  getLogger().info('OddsTrust API initialized');
}
