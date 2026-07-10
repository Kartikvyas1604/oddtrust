"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MatchCard } from "@oddtrust/ui";
import type { Fixture } from "@oddtrust/ui";

type Filter = "all" | "consistent" | "flagged" | "blocked";
type Sort = "margin" | "recent";

interface ApiMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  isConsistent: boolean | null;
  latestMargin: number | null;
  lastCheckTime: string | null;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("margin");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/matches?limit=100&sort=margin")
      .then((r) => r.json())
      .then((data) => {
        setMatches(data.matches ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const list = useMemo(() => {
    let f = filter === "all" ? [...matches] : matches.filter((x) => {
      if (filter === "blocked") return x.isConsistent === null;
      if (filter === "flagged") return x.isConsistent === false;
      if (filter === "consistent") return x.isConsistent === true;
      return true;
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter((x) =>
        x.homeTeam.toLowerCase().includes(q) ||
        x.awayTeam.toLowerCase().includes(q) ||
        x.id.toLowerCase().includes(q)
      );
    }

    f.sort((a, b) => {
      if (sort === "margin") return Math.abs(b.latestMargin ?? 0) - Math.abs(a.latestMargin ?? 0);
      return new Date(b.lastCheckTime ?? 0).getTime() - new Date(a.lastCheckTime ?? 0).getTime();
    });

    return f;
  }, [matches, filter, sort, search]);

  const counts = useMemo(() => ({
    all: matches.length,
    consistent: matches.filter((x) => x.isConsistent === true).length,
    flagged: matches.filter((x) => x.isConsistent === false).length,
    blocked: matches.filter((x) => x.isConsistent === null).length,
  }), [matches]);

  return (
    <section className="py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-[11px] text-pitch-green uppercase tracking-wider mb-1">Matches</p>
          <h1 className="text-2xl font-[500] mb-1">Live Match Grid</h1>
          <p className="text-xs text-text-tertiary">{matches.length} fixtures tracked</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams..."
            className="w-40 bg-bg-raised border border-line-hairline rounded-lg px-3 py-1.5 text-[11px] font-mono text-text-primary placeholder:text-text-tertiary outline-none focus:border-pitch-green/30 transition-colors"
          />
          <div className="flex rounded border border-line-hairline overflow-hidden">
            {(["all", "consistent", "flagged", "blocked"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors ${
                  filter === f ? "bg-bg-raised text-text-primary" : "bg-transparent text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {f} <span className="text-text-tertiary/50 ml-0.5">{counts[f]}</span>
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded border border-line-hairline bg-bg-raised px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-text-tertiary outline-none hover:text-text-secondary transition-colors"
          >
            <option value="margin">By Margin</option>
            <option value="recent">By Recent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-bg-raised border border-line-hairline rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-bg-void rounded w-3/4 mb-3" />
            <div className="h-4 bg-bg-void rounded w-1/2 mb-3" />
            <div className="h-3 bg-bg-void rounded w-1/3" />
          </div>
        ))}
        {list.map((m, i) => (
          <MatchCard
            key={m.id}
            fixture={{
              id: m.id,
              homeTeam: m.homeTeam,
              awayTeam: m.awayTeam,
              status: m.isConsistent === false ? "flagged" : m.isConsistent === true ? "consistent" : "blocked",
              margin: m.latestMargin ?? 0,
              lastChecked: m.lastCheckTime
                ? (() => {
                    const diff = Date.now() - new Date(m.lastCheckTime!).getTime();
                    const sec = Math.floor(diff / 1000);
                    if (sec < 5) return "just now";
                    if (sec < 60) return `${sec}s ago`;
                    const min = Math.floor(sec / 60);
                    if (min < 60) return `${min}m ago`;
                    return `${Math.floor(min / 60)}h ago`;
                  })()
                : "never",
            }}
            delay={200 + i * 60}
          />
        ))}
      </div>

      {!loading && list.length === 0 && (
        <p className="py-16 text-center text-sm text-text-tertiary">
          {search ? `No matches matching "${search}"` : `No ${filter !== "all" ? filter : ""} matches found.`}
        </p>
      )}

      <div className="mt-8">
        <Link href="/" className="font-mono text-xs text-text-secondary hover:text-text-primary transition-colors no-underline">
          &larr; Back to home
        </Link>
      </div>
    </section>
  );
}
