'use client';

import { useState, useMemo } from 'react';
import { fixtures, MatchCard } from '@oddtrust/ui';

interface Fixture {
  id: number; home: string; away: string; margin: number;
  status: 'consistent' | 'flagged'; checks: number; lastChecked: string;
}

type Filter = 'all' | 'consistent' | 'flagged';
type Sort = 'margin' | 'checks' | 'id';

export default function MatchesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('margin');

  const filtered = useMemo(() => {
    let list: Fixture[];
    if (filter === 'consistent') list = fixtures.filter((f) => f.status === 'consistent');
    else if (filter === 'flagged') list = fixtures.filter((f) => f.status === 'flagged');
    else list = [...fixtures];

    list.sort((a, b) => {
      if (sort === 'margin') return Math.abs(b.margin) - Math.abs(a.margin);
      if (sort === 'checks') return b.checks - a.checks;
      return a.id - b.id;
    });

    return list;
  }, [filter, sort]);

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-sm font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Live Match Grid
            </h1>
            <p
              className="mt-1 text-xs text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
            >
              {fixtures.length} fixtures tracked
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-sm border border-[var(--color-line-hairline)] overflow-hidden">
              {(['all', 'consistent', 'flagged'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors"
                  style={{
                    fontFamily: 'var(--font-fraunces), serif',
                    backgroundColor: filter === f
                      ? 'var(--color-bg-raised)'
                      : 'transparent',
                    color: filter === f
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-tertiary)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[var(--color-text-tertiary)] outline-none transition-colors hover:text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
            >
              <option value="margin">By Margin</option>
              <option value="checks">By Checks</option>
              <option value="id">By Kickoff</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p
            className="py-12 text-center text-sm text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            No {filter} matches found.
          </p>
        )}
      </div>
    </section>
  );
}
