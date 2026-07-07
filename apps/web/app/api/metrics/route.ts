import { NextResponse } from 'next/server';
import { ensureInit } from '../../../lib/init';
import { metricsRegistry } from '../../../lib/metrics';
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
  try {
    ensureInit();
    const metrics = await metricsRegistry.metrics;
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    getLogger().error({ err }, 'Metrics API error');
    return new NextResponse('# Error collecting metrics\n', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
