"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { LOT_SECTIONS, getStats, rankRecommendations, simulateTick, type LotSection } from "@/lib/parking-data"
import { StatCards } from "./stat-cards"
import { ParkingMap } from "./parking-map"
import { OccupancyPanel } from "./occupancy-panel"
import { AiRecommendation } from "./ai-recommendation"
import { CameraPanel } from "./camera-panel"

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

const SPEED_INTERVAL_MS = {
  slow: 8000,
  normal: 4500,
  fast: 2200,
} as const

type SimulationSpeed = keyof typeof SPEED_INTERVAL_MS

export function Dashboard() {
  const [sections, setSections] = useState<LotSection[]>(LOT_SECTIONS)
  const [activeId, setActiveId] = useState(LOT_SECTIONS[0].id)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [live, setLive] = useState(true)
  const [simulationSpeed, setSimulationSpeed] = useState<SimulationSpeed>("normal")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [recentlyChangedIds, setRecentlyChangedIds] = useState<Set<string>>(new Set())
  const [lastChangeCount, setLastChangeCount] = useState(0)

  // always-current ref so the simulation loop never closes over stale state
  const sectionsRef = useRef(sections)
  useEffect(() => {
    sectionsRef.current = sections
  }, [sections])

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeId) ?? sections[0],
    [sections, activeId],
  )
  const stats = useMemo(() => getStats(sections), [sections])
  const recommended = useMemo(() => rankRecommendations(sections)[0] ?? null, [sections])

  // Simulated live-update loop for the prototype. This is a client-side,
  // in-memory simulation only — no camera, sensor, or backend is involved.
  // Bays flip between Available / Occupied at semi-random, realistic
  // intervals so the dashboard "feels" live; everything stays labelled as
  // simulation/demo data.
  useEffect(() => {
    if (!live) return
    let cancelled = false
    let tickTimeout: ReturnType<typeof setTimeout>
    let flashTimeout: ReturnType<typeof setTimeout>

    const runTick = () => {
      const { sections: next, changedIds } = simulateTick(sectionsRef.current)
      setSections(next)
      setLastUpdated(new Date())
      setLastChangeCount(changedIds.length)

      if (changedIds.length > 0) {
        setRecentlyChangedIds(new Set(changedIds))
        flashTimeout = setTimeout(() => {
          if (!cancelled) setRecentlyChangedIds(new Set())
        }, 1400)
      }

      if (!cancelled) {
        const baseDelay = SPEED_INTERVAL_MS[simulationSpeed]
        tickTimeout = setTimeout(
          runTick,
          baseDelay + Math.round(Math.random() * baseDelay * 0.25),
        )
      }
    }

    const baseDelay = SPEED_INTERVAL_MS[simulationSpeed]
    tickTimeout = setTimeout(
      runTick,
      baseDelay + Math.round(Math.random() * baseDelay * 0.25),
    )

    return () => {
      cancelled = true
      clearTimeout(tickTimeout)
      clearTimeout(flashTimeout)
    }
  }, [live, simulationSpeed])

  // set the initial timestamp on mount only (client-side) to avoid any
  // server/client render mismatch
  useEffect(() => {
    setLastUpdated(new Date())
  }, [])

  const selected = activeSection.spaces.find((s) => s.id === selectedId) ?? null

  return (
    <section id="dashboard" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan">
              <span className="size-1.5 rounded-full bg-electric shadow-[0_0_10px_2px_var(--color-electric)]" />
              Prototype Dashboard · Demo Data
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Campus Parking, simulated live
            </h2>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              aria-pressed={live}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-foreground/70 transition-colors hover:bg-white/[0.06]"
            >
              <span
                className={`size-2 rounded-full ${live ? "bg-electric animate-pulse" : "bg-foreground/30"}`}
              />
              {live ? "Live Simulation" : "Simulation Paused"}
            </button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-foreground/40">
                Speed
              </span>
              <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
                {(["slow", "normal", "fast"] as SimulationSpeed[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSimulationSpeed(option)}
                    aria-pressed={simulationSpeed === option}
                    className={`rounded-md px-2.5 py-1 text-[10px] font-medium capitalize transition-colors ${
                      simulationSpeed === option
                        ? "bg-electric/15 text-electric"
                        : "text-foreground/45 hover:text-foreground/75"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-foreground/45">
              {lastChangeCount === 0
                ? "No bay changes"
                : `${lastChangeCount} ${lastChangeCount === 1 ? "bay" : "bays"} changed`}{" "}
              <span className="text-foreground/30">after latest update</span>
            </span>
            <span className="text-[10px] tabular-nums text-foreground/40">
              {lastUpdated ? `Last updated ${formatTime(lastUpdated)}` : "Starting simulation…"}
            </span>
          </div>
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
              recommendedId={
                recommended?.section.id === activeSection.id ? recommended.space.id : null
              }
              recentlyChangedIds={recentlyChangedIds}
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
                    · {activeSection.name} · state active {selected.since}m (simulated)
                  </span>
                </div>
                <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-xs font-medium text-cyan">
                  Simulation data
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <AiRecommendation recommendation={recommended} />
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
