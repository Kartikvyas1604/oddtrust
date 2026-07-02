'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Overview' },
  { href: '/matches', label: 'Matches' },
  { href: '/oracle', label: 'Oracle' },
  { href: '/proof-feed', label: 'Proof Feed' },
  { href: '/docs', label: 'Docs' },
];

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

function NavLinks({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <div className={`flex ${mobile ? 'gap-4 overflow-x-auto' : 'items-center gap-4 sm:gap-6'}`}>
      {navLinks.map((link) => {
        const isActive = link.href === '/'
          ? pathname === '/'
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative shrink-0 text-[11px] uppercase tracking-[0.1em] transition-colors sm:text-[12px]"
            style={{
              fontFamily: 'var(--font-fraunces), serif',
              fontWeight: isActive ? 500 : 400,
              color: isActive
                ? 'var(--color-text-primary)'
                : 'var(--color-text-tertiary)',
            }}
          >
            {link.label}
            {isActive && (
              <span
                className="absolute -bottom-1 left-0 h-px bg-[var(--color-pitch-green)]"
                style={{ width: '100%' }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function TopStrip() {
  const { slot, timestamp } = useSlot();

  return (
    <header className="border-b border-[var(--color-line-hairline)]">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <h1
            className="text-lg font-[500] tracking-tight sm:text-xl"
            style={{ fontFamily: 'var(--font-fraunces), serif', letterSpacing: '-0.02em' }}
          >
            OddsTrust
          </h1>
          <span className="hidden h-4 w-px bg-[var(--color-line-hairline)] sm:block" />
          <div className="hidden sm:block">
            <NavLinks />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-1.5 md:flex">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-pitch-green)] animate-pulse-dot" />
            <span
              className="text-[11px] font-[400] uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: 'var(--color-pitch-green)' }}
            >
              Oracle Status: Active
            </span>
          </div>
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
      </div>
      <div className="border-t border-[var(--color-line-hairline)] px-4 py-2 sm:hidden">
        <NavLinks mobile />
      </div>
    </header>
  );
}
