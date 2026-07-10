"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer() {
  const [slot, setSlot] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/network-health")
      .then((r) => r.json())
      .then((d) => setSlot(d.currentSlot ?? null))
      .catch(() => {});
  }, []);

  return (
    <footer className="relative mt-auto">
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-line-hairline to-transparent" />

      <div className="py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-14">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-0.5 text-xl font-[600] tracking-tight text-text-primary no-underline mb-4">
              <span>Odds</span>
              <span className="text-pitch-green">Trust</span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Autonomous on-chain trust oracle for sports betting odds verification. 
              Detects anomalies, computes arbitrage, and publishes proofs to Solana.
            </p>
          </div>

          {/* Platform */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-[500] text-text-primary mb-4">Platform</h4>
            <ul className="space-y-3">
              {[
                { label: "Dashboard", href: "/" },
                { label: "Live Matches", href: "/matches" },
                { label: "Proof Feed", href: "/proof-feed" },
                { label: "Oracle", href: "/oracle" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 no-underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-[500] text-text-primary mb-4">Developers</h4>
            <ul className="space-y-3">
              {[
                { label: "Documentation", href: "/docs" },
                { label: "API Reference", href: "/docs#api" },
                { label: "Consistency Formula", href: "/docs#formula" },
                { label: "On-Chain Program", href: "/docs#program" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 no-underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Network Status */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-[500] text-text-primary mb-4">Network Status</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-pitch-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pitch-green" />
                </span>
                <span className="text-sm text-text-secondary">Oracle Active</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 shrink-0" />
                <span className="font-mono text-sm text-text-secondary">Solana Devnet</span>
              </div>
              {slot && (
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 shrink-0" />
                  <span className="font-mono text-sm text-text-secondary">
                    Slot #{slot.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-7 border-t border-line-hairline/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span>&copy; {new Date().getFullYear()} OddsTrust</span>
              <span className="h-3 w-px bg-line-hairline/60" />
              <span>On-Chain Trust Oracle</span>
              <span className="h-3 w-px bg-line-hairline/60" />
              <span>Solana Devnet</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary/50">
              Not financial advice
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
