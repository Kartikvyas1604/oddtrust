'use client';

import { useRef, useEffect, useState } from 'react';

const executedFlow = [
  { agent: 'Arbitrage Agent #07', action: 'EXECUTE_TRADE', odds: '+2.34%', amount: '842.5 USDC' },
  { agent: 'Hedge Agent #03', action: 'PLACE_HEDGE', odds: '+0.47%', amount: '3,200 USDC' },
];

const blockedFlow = [
  { agent: 'Liquidity Agent #12', action: 'ADJUST_POOL', odds: '-1.12%', amount: '12,000 USDC' },
];

export function GatePanel() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef}>
      <div
        className="mx-auto max-w-5xl transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        <div className="mb-10 text-center">
          <h2
            className="mb-2 text-xs font-[400] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Composable Verifiability
          </h2>
          <p
            className="mx-auto max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
          >
            External agents query OddsTrust before acting. The oracle gates execution based on
            live consistency verification.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* EXECUTED */}
          <div className="relative">
            <div className="mb-4 text-center">
              <span
                className="text-[11px] font-[500] uppercase tracking-wider text-[var(--color-pitch-green)]"
                style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
              >
                \u2713 Passed Gate
              </span>
            </div>
            <div className="relative space-y-4">
              <svg className="absolute left-[19px] top-0 h-full w-px" style={{ zIndex: 0 }}>
                <line
                  x1="0" y1="0" x2="0" y2="100%"
                  stroke="var(--color-pitch-green)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  opacity={0.5}
                />
              </svg>
              {executedFlow.map((act, i) => (
                <div
                  key={act.agent}
                  className="relative rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)] p-4 text-left transition-all duration-300"
                  style={{
                    animation: visible ? `stagger-fade 0.5s ease-out ${300 + i * 200}ms both` : 'none',
                    zIndex: 1,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs text-[var(--color-text-secondary)]"
                      style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
                    >
                      {act.agent}
                    </span>
                    <span
                      className="ml-3 text-xs text-[var(--color-text-tertiary)]"
                      style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                    >
                      {act.action}
                    </span>
                    <span
                      className="text-xs text-[var(--color-text-secondary)]"
                      style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                    >
                      {act.odds}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className="text-xs text-[var(--color-text-tertiary)]"
                      style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                    >
                      {act.amount}
                    </span>
                    <span
                      className="flex items-center gap-1 text-[11px]"
                      style={{
                        fontFamily: 'var(--font-martian-mono), monospace',
                        color: 'var(--color-pitch-green)',
                      }}
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-pitch-green)]" />
                      Query OK
                    </span>
                  </div>
                </div>
              ))}
              <div
                className="relative rounded-sm border p-5 text-center"
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-pitch-green) 40%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--color-pitch-green) 6%, transparent)',
                  animation: visible ? 'gate-resolve 0.6s ease-out 0.9s both' : 'none',
                  zIndex: 1,
                }}
              >
                <span
                  className="text-lg font-[600] uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-martian-mono), monospace',
                    color: 'var(--color-pitch-green)',
                  }}
                >
                  \u2713 EXECUTED
                </span>
                <p
                  className="mt-2 text-xs text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
                >
                  All consistency checks passed — trade executed on-chain
                </p>
                <span
                  className="mt-3 inline-block text-[11px] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                >
                  proof: 0x7a3f...b91e
                </span>
              </div>
            </div>
          </div>

          {/* BLOCKED */}
          <div className="relative">
            <div className="mb-4 text-center">
              <span
                className="text-[11px] font-[500] uppercase tracking-wider text-[var(--color-signal-red)]"
                style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
              >
                \u2717 Blocked by Oracle
              </span>
            </div>
            <div className="relative space-y-4">
              <svg className="absolute left-[19px] top-0 h-full w-px" style={{ zIndex: 0 }}>
                <line
                  x1="0" y1="0" x2="0" y2="100%"
                  stroke="var(--color-signal-red)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  opacity={0.5}
                />
              </svg>
              {blockedFlow.map((act, i) => (
                <div
                  key={act.agent}
                  className="relative rounded-sm border p-4 text-left transition-all duration-300"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-signal-red) 20%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--color-signal-red) 3%, var(--color-bg-panel))',
                    borderLeft: '3px solid var(--color-signal-red)',
                    animation: visible ? `stagger-fade 0.5s ease-out ${300 + i * 200}ms both` : 'none',
                    zIndex: 1,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs text-[var(--color-text-secondary)]"
                      style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
                    >
                      {act.agent}
                    </span>
                    <span
                      className="ml-3 text-xs text-[var(--color-text-tertiary)]"
                      style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                    >
                      {act.action}
                    </span>
                    <span
                      className="text-xs text-[var(--color-text-secondary)]"
                      style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                    >
                      {act.odds}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className="text-xs text-[var(--color-text-tertiary)]"
                      style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                    >
                      {act.amount}
                    </span>
                    <span
                      className="flex items-center gap-1 text-[11px]"
                      style={{
                        fontFamily: 'var(--font-martian-mono), monospace',
                        color: 'var(--color-signal-red)',
                      }}
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-signal-red)]" />
                      Flagged
                    </span>
                  </div>
                  <div className="mt-2 rounded-sm px-2 py-1 text-[10px]"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-signal-amber) 8%, transparent)',
                      color: 'var(--color-signal-amber)',
                      fontFamily: 'var(--font-martian-mono), monospace',
                    }}
                  >
                    Cause: England vs Spain margin anomaly detected (0.47%)
                  </div>
                </div>
              ))}
              <div
                className="relative rounded-sm border p-5 text-center"
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-signal-red) 40%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--color-signal-red) 6%, transparent)',
                  animation: visible ? 'gate-block 0.6s ease-out 0.7s both' : 'none',
                  zIndex: 1,
                }}
              >
                <span
                  className="text-lg font-[600] uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-martian-mono), monospace',
                    color: 'var(--color-signal-red)',
                  }}
                >
                  \u2717 BLOCKED
                </span>
                <p
                  className="mt-2 text-xs text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
                >
                  Consistency check failed — trade rejected on-chain
                </p>
                <span
                  className="mt-3 inline-block text-[11px] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                >
                  proof: 0xd4e8...a31c
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
