import Link from 'next/link';
import { BatteryFull, Flag, Gauge, ShieldHalf, Sparkles, Timer } from 'lucide-react';

import { Button } from '../components/ui/button';

const highlightCards = [
  {
    icon: Timer,
    title: '4-beat races',
    body: 'Each round resolves four locked slots. Plan the order, read your rival, and let the ritual play out.',
  },
  {
    icon: BatteryFull,
    title: 'Health vs mana',
    body: 'Health keeps your car stable; mana fuels motion even when battered. Spend both with intention.',
  },
  {
    icon: ShieldHalf,
    title: 'Predict the line',
    body: 'Sequence counters and bursts to break shields, slip restraints, and surge ahead at the perfect beat.',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/25 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-canvas-highlight">
            <Sparkles className="h-4 w-4" />
            Turn-based • 4 rounds • Ritual racing
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Cars and Magic is a ritual drag racing card game.
          </h1>
          <p className="max-w-2xl text-lg text-slate-200">
            Sequence enchanted vehicle maneuvers across four beats per round. Lock in your play
            line, then watch mana-fueled bursts, shields, and restraints resolve in order as you
            fight for a few more stone tiles of distance.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/about">See how a race works</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about#style">View the style guide</Link>
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-canvas-accent/50 to-transparent p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(195,228,213,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(146,210,183,0.25),transparent_30%)]" />
          <div className="relative space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Ritual Sprint — Round 2
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-canvas-highlight">
                Slot-by-slot
              </span>
            </div>
            <div className="h-48 rounded-xl border border-white/10 bg-[radial-gradient(circle_at_30%_40%,#1b3830,transparent_45%),radial-gradient(circle_at_80%_20%,#2a463d,transparent_35%),radial-gradient(circle_at_60%_80%,#153127,transparent_40%)]" />
            <div className="grid grid-cols-4 gap-2 text-xs text-slate-200">
              {[1, 2, 3, 4].map((slot) => (
                <div
                  key={slot}
                  className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-canvas-highlight">
                    <span>Slot {slot}</span>
                    <Gauge className="h-3 w-3" />
                  </div>
                  <p className="text-[11px] leading-snug text-slate-200">
                    Mana surge + drift control
                  </p>
                  <p className="text-[10px] text-slate-400">Health check • Restraint decay</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-200">
              Every beat is deterministic: health gates motion, mana fuels overrides, and status
              effects tick as runes flare along the track.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-canvas-highlight">
            <Flag className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-white">Built for ceremonial duels</h2>
            <p className="text-slate-200">
              Four beats, four rounds, one ritual sprint under lantern light.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {highlightCards.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-canvas-accent/60 text-canvas-highlight">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-200">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
