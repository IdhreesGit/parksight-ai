import { Eye, Brain, Navigation2, Bell, Leaf, ShieldCheck, Check } from "lucide-react"
import { SectionHeading } from "./section-heading"

const FEATURES = [
  {
    icon: Eye,
    title: "Illustrative Detection View",
    desc: "A sample feed overlay makes the intended parking-analysis experience easy to understand.",
  },
  {
    icon: Brain,
    title: "Transparent Occupancy",
    desc: "The demo shows current simulated occupancy without claiming a trained prediction model.",
  },
  {
    icon: Navigation2,
    title: "Prototype Ranking",
    desc: "A visible weighted score compares open bays by distance, section, and bay type.",
  },
  {
    icon: Bell,
    title: "Clear State Changes",
    desc: "The dashboard reports which bays changed after each simulated update.",
  },
  {
    icon: Leaf,
    title: "Explorable Demo",
    desc: "Slow, normal, and fast controls make the simulated parking flow easy to present.",
  },
  {
    icon: ShieldCheck,
    title: "Honest Scope",
    desc: "The interface labels simulated data and avoids unsupported accuracy or live-data claims.",
  },
]

const OUTCOMES = [
  "Clear visibility of simulated open spaces",
  "A transparent recommendation approach",
  "Adjustable demo speed for presentations",
  "A foundation for future research",
]

export function AiSolution() {
  return (
    <section id="solution" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The AI Solution"
          title={
            <>
              Intelligence layered over{" "}
              <span className="bg-gradient-to-r from-electric to-cyan bg-clip-text text-transparent">
                infrastructure you already have
              </span>
            </>
          }
          description="ParkSight AI demonstrates a living parking map with simulated occupancy and an explainable recommendation workflow."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass glass-hover group rounded-2xl p-6 hover:-translate-y-1 hover:border-electric/30"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-electric/20 to-cyan/10 text-electric ring-1 ring-electric/20 transition-transform group-hover:scale-110">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass mt-6 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-display text-2xl font-bold">Prototype outcomes</h3>
              <p className="mt-2 text-sm text-foreground/55">
                In this prototype, ParkSight AI demonstrates the workflow using simulated parking data.
                The interface is designed to make future research questions visible without presenting
                unmeasured results as facts.
              </p>
              <ul className="mt-5 space-y-3">
                {OUTCOMES.map((o) => (
                  <li key={o} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-electric/15 text-electric">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "SIM", v: "Parking state input" },
                { k: "5", v: "Ranking factors" },
                { k: "Web", v: "Interactive interface" },
                { k: "0", v: "External services" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-5 text-center"
                >
                  <div className="font-display text-3xl font-bold text-electric">{s.k}</div>
                  <div className="mt-1 text-xs text-foreground/55">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
