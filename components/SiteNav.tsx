'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mark } from './Mark';
import { ThemeToggle } from './ThemeToggle';
import { replayIntro } from '@/lib/intro';

const ROUTES = [
  { href: '/', label: 'Design system' },
  { href: '/site', label: 'Marketing' },
  { href: '/app', label: 'App prototype' },
  { href: '/personas', label: 'Personas' },
  { href: '/handoff', label: 'Handoff' },
];

export function SiteNav() {
  const path = usePathname();

  return (
    <nav className="site-nav" aria-label="Prototype sections">
      {/* Home and a replay of the opening: a logo must stay a way home, and the
          opening would otherwise play only once per tab. */}
      <Link
        href="/"
        className="site-nav__mark"
        style={{ textDecoration: 'none', color: 'inherit' }}
        onClick={replayIntro}
        title="Verion West — replay the opening"
      >
        <Mark />
      </Link>
      <span className="site-nav__links">
        {ROUTES.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="site-nav__link"
            aria-current={path === r.href ? 'page' : undefined}
          >
            {r.label}
          </Link>
        ))}
      </span>
      <ThemeToggle />
    </nav>
  );
}
