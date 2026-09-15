import { Cpu, Database, Layers, Radar } from "lucide-react"
import { SectionHeading } from "./section-heading"

const STACK = [
  { icon: Radar, label: "Simulation", tech: "Browser state loop" },
  { icon: Cpu, label: "Ranking", tech: "Weighted prototype score" },
  { icon: Database, label: "Data", tech: "Deterministic demo seed" },
  { icon: Layers, label: "Interface", tech: "React · Tailwind" },
]

export function About() {
  return (
    <section id="about" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="About the Project"
          title={
            <>
              Built for the <span className="text-cyan">AI Immersion</span> program
            </>
          }
          description="ParkSight AI is a student research project exploring how an explainable parking workflow could help people understand open-space availability."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <div className="glass rounded-3xl p-6 sm:p-8 lg:col-span-3">
            <h3 className="font-display text-xl font-bold">The mission</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/60">
               We set out to explore how a smarter parking experience could make open-space
               information easier to understand. This prototype uses simulated bay states to
               demonstrate the product idea without requiring live cameras, sensors, or backend data.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/60">
               This build demonstrates the concept end to end: a simulated parking deck, an illustrative
               sample-feed overlay, occupancy analytics, and a transparent recommendation ranking,
               wrapped in a polished dashboard.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {STACK.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-electric/10 text-electric">
                    <s.icon className="size-4.5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{s.label}</div>
                    <div className="text-xs text-foreground/45">{s.tech}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="glass flex-1 rounded-3xl p-6 sm:p-8">
              <h3 className="font-display text-xl font-bold">Project scope</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Type", "AI Immersion capstone"],
                  ["Focus", "Computer vision concept"],
                  ["Status", "Interactive prototype"],
                  ["Data", "Realistic simulation"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <dt className="text-foreground/45">{k}</dt>
                    <dd className="font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div
              className="relative overflow-hidden rounded-3xl p-6 text-navy-900"
              style={{ background: "linear-gradient(135deg, #38ff9c, #22d3ee)" }}
            >
              <Radar className="absolute -right-4 -bottom-4 size-28 opacity-20" />
              <div className="relative">
                <div className="font-display text-lg font-bold">Smarter cities start small.</div>
                <p className="mt-1 text-sm font-medium text-navy-900/70">
                  One parking deck at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
