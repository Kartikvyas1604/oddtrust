import { NextResponse } from 'next/server';
import { ensureInit } from '../../../lib/init';
import { getPostgresPool } from '../../../lib/postgres';
import { getRedis } from '../../../lib/redis';
import { getLogger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET() {
  const checks: Record<string, string> = {};
  let overall: 'ok' | 'degraded' | 'error' = 'ok';

  try {
    ensureInit();
    checks.init = 'ok';
  } catch {
    checks.init = 'error';
    overall = 'error';
  }

  try {
    const pool = getPostgresPool();
    await pool.query('SELECT 1');
    checks.postgres = 'ok';

    const { rows } = await pool.query('SELECT MAX(created_at) as ts FROM consistency_checks');
    checks.lastCheck = rows[0]?.ts ? new Date(rows[0].ts).toISOString() : 'none';
  } catch (err) {
    checks.postgres = 'error';
    overall = 'error';
    getLogger().error({ err }, 'Health check: Postgres failed');
  }

  try {
    const redis = getRedis();
    await redis.ping();
    checks.redis = 'ok';
  } catch (err) {
    checks.redis = 'error';
    if (overall !== 'error') overall = 'degraded';
    getLogger().error({ err }, 'Health check: Redis failed');
  }

  const statusCode = overall === 'error' ? 503 : overall === 'degraded' ? 200 : 200;

  return NextResponse.json(
    { status: overall, checks, timestamp: new Date().toISOString() },
    {
      status: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}
