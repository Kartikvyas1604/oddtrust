import { NextResponse } from 'next/server';
import { ensureInit } from '../../../lib/init';
import { getPostgresPool } from '../../../lib/postgres';
import { getRedis } from '../../../lib/redis';
import { getLogger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const OVERVIEW_CACHE_KEY = 'api:overview';
const OVERVIEW_CACHE_TTL = 30;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET() {
  try {
    ensureInit();

    const redis = getRedis();

    const cached = await redis.get(OVERVIEW_CACHE_KEY);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), {
        headers: { 'X-Cache': 'HIT', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const pool = getPostgresPool();

    const [totalResult, flaggedResult, fixtureResult, avgMarginResult, latestResult] =
      await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM consistency_checks'),
        pool.query('SELECT COUNT(*) as count FROM consistency_checks WHERE is_consistent = false'),
        pool.query('SELECT COUNT(*) as count FROM fixtures'),
        pool.query('SELECT COALESCE(AVG(ABS(margin)), 0) as avg_margin FROM consistency_checks WHERE is_consistent = false'),
        pool.query('SELECT MAX(created_at) as ts FROM consistency_checks'),
      ]);

    const total = parseInt(totalResult.rows[0].count, 10);
    const flagged = parseInt(flaggedResult.rows[0].count, 10);
    const fixtureCount = parseInt(fixtureResult.rows[0].count, 10);
    const avgMargin = parseFloat(avgMarginResult.rows[0].avg_margin);
    const lastCheck = latestResult.rows[0]?.ts ?? null;

    const consistencyRate = total > 0 ? ((total - flagged) / total) * 100 : 100;

    const overview = {
      trustScore: Math.round(consistencyRate),
      totalChecks: total,
      fixturesTracked: fixtureCount,
      flaggedMarkets: flagged,
      averageMargin: Math.round(avgMargin * 10000) / 10000,
      consistencyRate: Math.round(consistencyRate * 100) / 100,
      lastCheckTimestamp: lastCheck ? new Date(lastCheck).toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    await redis.setex(OVERVIEW_CACHE_KEY, OVERVIEW_CACHE_TTL, JSON.stringify(overview));

    return NextResponse.json(overview, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    getLogger().error({ err }, 'Overview API error');
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } },
    );
  }
}
