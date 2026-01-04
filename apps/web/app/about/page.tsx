import { BatteryFull, Flag, HeartPulse, Sparkles, Timer } from 'lucide-react';

const beats = [
  {
    title: 'Four rounds, four beats each',
    body: 'Both players lock four cards into a play line. Slots resolve in order—no surprises, just planning.',
    icon: Timer,
  },
  {
    title: 'Health gates distance',
    body: 'At 0 health the car stalls. Some cards or mana bursts can briefly override the stall to keep momentum.',
    icon: HeartPulse,
  },
  {
    title: 'Mana fuels will',
    body: 'Spend mana to push past restraints, power drift control, or amplify shields at critical beats.',
    icon: BatteryFull,
  },
];

const styleNotes = [
  {
    title: 'Ceremonial vibe',
    detail:
      'Ancient forest-bound ritual at night—stone, moss, crystal, and calm but dangerous energy.',
  },
  {
    title: 'Readable beats',
    detail:
      'UI must always answer: what resolves next and how far ahead am I? Effects stay legible without sound.',
  },
  {
    title: 'Palette guardrails',
    detail:
      'Ethereal teal for mana, moonleaf green for stability, fungal amber for focus. Avoid industrial metal.',
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/25">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-canvas-highlight">
          <Sparkles className="h-4 w-4" />
          Game overview
        </p>
        <h1 className="text-4xl font-semibold text-white">Cars and Magic</h1>
        <p className="max-w-3xl text-lg text-slate-200">
          A turn-based competitive drag racing card game. Arrange spells and maneuvers into a
          four-slot play line, watch them resolve in lockstep with your rival, and balance health
          and mana to stay ahead on the ritual track.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {beats.map(({ title, body, icon: Icon }) => (
          <article
            key={title}
            className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-canvas-accent/60 text-canvas-highlight">
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-sm text-slate-200">{body}</p>
            </div>
          </article>
        ))}
      </section>

      <section
        id="style"
        className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-canvas-highlight">
            <Flag className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-white">Style guardrails</h2>
            <p className="text-slate-200">
              Keep every screen aligned with the ritual drag racing fantasy.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {styleNotes.map((note) => (
            <div
              key={note.title}
              className="space-y-2 rounded-2xl border border-white/10 bg-black/40 p-5 shadow-inner shadow-black/30"
            >
              <p className="text-sm font-semibold text-canvas-highlight">{note.title}</p>
              <p className="text-sm text-slate-200">{note.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
