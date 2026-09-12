import { Eye, Brain, Navigation2, Bell, Leaf, ShieldCheck, Check } from "lucide-react"
import { SectionHeading } from "./section-heading"

const FEATURES = [
  {
    icon: Eye,
    title: "Computer Vision Detection",
    desc: "Existing CCTV cameras become smart sensors — no per-space hardware to install or maintain.",
  },
  {
    icon: Brain,
    title: "Predictive Occupancy",
    desc: "Models forecast availability minutes ahead using historical patterns and live flow.",
  },
  {
    icon: Navigation2,
    title: "Turn-by-turn Guidance",
    desc: "Drivers are routed to the optimal bay, balancing walk time, EV needs, and turnover.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    desc: "Reserve a spot and get alerts when your predicted bay opens or fills up.",
  },
  {
    icon: Leaf,
    title: "Emissions Reduction",
    desc: "Less circling means measurably lower fuel use and campus carbon footprint.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by Design",
    desc: "On-device inference detects vehicles, not people — no faces or plates are stored.",
  },
]

const OUTCOMES = [
  "83% less time spent searching for a spot",
  "Zero new in-ground sensors required",
  "Deploys on existing camera infrastructure",
  "Real-time API for apps, signage, and gates",
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
          description="ParkSight AI transforms ordinary parking cameras into a living, predictive map — no expensive retrofits, no guesswork."
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
              <h3 className="font-display text-2xl font-bold">Measurable outcomes</h3>
              <p className="mt-2 text-sm text-foreground/55">
                Piloted on a simulated campus deck, ParkSight AI delivers the metrics that matter to
                drivers and facilities teams alike.
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
                { k: "83%", v: "Faster spot finding" },
                { k: "12k+", v: "Bays monitored" },
                { k: "24/7", v: "Continuous analysis" },
                { k: "0", v: "Ground sensors" },
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
