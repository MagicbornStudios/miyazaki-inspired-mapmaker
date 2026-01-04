import type { Route } from 'next';
import Link from 'next/link';
import { Compass, Sparkles } from 'lucide-react';

import { Button } from './ui/button';

const navLinks: { href: Route; label: string; icon: typeof Sparkles }[] = [
  { href: '/about', label: 'About', icon: Sparkles },
];

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur">
      <Link className="group flex items-center gap-3" href="/">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas-accent/80 text-canvas-highlight transition group-hover:scale-105">
          <Compass className="h-5 w-5" />
        </span>
        <div>
          <p className="text-lg font-semibold leading-tight">Cars and Magic</p>
          <p className="text-xs text-slate-300">Ritual drag racing across four-beat rounds.</p>
        </div>
      </Link>

      <nav className="flex flex-1 items-center justify-end gap-2 text-sm md:gap-3">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-slate-200 transition hover:bg-white/10"
            href={href}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
        <Button asChild size="sm">
          <Link href="/about">Learn the ritual</Link>
        </Button>
      </nav>
    </header>
  );
}
