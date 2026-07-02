'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/matches', label: 'Matches' },
  { href: '/oracle', label: 'Oracle' },
  { href: '/proof-feed', label: 'Proof Feed' },
  { href: '/docs', label: 'Docs' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 sm:gap-6">
      {links.map((link) => {
        const isActive = link.href === '/'
          ? pathname === '/'
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative text-[11px] uppercase tracking-[0.1em] transition-colors sm:text-[12px]"
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
                className="absolute -bottom-1 left-0 h-px bg-[var(--color-pitch-green)] animate-nav-indicator"
                style={{ width: '100%' }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
