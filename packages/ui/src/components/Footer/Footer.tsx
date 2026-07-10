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
      <div className="py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-sm font-[500] text-text-primary mb-3">
              Odds<span className="text-pitch-green">Trust</span>
            </h3>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Autonomous on-chain trust oracle for sports betting odds verification.
              Powered by Solana.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[11px] text-text-secondary uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: "Dashboard", href: "/" },
                { label: "Live Matches", href: "/matches" },
                { label: "Proof Feed", href: "/proof-feed" },
                { label: "Oracle", href: "/oracle" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors no-underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] text-text-secondary uppercase tracking-wider mb-3">Developers</h4>
            <ul className="space-y-2">
              {[
                { label: "Documentation", href: "/docs" },
                { label: "API Reference", href: "/docs#api" },
                { label: "Consistency Formula", href: "/docs#formula" },
                { label: "On-Chain Program", href: "/docs#program" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors no-underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] text-text-secondary uppercase tracking-wider mb-3">Network Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-pitch-green animate-pulse-dot" />
                <span className="text-xs text-text-tertiary">Oracle Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-tertiary">Solana Devnet</span>
              </div>
              {slot && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-tertiary">Slot #{slot.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-line-hairline/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-text-tertiary">
              &copy; {new Date().getFullYear()} OddsTrust
            </span>
            <span className="h-3 w-px bg-line-hairline" />
            <span className="font-mono text-[10px] text-text-tertiary">On-Chain Trust Oracle</span>
          </div>
          <span className="font-mono text-[10px] text-text-tertiary opacity-40">
            NOT FINANCIAL ADVICE &middot; FOR DEMONSTRATION PURPOSES ONLY
          </span>
        </div>
      </div>
    </footer>
  );
}
