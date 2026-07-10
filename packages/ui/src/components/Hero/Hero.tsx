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

  return <span>{value}{suffix}</span>;
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

  return (
    <section className="relative py-20 text-center animate-fade-up opacity-0">
      <p className="text-sm font-mono text-text-secondary uppercase tracking-[0.15em] mb-4">
        Tournament Trust Score
      </p>
      <h1 className="text-7xl md:text-9xl font-[500] tracking-tight leading-none text-trophy-gold">
        <CountUp end={stats?.trustScore ?? 0} duration={800} suffix="%" />
      </h1>

      <div className="mt-14 flex justify-center gap-5">
        <div className="bg-bg-raised border border-line-hairline rounded-lg p-6 min-w-[180px] flex-1 max-w-[240px] text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-void mb-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-text-tertiary" />
          </div>
          <p className="font-mono text-3xl text-text-primary mb-1">
            <CountUp end={stats?.fixturesTracked ?? 0} duration={800} />
          </p>
          <p className="text-xs text-text-secondary uppercase tracking-wider">Matches Audited</p>
        </div>
        <div className="bg-bg-raised border border-line-hairline rounded-lg p-6 min-w-[180px] flex-1 max-w-[240px] text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-void mb-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-pitch-green" />
          </div>
          <p className="font-mono text-3xl text-pitch-green mb-1">
            <CountUp end={stats?.totalChecks ?? 0} duration={800} />
          </p>
          <p className="text-xs text-text-secondary uppercase tracking-wider">Consistency Checks</p>
        </div>
        <div className="bg-bg-raised border border-line-hairline rounded-lg p-6 min-w-[180px] flex-1 max-w-[240px] text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-void mb-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-signal-amber" />
          </div>
          <p className="font-mono text-3xl text-signal-amber mb-1">
            <CountUp end={stats?.flaggedMarkets ?? 0} duration={800} />
          </p>
          <p className="text-xs text-text-secondary uppercase tracking-wider">Inconsistencies Found</p>
        </div>
      </div>

      <div
        className="absolute left-0 right-0 top-1/4 h-32 pointer-events-none overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div
          className="absolute inset-y-0 w-[30%] animate-sweep opacity-[0.04]"
          style={{
            background: "linear-gradient(90deg, transparent, #1E7A3E, transparent)",
          }}
        />
      </div>
    </section>
  );
}
