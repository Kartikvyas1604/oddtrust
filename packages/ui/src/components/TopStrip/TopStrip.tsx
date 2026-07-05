"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Oracle", href: "/oracle" },
  { label: "Matches", href: "/matches" },
  { label: "Proof Feed", href: "/proof-feed" },
  { label: "Docs", href: "/docs" },
];

export function TopStrip() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-6 py-3 border-b border-line-hairline">
      {/* wordmark */}
      <Link
        href="/"
        className="shrink-0 text-lg font-[500] tracking-tight text-text-primary hover:text-pitch-green transition-colors duration-200 no-underline"
      >
        Odds<span className="text-pitch-green">Trust</span>
      </Link>

      {/* nav links */}
      <nav className="flex items-center gap-6 overflow-x-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 text-sm transition-colors duration-200 no-underline whitespace-nowrap ${
              pathname === link.href
                ? "text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* oracle status + slot */}
      <div className="flex items-center gap-4 font-mono-data shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-pitch-green">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-pitch-green animate-pulse-dot" />
          <span className="hidden sm:inline">Oracle Active</span>
          <span className="sm:hidden">Live</span>
        </div>
        <span className="hidden sm:block text-xs text-text-tertiary">
          Slot 284,391,882
        </span>
      </div>
    </header>
  );
}
