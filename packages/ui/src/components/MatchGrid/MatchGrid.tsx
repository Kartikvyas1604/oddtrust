"use client";

import React from "react";
import Link from "next/link";

type Status = "consistent" | "flagged" | "blocked";

interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: Status;
  margin: number;
  lastChecked: string;
}

export const fixtures: Fixture[] = [
  { id: "1", homeTeam: "FC Zenith", awayTeam: "Atlas United", status: "consistent", margin: 94.2, lastChecked: "12s ago" },
  { id: "2", homeTeam: "Stormhaven", awayTeam: "Northgate", status: "flagged", margin: 67.8, lastChecked: "23s ago" },
  { id: "3", homeTeam: "Ironbound FC", awayTeam: "Silverlake", status: "consistent", margin: 91.5, lastChecked: "5s ago" },
  { id: "4", homeTeam: "Crystal Palace", awayTeam: "Bridge City", status: "blocked", margin: 22.1, lastChecked: "47s ago" },
  { id: "5", homeTeam: "Red Star", awayTeam: "Blue United", status: "consistent", margin: 96.0, lastChecked: "2s ago" },
  { id: "6", homeTeam: "Eastside FC", awayTeam: "Westend Athletic", status: "flagged", margin: 58.4, lastChecked: "34s ago" },
];

const statusConfig: Record<Status, { label: string; color: string; dot: string; borderColor: string }> = {
  consistent: { label: "Consistent", color: "text-pitch-green", dot: "bg-pitch-green", borderColor: "border-line-hairline" },
  flagged: { label: "Flagged", color: "text-signal-amber", dot: "bg-signal-amber", borderColor: "border-l-signal-amber border-line-hairline" },
  blocked: { label: "Blocked", color: "text-signal-red", dot: "bg-signal-red", borderColor: "border-l-signal-red border-line-hairline" },
};

export function MatchCard({ fixture }: { fixture: Fixture }) {
  const cfg = statusConfig[fixture.status];
  return (
    <Link
      href={`/matches/${fixture.id}`}
      className={`group block bg-bg-raised border ${cfg.borderColor} rounded-lg p-5 no-underline transition-all duration-120 hover:-translate-y-0.5 hover:brightness-110 overflow-visible`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-sm text-text-primary font-[500] truncate">
          {fixture.homeTeam}
        </span>
        <span className="shrink-0 text-xs text-text-tertiary font-mono-data">vs</span>
        <span className="text-sm text-text-primary font-[500] truncate text-right">
          {fixture.awayTeam}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 text-xs font-mono-data ${cfg.color}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="font-mono-data text-xs text-text-primary">
          {fixture.margin}%
        </span>
      </div>
      <p className="text-[10px] font-mono-data text-text-tertiary mt-3">
        Checked {fixture.lastChecked}
      </p>
    </Link>
  );
}

export function MatchGrid({ preview }: { preview?: boolean }) {
  const displayFixtures = preview ? fixtures.slice(0, 3) : fixtures;
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-mono-data text-text-secondary uppercase tracking-[0.1em]">
          Live Match Trust Analysis
        </h2>
        {preview && (
          <Link
            href="/matches"
            className="text-xs font-mono-data text-text-secondary hover:text-text-primary transition-colors duration-200 no-underline"
          >
            View all &rarr;
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayFixtures.map((fixture, i) => (
          <div
            key={fixture.id}
            className="animate-stagger-fade opacity-0 overflow-visible"
            style={{ animationDelay: `${600 + i * 80}ms` }}
          >
            <MatchCard fixture={fixture} />
          </div>
        ))}
      </div>
    </section>
  );
}
