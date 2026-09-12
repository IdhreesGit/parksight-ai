"use client"

import { Sparkles, Footprints, MapPin, Gauge, ArrowRight } from "lucide-react"
import type { LotSection, ParkingSpace } from "@/lib/parking-data"
import { STATUS_META } from "@/lib/parking-data"

export function AiRecommendation({
  space,
  section,
}: {
  space: ParkingSpace | null
  section: LotSection
}) {
  if (!space) {
    return (
      <div className="glass rounded-3xl p-6">
        <p className="text-sm text-foreground/60">Scanning for the best available bay…</p>
      </div>
    )
  }

  const meta = STATUS_META[space.status]
  const rowIndex = space.row.charCodeAt(0) - 65
  const walk = 20 + rowIndex * 12 + space.number * 3
  const distance = 15 + rowIndex * 8 + space.number * 4

  const factors = [
    { icon: Footprints, label: "Walk time", value: `${walk}s to entrance` },
    { icon: MapPin, label: "Distance", value: `${distance} m away` },
    { icon: Gauge, label: "Turnover", value: "Low congestion row" },
  ]

  return (
    <div className="relative overflow-hidden rounded-3xl p-[1px]">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "linear-gradient(130deg, rgba(56,255,156,0.6), rgba(34,211,238,0.25) 40%, transparent 70%)",
        }}
      />
      <div className="glass relative rounded-[calc(1.5rem-1px)] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-electric/15 text-electric animate-pulse-glow">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold leading-tight">AI Recommended Spot</h3>
            <p className="text-[11px] text-foreground/45">Optimized for your route</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div
            className="grid size-20 shrink-0 place-items-center rounded-2xl font-display text-2xl font-bold"
            style={{
              background: `color-mix(in oklab, ${meta.color} 18%, transparent)`,
              border: `1px solid ${meta.ring}`,
              color: meta.color,
              boxShadow: `0 0 24px -4px ${meta.glow}`,
            }}
          >
            {space.row}
            {space.number}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              {section.name} · Row {space.row}
            </div>
            <div className="text-xs text-foreground/50">{section.level}</div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-2 py-0.5 text-[11px] font-medium text-electric">
              {(space.confidence * 100).toFixed(1)}% detection confidence
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {factors.map((f) => (
            <div key={f.label} className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5">
              <f.icon className="size-3.5 text-cyan" />
              <div className="mt-1.5 text-[11px] font-semibold leading-tight text-foreground">
                {f.value}
              </div>
              <div className="text-[9px] uppercase tracking-wide text-foreground/40">{f.label}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric to-cyan px-4 py-3 text-sm font-semibold text-navy-900 transition-transform hover:scale-[1.02]"
        >
          Reserve &amp; Navigate
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
