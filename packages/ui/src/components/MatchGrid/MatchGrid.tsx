'use client';

import Link from 'next/link';

export interface Fixture {
  id: number;
  home: string;
  away: string;
  margin: number;
  status: 'consistent' | 'flagged';
  checks: number;
  lastChecked: string;
}

export const fixtures: Fixture[] = [
  { id: 1, home: 'Brazil', away: 'Argentina', margin: 2.34, status: 'consistent', checks: 42, lastChecked: '07:29:41' },
  { id: 2, home: 'Germany', away: 'France', margin: -1.12, status: 'consistent', checks: 38, lastChecked: '07:28:15' },
  { id: 3, home: 'England', away: 'Spain', margin: 0.47, status: 'flagged', checks: 51, lastChecked: '07:30:02' },
  { id: 4, home: 'Portugal', away: 'Netherlands', margin: 3.01, status: 'consistent', checks: 29, lastChecked: '07:27:44' },
  { id: 5, home: 'Italy', away: 'Croatia', margin: -0.88, status: 'consistent', checks: 35, lastChecked: '07:29:10' },
  { id: 6, home: 'Belgium', away: 'Morocco', margin: 5.62, status: 'flagged', checks: 47, lastChecked: '07:28:58' },
  { id: 7, home: 'Senegal', away: 'Japan', margin: 1.23, status: 'consistent', checks: 23, lastChecked: '07:26:30' },
  { id: 8, home: 'USA', away: 'Mexico', margin: -2.45, status: 'consistent', checks: 31, lastChecked: '07:29:22' },
  { id: 9, home: 'Australia', away: 'Denmark', margin: 0.09, status: 'flagged', checks: 44, lastChecked: '07:27:03' },
];

function StatusBadge({ status }: { status: 'consistent' | 'flagged' }) {
  const isConsistent = status === 'consistent';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-[500] uppercase tracking-wider"
      style={{
        fontFamily: 'var(--font-fraunces), serif',
        backgroundColor: isConsistent
          ? 'color-mix(in srgb, var(--color-pitch-green) 8%, transparent)'
          : 'color-mix(in srgb, var(--color-signal-amber) 8%, transparent)',
        color: isConsistent ? 'var(--color-pitch-green)' : 'var(--color-signal-amber)',
        border: `1px solid ${
          isConsistent
            ? 'color-mix(in srgb, var(--color-pitch-green) 20%, transparent)'
            : 'color-mix(in srgb, var(--color-signal-amber) 20%, transparent)'
        }`,
      }}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${isConsistent ? 'bg-[var(--color-pitch-green)]' : 'bg-[var(--color-signal-amber)]'}`}
      />
      {isConsistent ? 'Consistent' : 'Flagged'}
    </span>
  );
}

export function MatchCard({ match, index }: { match: Fixture; index: number }) {
  const isFlagged = match.status === 'flagged';

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block rounded-sm transition-all duration-100 ease-linear will-change-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40"
      style={{ animation: `stagger-fade 0.5s ease-out ${300 + index * 60}ms both` }}
    >
      <div
        className="rounded-sm border p-4 transition-all duration-100"
        style={{
          borderColor: isFlagged
            ? 'color-mix(in srgb, var(--color-signal-amber) 30%, transparent)'
            : 'var(--color-line-hairline)',
          backgroundColor: isFlagged
            ? 'color-mix(in srgb, var(--color-signal-amber) 3%, var(--color-bg-panel))'
            : 'var(--color-bg-panel)',
          borderLeft: isFlagged ? '3px solid var(--color-signal-amber)' : '3px solid transparent',
          ...(isFlagged ? {} : { borderLeft: '3px solid transparent' }),
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <StatusBadge status={match.status} />
          <span
            className="text-xs tabular-nums text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
          >
            Checks: {match.checks}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-sm font-[500] text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {match.home}
          </span>
          <span
            className="text-sm text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
          >
            v
          </span>
          <span
            className="text-sm font-[500] text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            {match.away}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[var(--color-line-hairline)] pt-3">
          <span
            className="text-[11px] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
          >
            Margin
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
            >
              Last: {match.lastChecked}
            </span>
            <span
              className="text-sm font-[500] tabular-nums"
              style={{
                fontFamily: 'var(--font-martian-mono), monospace',
                color: isFlagged
                  ? 'var(--color-signal-amber)'
                  : match.margin >= 0
                    ? 'var(--color-pitch-green)'
                    : 'var(--color-signal-red)',
              }}
            >
              {match.margin >= 0 ? '+' : ''}{match.margin.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MatchGrid({ preview = false }: { preview?: boolean }) {
  const displayFixtures = preview ? fixtures.slice(0, 5) : fixtures;

  return (
    <section className="border-b border-[var(--color-line-hairline)] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              className="mb-1 text-sm font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              {preview ? 'Live Matches' : 'Live Match Grid'}
            </h2>
            <p
              className="text-xs text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
            >
              Real-time margin consistency across {fixtures.length} fixtures
            </p>
          </div>
          {preview && (
            <a
              href="/matches"
              className="rounded-sm border border-[var(--color-line-hairline)] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[var(--color-text-tertiary)] transition-colors hover:border-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
            >
              View all matches &rarr;
            </a>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayFixtures.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
