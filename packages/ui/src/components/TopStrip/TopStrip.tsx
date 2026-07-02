'use client';

import { useState, useEffect } from 'react';

function useSlot() {
  const [slot, setSlot] = useState(310_442_891);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const update = () => {
      setTimestamp(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    };
    update();
    const interval = setInterval(() => {
      setSlot((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    const tsInterval = setInterval(update, 1000);
    return () => { clearInterval(interval); clearInterval(tsInterval); };
  }, []);

  return { slot, timestamp };
}

export function TopStrip() {
  const { slot, timestamp } = useSlot();

  return (
    <header
      className="flex items-center justify-between border-b border-[var(--color-line-hairline)] px-4 py-3 sm:px-6"
      style={{ animation: 'count-up 0.6s ease-out 0ms both' }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <h1
          className="text-lg font-[500] tracking-tight sm:text-xl"
          style={{ fontFamily: 'var(--font-fraunces), serif', letterSpacing: '-0.02em' }}
        >
          OddsTrust
        </h1>
        <span className="hidden h-4 w-px bg-[var(--color-line-hairline)] sm:block md:hidden lg:block" />
        <div
          className="hidden items-center gap-1.5 sm:hidden md:flex lg:flex"
          style={{ animation: 'count-up 0.6s ease-out 150ms both' }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-pitch-green)] animate-pulse-dot" />
          <span
            className="text-[11px] font-[400] uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: 'var(--color-pitch-green)' }}
          >
            Oracle Status: Active
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          className="hidden text-[11px] text-[var(--color-text-tertiary)] lg:block"
          style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
        >
          {timestamp}
        </span>
        <span
          className="text-[11px] text-[var(--color-text-secondary)]"
          style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
        >
          # {slot.toLocaleString('en-US')}
        </span>
      </div>
    </header>
  );
}
