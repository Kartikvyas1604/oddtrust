"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Status = "consistent" | "flagged" | "blocked";

export interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: Status;
  margin: number;
  lastChecked: string;
}

function mapConsistentToStatus(isConsistent: boolean | null): Status {
  if (isConsistent === false) return "flagged";
  if (isConsistent === true) return "consistent";
  return "blocked";
}

const statusTheme: Record<Status, { label: string; text: string; dot: string; border: string }> = {
  consistent: { label: "Consistent", text: "text-pitch-green", dot: "bg-pitch-green", border: "border-line-hairline" },
  flagged: { label: "Flagged", text: "text-signal-amber", dot: "bg-signal-amber", border: "border-l-signal-amber border-line-hairline" },
  blocked: { label: "Blocked", text: "text-signal-red", dot: "bg-signal-red", border: "border-l-signal-red border-line-hairline" },
};

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

export function MatchCard({ fixture, delay = 0 }: { fixture: Fixture; delay?: number }) {
  const t = statusTheme[fixture.status];
  return (
    <Link
      href={`/matches/${fixture.id}`}
      className={`block bg-bg-raised border ${t.border} rounded-lg p-6 no-underline transition-all duration-120 hover:-translate-y-0.5 hover:brightness-110 animate-fade-up opacity-0`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-sm font-[500] text-text-primary truncate">{fixture.homeTeam}</span>
        <span className="shrink-0 text-xs text-text-tertiary font-mono">vs</span>
        <span className="text-sm font-[500] text-text-primary truncate text-right">{fixture.awayTeam}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 text-xs font-mono ${t.text}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${t.dot}`} />
          {t.label}
        </span>
        <span className="font-mono text-xs text-text-primary">{fixture.margin.toFixed(1)}%</span>
      </div>
      <p className="font-mono text-[10px] text-text-tertiary mt-3">Checked {fixture.lastChecked}</p>
    </Link>
  );
}

interface ApiMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  isConsistent: boolean | null;
  latestMargin: number | null;
  lastCheckTime: string | null;
}

export function MatchGrid({ preview }: { preview?: boolean }) {
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = preview ? "?limit=6&sort=recent" : "?limit=50&sort=margin";
    fetch(`/api/matches${params}`)
      .then((r) => r.json())
      .then((data) => {
        setMatches(data.matches ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [preview]);

  const items: Fixture[] = matches.map((m) => ({
    id: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    status: mapConsistentToStatus(m.isConsistent),
    margin: m.latestMargin ?? 0,
    lastChecked: relativeTime(m.lastCheckTime),
  }));

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em]">
          Live Match Trust Analysis
        </h2>
        {preview && (
          <Link href="/matches" className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors no-underline">
            View all &rarr;
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-bg-raised border border-line-hairline rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-bg-void rounded w-3/4 mb-3" />
            <div className="h-4 bg-bg-void rounded w-1/2 mb-3" />
            <div className="h-3 bg-bg-void rounded w-1/3" />
          </div>
        ))}
        {items.map((f, i) => (
          <MatchCard key={f.id} fixture={f} delay={700 + i * 80} />
        ))}
        {!loading && items.length === 0 && (
          <p className="col-span-full text-center font-mono text-xs text-text-tertiary py-8">
            No matches tracked yet.
          </p>
        )}
      </div>
    </section>
  );
}
