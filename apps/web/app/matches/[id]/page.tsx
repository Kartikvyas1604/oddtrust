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
  const match = fixtures.find((f) => f.id === id);

  if (!match) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-lg font-[500] text-text-secondary mb-4">
          Match not found
        </h1>
        <Link
          href="/matches"
          className="font-mono-data text-sm text-text-tertiary underline hover:text-text-secondary"
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
    <section className="py-12">
      <div className="mb-6">
        <Link
          href="/matches"
          className="font-mono-data text-[11px] text-text-tertiary hover:text-text-secondary transition-colors"
        >
          &larr; Back to matches
        </Link>
      </div>

      <div className="mb-8 rounded-lg border border-line-hairline bg-bg-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wider border ${
              isConsistent
                ? 'text-pitch-green border-pitch-green/20 bg-pitch-green/10'
                : 'text-signal-amber border-signal-amber/20 bg-signal-amber/10'
            }`}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${isConsistent ? 'bg-pitch-green' : 'bg-signal-amber'}`} />
            {isConsistent ? 'Consistent' : 'Flagged'}
          </span>
          <span className="font-mono-data text-xs text-text-tertiary">
            Last: {match.lastChecked}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-[500]">
          {match.homeTeam} <span className="text-text-tertiary font-[300]">v</span> {match.awayTeam}
        </h1>

        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-text-secondary">Margin</span>
          <span
            className={`font-mono-data text-xl tabular-nums ${
              match.status === 'flagged'
                ? 'text-signal-amber'
                : match.status === 'blocked'
                ? 'text-signal-red'
                : 'text-pitch-green'
            }`}
          >
            {match.margin >= 0 ? '+' : ''}{match.margin.toFixed(2)}%
          </span>
        </div>
      </div>

      <h2 className="mb-4 text-xs uppercase tracking-[0.15em] text-text-secondary">
        Market Breakdown
      </h2>

      <div className="space-y-3">
        {markets.map((market) => {
          const odds = marketOddsFor(market, match.homeTeam, match.awayTeam);
          const sumProbs = odds.reduce((s, o) => s + impliedProbability(o.value), 0);

          return (
            <div
              key={market.name}
              className="rounded-lg border border-line-hairline bg-bg-panel p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-[500] text-text-secondary">
                  {market.name}
                </span>
                <span
                  className={`font-mono-data text-[11px] tabular-nums ${
                    sumProbs > 1.05 ? 'text-signal-amber' : 'text-pitch-green'
                  }`}
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
                      className="flex items-center justify-between border-b border-line-hairline/40 pb-1.5 text-[12px] last:border-b-0 last:pb-0"
                    >
                      <span className="text-text-primary">{o.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono-data tabular-nums text-text-tertiary">
                          {o.value.toFixed(2)}
                        </span>
                        <span className="font-mono-data w-16 text-right tabular-nums text-text-secondary">
                          {formatProb(prob)}
                        </span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg-raised">
                          <div
                            className="h-full rounded-full transition-all bg-pitch-green-dim"
                            style={{ width: `${Math.min(prob * 100, 100)}%` }}
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

      <div className="mt-8 rounded-lg border border-line-hairline bg-bg-panel p-6">
        <h3 className="mb-2 text-xs uppercase tracking-[0.12em] text-text-secondary">
          Consistency Check
        </h3>
        <p className="text-[12px] leading-relaxed text-text-secondary">
          Total implied probability across all markets: <strong className="font-mono-data text-text-primary">{formatProb(totalProb)}</strong>.
          Bookmaker margin: <strong className={`font-mono-data ${isConsistent ? 'text-pitch-green' : 'text-signal-amber'}`}>{marginPct.toFixed(2)}%</strong>.
          {isConsistent
            ? ' Margins are within the expected range — odds are consistent.'
            : ' Margins exceed the expected threshold — odds may be inconsistent.'}
        </p>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="font-mono-data text-xs text-text-secondary hover:text-text-primary transition-colors no-underline"
        >
          &larr; Back to home
        </Link>
      </div>
    </section>
  );
}
