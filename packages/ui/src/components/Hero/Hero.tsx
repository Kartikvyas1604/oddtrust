"use client";

import { useEffect, useRef, useState } from "react";

function CountUp({ end, duration, suffix = "" }: { end: number; duration: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = 0;
    function tick(now: number) {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / duration, 1);
      setValue(Math.floor(p * end));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration]);

  return (
    <span className="tabular-nums">
      {value}{suffix}
    </span>
  );
}

export function Hero() {
  const [stats, setStats] = useState<{
    trustScore: number;
    fixturesTracked: number;
    totalChecks: number;
    flaggedMarkets: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/overview")
      .then((r) => r.json())
      .then((data) => {
        setStats({
          trustScore: data.trustScore ?? 0,
          fixturesTracked: data.fixturesTracked ?? 0,
          totalChecks: data.totalChecks ?? 0,
          flaggedMarkets: data.flaggedMarkets ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  const statCards = [
    {
      label: "Matches Audited",
      value: stats?.fixturesTracked ?? 0,
      color: "text-text-primary",
      dot: "bg-text-tertiary",
    },
    {
      label: "Consistency Checks",
      value: stats?.totalChecks ?? 0,
      color: "text-pitch-green",
      dot: "bg-pitch-green",
    },
    {
      label: "Inconsistencies Found",
      value: stats?.flaggedMarkets ?? 0,
      color: "text-signal-amber",
      dot: "bg-signal-amber",
    },
  ];

  return (
    <section className="relative py-24 text-center animate-fade-up opacity-0 overflow-hidden">
      {/* Background glow behind score */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none opacity-[0.04] -z-10"
        style={{
          background: "radial-gradient(ellipse, #D4AF6A, transparent 70%)",
        }}
      />

      <p className="text-sm font-mono text-text-secondary uppercase tracking-[0.2em] mb-5">
        Tournament Trust Score
      </p>
      <h1 className="text-8xl md:text-[10rem] font-[600] tracking-tight leading-none text-trophy-gold">
        <CountUp end={stats?.trustScore ?? 0} duration={800} suffix="%" />
      </h1>

      <div className="mt-16 flex justify-center gap-5 max-w-2xl mx-auto">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="flex-1 bg-bg-raised/60 border border-line-hairline/50 rounded-xl p-6 text-center backdrop-blur-sm"
          >
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-void/80 mb-3">
              <span className={`inline-block w-2 h-2 rounded-full ${s.dot}`} />
            </div>
            <p className={`font-mono text-3xl font-[400] tabular-nums mb-1.5 ${s.color}`}>
              <CountUp end={s.value} duration={800} />
            </p>
            <p className="text-xs text-text-secondary uppercase tracking-wider font-mono">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Sweep glow */}
      <div
        className="absolute left-0 right-0 top-1/3 h-40 pointer-events-none overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div
          className="absolute inset-y-0 w-[25%] animate-sweep opacity-[0.03]"
          style={{
            background: "linear-gradient(90deg, transparent, #1E7A3E, transparent)",
          }}
        />
      </div>
    </section>
  );
}
