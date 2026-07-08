"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { label: "Oracle", href: "/oracle" },
  { label: "Matches", href: "/matches" },
  { label: "Proof Feed", href: "/proof-feed" },
  { label: "Docs", href: "/docs" },
];

export function Nav() {
  const pathname = usePathname();
  const [slot, setSlot] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/network-health")
      .then((r) => r.json())
      .then((data) => {
        if (data.currentSlot) setSlot(data.currentSlot);
      })
      .catch(() => {
        if (!error) setError(true);
      });
  }, [error]);

  return (
    <header className="relative flex items-center justify-between py-4 border-b border-line-hairline animate-fade-up opacity-0">
      <Link
        href="/"
        className="text-lg font-[500] tracking-tight text-text-primary hover:text-pitch-green transition-colors no-underline"
      >
        Odds<span className="text-pitch-green">Trust</span>
      </Link>

      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
        {links.map((l) => {
          const active = l.href === "/matches" ? pathname.startsWith("/matches") : pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 text-sm no-underline whitespace-nowrap transition-colors ${
                active
                  ? "text-text-primary font-[500] border-b border-pitch-green pb-0.5"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4 font-mono">
        <div className="flex items-center gap-1.5 text-xs text-pitch-green">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-pitch-green animate-pulse-dot" />
          <span className="hidden sm:inline">Oracle Active</span>
          <span className="sm:hidden">Live</span>
        </div>
        <span className="hidden md:block text-xs text-text-tertiary">
          {slot ? `#${slot.toLocaleString()}` : "---"}
        </span>
      </div>
    </header>
  );
}
