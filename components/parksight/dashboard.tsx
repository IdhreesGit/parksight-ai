"use client"

import { useEffect, useMemo, useState } from "react"
import { LOT_SECTIONS, getStats, type LotSection, type ParkingSpace } from "@/lib/parking-data"
import { StatCards } from "./stat-cards"
import { ParkingMap } from "./parking-map"
import { OccupancyPanel } from "./occupancy-panel"
import { AiRecommendation } from "./ai-recommendation"
import { CameraPanel } from "./camera-panel"

// pick the best available bay: closest to entrance (row A, low number)
function recommend(section: LotSection): ParkingSpace | null {
  const free = section.spaces.filter((s) => s.status === "available")
  if (free.length === 0) return null
  return [...free].sort((a, b) => {
    const da = (a.row.charCodeAt(0) - 65) * 10 + a.number
    const db = (b.row.charCodeAt(0) - 65) * 10 + b.number
    return da - db
  })[0]
}

export function Dashboard() {
  const [sections, setSections] = useState<LotSection[]>(LOT_SECTIONS)
  const [activeId, setActiveId] = useState(LOT_SECTIONS[0].id)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [live, setLive] = useState(true)

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeId) ?? sections[0],
    [sections, activeId],
  )
  const stats = useMemo(() => getStats(sections), [sections])
  const recommended = useMemo(() => recommend(activeSection), [activeSection])

  // simulate live detection: flip a few bays between available/occupied
  useEffect(() => {
    if (!live) return
    const t = setInterval(() => {
      setSections((prev) =>
        prev.map((section) => {
          const spaces = section.spaces.map((sp) => ({ ...sp }))
          const flips = 1 + Math.floor(Math.random() * 2)
          for (let i = 0; i < flips; i++) {
            const idx = Math.floor(Math.random() * spaces.length)
            const sp = spaces[idx]
            if (sp.status === "available") sp.status = "occupied"
            else if (sp.status === "occupied") sp.status = "available"
            sp.confidence = 0.9 + Math.random() * 0.099
            sp.since = 0
          }
          return { ...section, spaces }
        }),
      )
    }, 3200)
    return () => clearInterval(t)
  }, [live])

  const selected = activeSection.spaces.find((s) => s.id === selectedId) ?? null

  return (
    <section id="dashboard" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan">
              <span className="size-1.5 rounded-full bg-electric shadow-[0_0_10px_2px_var(--color-electric)]" />
              Live Dashboard
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Campus Parking, in real time
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setLive((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-foreground/70 transition-colors hover:bg-white/[0.06]"
          >
            <span
              className={`size-2 rounded-full ${live ? "bg-electric animate-pulse" : "bg-foreground/30"}`}
            />
            {live ? "Live updates on" : "Paused"}
          </button>
        </div>

        <div className="mt-6">
          <StatCards stats={stats} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ParkingMap
              section={activeSection}
              sections={sections}
              onSectionChange={setActiveId}
              selectedId={selectedId}
              recommendedId={recommended?.id ?? null}
              onSelect={(s) => setSelectedId((cur) => (cur === s.id ? null : s.id))}
            />
            {selected ? (
              <div className="glass mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 animate-fade-up">
                <div className="text-sm">
                  <span className="font-semibold text-foreground">
                    Bay {selected.row}
                    {selected.number}
                  </span>
                  <span className="text-foreground/50">
                    {" "}
                    · {activeSection.name} · state active {selected.since}m
                  </span>
                </div>
                <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-xs font-medium text-cyan">
                  {(selected.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <AiRecommendation space={recommended} section={activeSection} />
            <OccupancyPanel rate={stats.occupancyRate} />
          </div>
        </div>

        <div className="mt-4">
          <CameraPanel section={activeSection} />
        </div>
      </div>
    </section>
  )
}
