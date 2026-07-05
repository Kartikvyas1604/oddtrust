"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fixtures, MatchCard } from "@oddtrust/ui";

type Filter = "all" | "consistent" | "flagged" | "blocked";
type Sort = "margin" | "id";

export default function MatchesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("margin");

  const list = useMemo(() => {
    const f = filter === "all" ? [...fixtures] : fixtures.filter((x) => x.status === filter);
    f.sort((a, b) => (sort === "margin" ? Math.abs(b.margin) - Math.abs(a.margin) : Number(a.id) - Number(b.id)));
    return f;
  }, [filter, sort]);

  return (
    <section className="py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em]">Live Match Grid</h1>
          <p className="text-xs text-text-tertiary mt-1">{fixtures.length} fixtures tracked</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded border border-line-hairline overflow-hidden">
            {(["all", "consistent", "flagged", "blocked"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors ${
                  filter === f ? "bg-bg-raised text-text-primary" : "bg-transparent text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded border border-line-hairline bg-bg-panel px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-text-tertiary outline-none hover:text-text-secondary transition-colors"
          >
            <option value="margin">By Margin</option>
            <option value="id">By Kickoff</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((f, i) => (
          <MatchCard key={f.id} fixture={f} delay={200 + i * 60} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="py-16 text-center text-sm text-text-tertiary">No {filter} matches found.</p>
      )}

      <div className="mt-8">
        <Link href="/" className="font-mono text-xs text-text-secondary hover:text-text-primary transition-colors no-underline">
          &larr; Back to home
        </Link>
      </div>
    </section>
  );
}
