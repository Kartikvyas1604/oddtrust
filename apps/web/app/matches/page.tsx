'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { fixtures, MatchCard } from '@oddtrust/ui';

type Filter = 'all' | 'consistent' | 'flagged' | 'blocked';
type Sort = 'margin' | 'id';

export default function MatchesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('margin');

  const filtered = useMemo(() => {
    let list = filter === 'all' ? [...fixtures] : fixtures.filter((f) => f.status === filter);
    list.sort((a, b) => {
      if (sort === 'margin') return Math.abs(b.margin) - Math.abs(a.margin);
      return Number(a.id) - Number(b.id);
    });
    return list;
  }, [filter, sort]);

  return (
    <section className="py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-sm font-mono-data text-text-secondary uppercase tracking-[0.12em]">
            Live Match Grid
          </h1>
          <p className="mt-1 text-xs text-text-tertiary">
            {fixtures.length} fixtures tracked
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-sm border border-line-hairline overflow-hidden">
            {(['all', 'consistent', 'flagged', 'blocked'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors ${
                  filter === f
                    ? 'bg-bg-raised text-text-primary'
                    : 'bg-transparent text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-sm border border-line-hairline bg-bg-panel px-3 py-1.5 text-[11px] font-mono-data uppercase tracking-wider text-text-tertiary outline-none hover:text-text-secondary transition-colors"
          >
            <option value="margin">By Margin</option>
            <option value="id">By Kickoff</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((fixture) => (
          <MatchCard key={fixture.id} fixture={fixture} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-text-tertiary">
          No {filter} matches found.
        </p>
      )}

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
