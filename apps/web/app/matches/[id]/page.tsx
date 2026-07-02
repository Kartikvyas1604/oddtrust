'use client';

import { use } from 'react';
import Link from 'next/link';
import { fixtures } from '@oddtrust/ui';

type Market =
  | { name: 'Match Winner'; homeOdds: number; awayOdds: number; drawOdds: number }
  | { name: 'Correct Score 1-0'; homeOdds: number; awayOdds: number; drawOdds: null }
  | { name: 'Over/Under 2.5'; overOdds: number; underOdds: number; drawOdds: null }
  | { name: 'Both Teams to Score'; yesOdds: number; noOdds: number; drawOdds: null };

const markets: Market[] = [
  { name: 'Match Winner', homeOdds: 1.85, awayOdds: 2.10, drawOdds: 3.40 },
  { name: 'Correct Score 1-0', homeOdds: 6.50, awayOdds: 7.20, drawOdds: null },
  { name: 'Over/Under 2.5', overOdds: 1.95, underOdds: 1.95, drawOdds: null },
  { name: 'Both Teams to Score', yesOdds: 1.80, noOdds: 2.05, drawOdds: null },
];

function impliedProbability(decimalOdds: number): number {
  return 1 / decimalOdds;
}

function formatProb(p: number): string {
  return (p * 100).toFixed(2) + '%';
}

function marketOddsFor(market: Market, home: string, away: string): { label: string; value: number }[] {
  switch (market.name) {
    case 'Match Winner':
      return [
        { label: `${home} (Home)`, value: market.homeOdds },
        { label: 'Draw', value: market.drawOdds },
        { label: `${away} (Away)`, value: market.awayOdds },
      ];
    case 'Over/Under 2.5':
      return [
        { label: 'Over 2.5', value: market.overOdds },
        { label: 'Under 2.5', value: market.underOdds },
      ];
    case 'Both Teams to Score':
      return [
        { label: 'Yes', value: market.yesOdds },
        { label: 'No', value: market.noOdds },
      ];
    case 'Correct Score 1-0':
      return [
        { label: `${home} 1-0`, value: market.homeOdds },
        { label: `${away} 1-0`, value: market.awayOdds },
      ];
  }
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const match = fixtures.find((f) => f.id === Number(id));

  if (!match) {
    return (
      <section className="px-6 py-20 text-center">
        <h1
          className="text-lg font-[500] text-[var(--color-text-secondary)] mb-4"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Match not found
        </h1>
        <Link
          href="/matches"
          className="text-sm text-[var(--color-text-tertiary)] underline hover:text-[var(--color-text-secondary)]"
          style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
        >
          &larr; Back to matches
        </Link>
      </section>
    );
  }

  const totalProb = markets.reduce((sum, m): number => {
    switch (m.name) {
      case 'Match Winner':
        return sum + impliedProbability(m.homeOdds) + impliedProbability(m.awayOdds) + impliedProbability(m.drawOdds);
      case 'Over/Under 2.5':
        return sum + impliedProbability(m.overOdds) + impliedProbability(m.underOdds);
      case 'Both Teams to Score':
        return sum + impliedProbability(m.yesOdds) + impliedProbability(m.noOdds);
      case 'Correct Score 1-0':
        return sum + impliedProbability(m.homeOdds) + impliedProbability(m.awayOdds);
    }
  }, 0);

  const marginPct = (totalProb - 1) * 100;
  const isConsistent = marginPct < 5;

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/matches"
            className="text-[11px] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
          >
            &larr; Back to matches
          </Link>
        </div>

        <div className="mb-8 rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-[500] uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-fraunces), serif',
                backgroundColor: isConsistent
                  ? 'color-mix(in srgb, var(--color-pitch-green) 8%, transparent)'
                  : 'color-mix(in srgb, var(--color-signal-amber) 8%, transparent)',
                color: isConsistent ? 'var(--color-pitch-green)' : 'var(--color-signal-amber)',
                border: `1px solid ${isConsistent ? 'color-mix(in srgb, var(--color-pitch-green) 20%, transparent)' : 'color-mix(in srgb, var(--color-signal-amber) 20%, transparent)'}`,
              }}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${isConsistent ? 'bg-[var(--color-pitch-green)]' : 'bg-[var(--color-signal-amber)]'}`}
              />
              {isConsistent ? 'Consistent' : 'Flagged'}
            </span>
            <span
              className="text-xs text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
            >
              Checks: {match.checks} &middot; Last: {match.lastChecked}
            </span>
          </div>

          <h1
            className="text-2xl font-[500] sm:text-3xl"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {match.home} <span className="text-[var(--color-text-tertiary)] font-[300]">v</span> {match.away}
          </h1>

          <div className="mt-4 flex items-center gap-4">
            <span
              className="text-sm text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
            >
              Margin
            </span>
            <span
              className="text-xl font-[500] tabular-nums"
              style={{
                fontFamily: 'var(--font-martian-mono), monospace',
                color: match.status === 'flagged' ? 'var(--color-signal-amber)' : match.margin >= 0 ? 'var(--color-pitch-green)' : 'var(--color-signal-red)',
              }}
            >
              {match.margin >= 0 ? '+' : ''}{match.margin.toFixed(2)}%
            </span>
          </div>
        </div>

        <h2
          className="mb-4 text-xs font-[400] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Market Breakdown
        </h2>

        <div className="space-y-3">
          {markets.map((market) => {
            const odds = marketOddsFor(market, match.home, match.away);

            const sumProbs = odds.reduce((s, o) => s + impliedProbability(o.value), 0);

            return (
              <div
                key={market.name}
                className="rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="text-xs font-[500] text-[var(--color-text-secondary)]"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    {market.name}
                  </span>
                  <span
                    className="text-[11px] tabular-nums"
                    style={{
                      fontFamily: 'var(--font-martian-mono), monospace',
                      color: sumProbs > 1.05
                        ? 'var(--color-signal-amber)'
                        : 'var(--color-pitch-green)',
                    }}
                  >
                    &Sigma; = {formatProb(sumProbs)}
                  </span>
                </div>
                <div className="space-y-2">
                  {odds.map((o) => {
                    const prob = impliedProbability(o.value);
                    return (
                      <div
                        key={o.label}
                        className="flex items-center justify-between border-b border-[var(--color-line-hairline)]/40 pb-1.5 text-[12px] last:border-b-0 last:pb-0"
                      >
                        <span
                          className="text-[var(--color-text-primary)]"
                          style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
                        >
                          {o.label}
                        </span>
                        <div className="flex items-center gap-4">
                          <span
                            className="tabular-nums text-[var(--color-text-tertiary)]"
                            style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                          >
                            {o.value.toFixed(2)}
                          </span>
                          <span
                            className="w-16 text-right tabular-nums text-[var(--color-text-secondary)]"
                            style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                          >
                            {formatProb(prob)}
                          </span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-bg-raised)]">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(prob * 100, 100)}%`,
                                backgroundColor: 'var(--color-pitch-green-dim)',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)] p-4">
          <h3
            className="mb-2 text-xs font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Consistency Check
          </h3>
          <p
            className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
          >
            Total implied probability across all markets: <strong style={{ fontFamily: 'var(--font-martian-mono), monospace', color: 'var(--color-text-primary)' }}>{formatProb(totalProb)}</strong>.
            Bookmaker margin: <strong style={{ fontFamily: 'var(--font-martian-mono), monospace', color: isConsistent ? 'var(--color-pitch-green)' : 'var(--color-signal-amber)' }}>{marginPct.toFixed(2)}%</strong>.
            {isConsistent
              ? ' Margins are within the expected range — odds are consistent.'
              : ' Margins exceed the expected threshold — odds may be inconsistent.'}
          </p>
        </div>
      </div>
    </section>
  );
}
