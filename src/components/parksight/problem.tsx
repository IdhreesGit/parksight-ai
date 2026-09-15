import { Clock, Fuel, Frown, TrafficCone } from "lucide-react"
import { SectionHeading } from "./section-heading"

const PAINS = [
  {
    icon: Clock,
    title: "Visibility Gap",
    desc: "Drivers cannot see parking availability before searching.",
  },
  {
    icon: Fuel,
    title: "Manual Search",
    desc: "Drivers must visually search for an open space.",
  },
  {
    icon: TrafficCone,
    title: "Information Gap",
    desc: "Parking occupancy is not visible in real time.",
  },
  {
    icon: Frown,
    title: "Design Opportunity",
    desc: "A live availability view could guide drivers faster.",
  },
]

export function Problem() {
  return (
    <section id="problem" className="relative scroll-mt-24 py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-0 mx-auto h-64 max-w-4xl rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(245,120,90,0.15), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Problem"
          title={
            <>
              Parking is <span className="text-orange-400">broken</span> — and expensive
            </>
          }
          description="Searching for parking creates uncertainty and unnecessary effort. This prototype explores how clearer availability information could help."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAINS.map((p) => (
            <div key={p.title} className="glass glass-hover rounded-2xl p-6 hover:border-orange-400/30">
              <span className="grid size-11 place-items-center rounded-xl bg-orange-400/10 text-orange-400 ring-1 ring-orange-400/20">
                <p.icon className="size-5" />
              </span>
              <div className="mt-4 font-display text-3xl font-bold text-foreground">{p.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/50">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
