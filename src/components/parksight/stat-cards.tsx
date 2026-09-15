"use client"

import { Activity, Car, CircleParking, TrendingUp } from "lucide-react"

type Stats = {
  total: number
  available: number
  occupied: number
  reserved: number
  occupancyRate: number
}

function AnimatedNumber({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  return (
    <span className="tabular-nums transition-all duration-500">
      {value}
      {suffix}
    </span>
  )
}

export function StatCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "Open Spaces",
      value: stats.available,
      icon: CircleParking,
      accent: "text-electric",
      ring: "from-electric/20",
      sub: "in prototype simulation",
    },
    {
      label: "Occupancy",
      value: stats.occupancyRate,
      suffix: "%",
      icon: TrendingUp,
      accent: "text-cyan",
      ring: "from-cyan/20",
      sub: "of total capacity",
    },
    {
      label: "Vehicles Parked",
      value: stats.occupied,
      icon: Car,
      accent: "text-foreground",
      ring: "from-white/10",
      sub: `in ${stats.total} simulated bays`,
    },
    {
      label: "Simulation Status",
      value: "Live",
      icon: Activity,
      accent: "text-electric",
      ring: "from-electric/20",
      sub: "parking changes are simulated",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="glass glass-hover group relative overflow-hidden rounded-2xl p-4 hover:border-electric/30 sm:p-5"
        >
          <div
            className={`pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br ${c.ring} to-transparent blur-xl transition-opacity group-hover:opacity-100`}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
              {c.label}
            </span>
            <c.icon className={`size-4 ${c.accent}`} />
          </div>
          <div className={`mt-3 font-display text-3xl font-bold sm:text-4xl ${c.accent}`}>
            <AnimatedNumber value={c.value} suffix={c.suffix} />
          </div>
          <p className="mt-1 text-xs text-foreground/45">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
