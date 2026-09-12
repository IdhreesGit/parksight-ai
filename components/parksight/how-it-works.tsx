import { Camera, Scan, Cpu, Route } from "lucide-react"
import { AI_PIPELINE } from "@/lib/parking-data"
import { SectionHeading } from "./section-heading"

const ICONS = { camera: Camera, scan: Scan, cpu: Cpu, route: Route } as const

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How It Works"
          title={
            <>
              A four-stage <span className="text-cyan">AI pipeline</span>
            </>
          }
          description="Every frame flows through the same real-time pipeline — from raw pixels to a spot recommendation in under 40 milliseconds."
        />

        <div className="relative mt-12 grid gap-4 md:grid-cols-4">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px md:block">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-electric/40 to-transparent" />
          </div>

          {AI_PIPELINE.map((stage, i) => {
            const Icon = ICONS[stage.icon]
            return (
              <div
                key={stage.step}
                className="glass glass-hover group relative rounded-2xl p-5 hover:-translate-y-1 hover:border-electric/30"
              >
                <div className="flex items-center justify-between">
                  <span className="relative z-10 grid size-11 place-items-center rounded-xl bg-gradient-to-br from-electric/20 to-cyan/10 text-electric ring-1 ring-electric/20">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-display text-3xl font-bold text-white/8">{stage.step}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{stage.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">{stage.desc}</p>
                {i < AI_PIPELINE.length - 1 ? (
                  <div className="absolute -right-2 top-10 hidden size-4 rotate-45 border-r border-t border-electric/30 bg-navy-800 md:block" />
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { k: "98.7%", v: "Detection precision", d: "Validated across 40k labeled frames" },
            { k: "<40ms", v: "End-to-end latency", d: "From capture to recommendation" },
            { k: "4 FPS", v: "Per-camera throughput", d: "Edge-optimized inference" },
          ].map((s) => (
            <div key={s.v} className="glass rounded-2xl p-5">
              <div className="font-display text-3xl font-bold text-electric">{s.k}</div>
              <div className="mt-1 text-sm font-medium text-foreground">{s.v}</div>
              <div className="text-xs text-foreground/45">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
