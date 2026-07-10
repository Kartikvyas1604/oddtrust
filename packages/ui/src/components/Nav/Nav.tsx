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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/network-health")
      .then((r) => r.json())
      .then((data) => {
        if (data.currentSlot) setSlot(data.currentSlot);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-void/80 backdrop-blur-xl border-b border-line-hairline/60 shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          : "bg-transparent border-b border-line-hairline/30"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 flex items-center justify-between h-16">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-0.5 text-xl font-[600] tracking-tight text-text-primary hover:opacity-80 transition-opacity no-underline shrink-0"
        >
          <span>Odds</span>
          <span className="text-pitch-green">Trust</span>
        </Link>

        {/* Center nav */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active =
              l.href === "/matches"
                ? pathname.startsWith("/matches")
                : pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-3.5 py-1.5 text-sm rounded-md transition-all duration-200 no-underline whitespace-nowrap ${
                  active
                    ? "text-text-primary font-[500] bg-bg-raised/80"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-raised/40"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-3.5 -bottom-[13px] h-[2px] bg-pitch-green rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side — live indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-line-hairline/50 bg-bg-raised/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-pitch-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pitch-green" />
            </span>
            <span className="font-mono text-xs text-text-secondary hidden sm:inline">Live</span>
          </div>
          <span className="font-mono text-xs text-text-tertiary hidden lg:block">
            {slot ? `#${slot.toLocaleString()}` : "---"}
          </span>
        </div>
      </div>
    </header>
  );
}
