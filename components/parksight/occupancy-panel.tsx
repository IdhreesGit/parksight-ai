"use client"

import { Activity } from "lucide-react"
import { OCCUPANCY_TREND } from "@/lib/parking-data"

function Donut({ rate }: { rate: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const dash = (rate / 100) * c
  return (
    <div className="relative grid size-36 place-items-center">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#donutGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
          style={{ filter: "drop-shadow(0 0 6px rgba(56,255,156,0.6))" }}
        />
        <defs>
          <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38ff9c" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-bold text-foreground">{rate}%</div>
        <div className="text-[10px] uppercase tracking-wide text-foreground/45">occupied</div>
      </div>
    </div>
  )
}

function TrendBars() {
  const max = Math.max(...OCCUPANCY_TREND.map((d) => d.value))
  return (
    <div className="flex h-28 items-stretch justify-between gap-1.5">
      {OCCUPANCY_TREND.map((d) => (
        <div key={d.hour} className="flex h-full flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-gradient-to-t from-cyan/40 to-electric transition-all duration-500"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-foreground/40">{d.hour}</span>
        </div>
      ))}
    </div>
  )
}

export function OccupancyPanel({ rate }: { rate: number }) {
  return (
    <div className="glass flex flex-col gap-6 rounded-3xl p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-cyan" />
        <h3 className="font-display text-lg font-semibold">Occupancy Analytics</h3>
      </div>

      <div className="flex items-center justify-center">
        <Donut rate={rate} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-foreground/55">Today&apos;s Trend</span>
          <span className="text-xs text-electric">Peak 4:00 PM</span>
        </div>
        <TrendBars />
      </div>
    </div>
  )
}
