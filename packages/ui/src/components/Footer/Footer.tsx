"use client";

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
    <footer className="mt-auto border-t border-line-hairline">
      <div className="py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="text-lg font-[500] tracking-tight text-text-primary mb-3">
              Odds<span className="text-pitch-green">Trust</span>
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Autonomous on-chain trust oracle for sports betting odds verification.
              Powered by Solana.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs text-text-primary uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Dashboard", href: "/" },
                { label: "Live Matches", href: "/matches" },
                { label: "Proof Feed", href: "/proof-feed" },
                { label: "Oracle", href: "/oracle" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors no-underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs text-text-primary uppercase tracking-wider mb-4">Developers</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Documentation", href: "/docs" },
                { label: "API Reference", href: "/docs#api" },
                { label: "Consistency Formula", href: "/docs#formula" },
                { label: "On-Chain Program", href: "/docs#program" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors no-underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs text-text-primary uppercase tracking-wider mb-4">Network Status</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-block w-2 h-2 rounded-full bg-pitch-green animate-pulse-dot" />
                <span className="text-sm text-text-secondary">Oracle Active</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm text-text-secondary">Solana Devnet</span>
              </div>
              {slot && (
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm text-text-secondary">Slot #{slot.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-7 border-t border-line-hairline/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-text-tertiary">
              &copy; {new Date().getFullYear()} OddsTrust
            </span>
            <span className="h-3.5 w-px bg-line-hairline" />
            <span className="font-mono text-xs text-text-tertiary">On-Chain Trust Oracle</span>
          </div>
          <span className="font-mono text-xs text-text-tertiary opacity-40">
            NOT FINANCIAL ADVICE &middot; FOR DEMONSTRATION PURPOSES ONLY
          </span>
        </div>
      </div>
    </footer>
  );
}
