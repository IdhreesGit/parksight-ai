import { ArrowRight, Sparkles, Cctv, Cpu } from "lucide-react"

const HIGHLIGHTS = [
  { icon: Cctv, label: "Vision-based detection" },
  { icon: Cpu, label: "98.7% accuracy" },
  { icon: Sparkles, label: "Live recommendations" },
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_20%,#000,transparent)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-24 -z-0 size-[36rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(56,255,156,0.18), transparent 60%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/5 px-4 py-1.5 text-xs font-medium tracking-wide text-electric animate-fade-up">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-electric opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-electric" />
            </span>
            AI Immersion Project · Live System
          </span>

          <h1
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl animate-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            Never circle the lot
            <br />
            <span className="bg-gradient-to-r from-electric via-cyan to-electric bg-clip-text text-transparent text-glow">
              again.
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-foreground/65 sm:text-lg animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            ParkSight AI reads live camera feeds, detects every open bay in
            real time, and guides drivers straight to the smartest available
            space — turning chaotic parking into a calm, guided experience.
          </p>

          <div
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <a
              href="#dashboard"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric to-cyan px-6 py-3 text-sm font-semibold text-navy-900 shadow-[0_12px_40px_-12px_var(--color-electric)] transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Explore the Dashboard
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-white/[0.06] sm:w-auto"
            >
              See the AI Pipeline
            </a>
          </div>

          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="flex items-center gap-2 text-sm text-foreground/55">
                <h.icon className="size-4 text-cyan" />
                {h.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
