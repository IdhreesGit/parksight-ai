import { Clock, Fuel, Frown, TrafficCone } from "lucide-react"
import { SectionHeading } from "./section-heading"

const PAINS = [
  {
    icon: Clock,
    stat: "17 min",
    title: "Wasted per trip",
    desc: "Drivers spend an average of 17 minutes hunting for a space in busy structures.",
  },
  {
    icon: Fuel,
    stat: "1.3B gal",
    title: "Fuel burned yearly",
    desc: "Circling for parking wastes over a billion gallons of fuel across the US alone.",
  },
  {
    icon: TrafficCone,
    stat: "30%",
    title: "Of urban traffic",
    desc: "Up to a third of downtown congestion is caused by cars searching for parking.",
  },
  {
    icon: Frown,
    stat: "#1",
    title: "Campus complaint",
    desc: "Parking is consistently the top-ranked frustration in campus experience surveys.",
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
          description="It is not just an inconvenience. Inefficient parking wastes time, fuel, and money while adding needless congestion and stress."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAINS.map((p) => (
            <div key={p.title} className="glass glass-hover rounded-2xl p-6 hover:border-orange-400/30">
              <span className="grid size-11 place-items-center rounded-xl bg-orange-400/10 text-orange-400 ring-1 ring-orange-400/20">
                <p.icon className="size-5" />
              </span>
              <div className="mt-4 font-display text-3xl font-bold text-foreground">{p.stat}</div>
              <div className="mt-1 text-sm font-semibold text-foreground/90">{p.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/50">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
