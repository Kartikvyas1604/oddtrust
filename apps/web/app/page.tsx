"use client";

import { Hero, MatchGrid, GatePanel, ProofFeed } from "@oddtrust/ui";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HealthStat {
  totalChecks: number;
  consistencyRate: number;
  currentSlot: number | null;
  connectedAgents: number;
}

const defaults: HealthStat = {
  totalChecks: 0,
  consistencyRate: 0,
  currentSlot: null,
  connectedAgents: 0,
};

export default function Home() {
  const [health, setHealth] = useState<HealthStat>(defaults);

  useEffect(() => {
    fetch("/api/network-health")
      .then((r) => r.json())
      .then((data) => {
        setHealth({
          totalChecks: data.totalChecks ?? 0,
          consistencyRate: data.consistencyRate ?? 0,
          currentSlot: data.currentSlot ?? null,
          connectedAgents: data.connectedAgents ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  const stats = [
    { label: "Total Checks", value: health.totalChecks.toLocaleString() },
    { label: "Consistency Rate", value: `${health.consistencyRate.toFixed(2)}%`, accent: true },
    { label: "Last Slot", value: health.currentSlot ? `#${health.currentSlot.toLocaleString()}` : "---" },
    { label: "Agents Connected", value: String(health.connectedAgents) },
  ];

  return (
    <>
      <Hero />

      <section className="py-12 border-t border-line-hairline">
        <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-5">
          Network Health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-hairline rounded-lg overflow-hidden">
          {stats.map((s) => (
            <div key={s.label} className="bg-bg-raised p-6">
              <p className="text-[11px] text-text-secondary uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`font-mono text-lg ${s.accent ? "text-pitch-green" : "text-text-primary"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 border-t border-line-hairline">
        <MatchGrid preview />
      </section>

      <section className="py-12 border-t border-line-hairline">
        <GatePanel />
      </section>

      <section className="py-12 border-t border-line-hairline">
        <ProofFeed />
      </section>

      <section className="py-16 border-t border-line-hairline">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-4">
            Built for Composability
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-8">
            OddsTrust is an autonomous on-chain trust oracle that verifies the consistency of sports
            betting odds across multiple markets. Every check produces a cryptographically verifiable
            proof committed to Solana.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg-raised border border-line-hairline rounded-lg text-sm text-text-primary hover:border-pitch-green/30 hover:text-pitch-green transition-all no-underline"
            >
              <span>Read the Docs</span>
              <span className="font-mono text-xs">&rarr;</span>
            </Link>
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-pitch-green/10 border border-pitch-green/20 rounded-lg text-sm text-pitch-green hover:bg-pitch-green/15 transition-all no-underline"
            >
              <span>View Live Matches</span>
              <span className="font-mono text-xs">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
