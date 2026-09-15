"use client"

import { Accessibility, Zap, Navigation } from "lucide-react"
import type { LotSection, ParkingSpace } from "@/lib/parking-data"
import { STATUS_META } from "@/lib/parking-data"

function SpaceCell({
  space,
  isSelected,
  isRecommended,
  justChanged,
  onSelect,
}: {
  space: ParkingSpace
  isSelected: boolean
  isRecommended: boolean
  justChanged: boolean
  onSelect: (s: ParkingSpace) => void
}) {
  const meta = STATUS_META[space.status]
  const isFree = space.status === "available" || space.status === "ev" || space.status === "accessible"

  return (
    <button
      type="button"
      onClick={() => onSelect(space)}
      aria-label={`Space ${space.row}${space.number} — ${meta.label}${justChanged ? ", just updated" : ""}`}
      aria-pressed={isSelected}
      className={`group relative flex aspect-3/4 items-center justify-center rounded-lg text-[10px] font-semibold transition-all duration-300 sm:text-xs ${
        isSelected ? "scale-105 z-10" : "hover:scale-105"
      } ${justChanged ? "animate-pulse-glow" : ""}`}
      style={{
        background:
          space.status === "occupied"
            ? "color-mix(in oklab, #3a4a6b 30%, transparent)"
            : `color-mix(in oklab, ${meta.color} 16%, transparent)`,
        border: `1px solid ${isSelected ? "#fff" : meta.ring}`,
        boxShadow: isRecommended
          ? `0 0 0 2px ${meta.ring}, 0 0 20px 2px ${meta.glow}`
          : isFree
            ? `0 0 12px -2px ${meta.glow}`
            : "none",
        color: space.status === "occupied" ? "rgba(230,236,255,0.35)" : meta.color,
      }}
    >
      {space.status === "ev" ? (
        <Zap className="size-3.5" />
      ) : space.status === "accessible" ? (
        <Accessibility className="size-3.5" />
      ) : (
        <span>
          {space.row}
          {space.number}
        </span>
      )}

      {isRecommended ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-electric px-1.5 py-px text-[8px] font-bold uppercase text-navy-900 shadow-[0_0_12px_var(--color-electric)]">
           Pick
        </span>
      ) : null}
    </button>
  )
}

export function ParkingMap({
  section,
  sections,
  onSectionChange,
  selectedId,
  recommendedId,
  recentlyChangedIds,
  onSelect,
}: {
  section: LotSection
  sections: LotSection[]
  onSectionChange: (id: string) => void
  selectedId: string | null
  recommendedId: string | null
  recentlyChangedIds?: Set<string>
  onSelect: (s: ParkingSpace) => void
}) {
  const rows = Array.from(new Set(section.spaces.map((s) => s.row)))

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-electric" />
            <h3 className="font-display text-lg font-semibold">Live Parking Map</h3>
          </div>
          <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSectionChange(s.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  s.id === section.id
                    ? "bg-gradient-to-r from-electric to-cyan text-navy-900"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-1 text-xs text-foreground/45">
          {section.name} · {section.level} · tap a bay for details · bays update via live simulation
        </p>

        <div className="mt-5 space-y-2.5">
          {rows.map((row) => {
            const rowSpaces = section.spaces.filter((s) => s.row === row)
            return (
              <div key={row} className="flex items-center gap-2 sm:gap-3">
                <span className="w-4 shrink-0 text-center text-xs font-bold text-foreground/40">
                  {row}
                </span>
                <div className="grid flex-1 grid-cols-8 gap-1.5 sm:gap-2">
                  {rowSpaces.map((space) => (
                    <SpaceCell
                      key={space.id}
                      space={space}
                      isSelected={space.id === selectedId}
                      isRecommended={space.id === recommendedId}
                      justChanged={recentlyChangedIds?.has(space.id) ?? false}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>
            )
          })}
          {/* drive lane */}
          <div className="flex items-center gap-2 pt-1">
            <span className="w-4 shrink-0" />
            <div className="relative h-6 flex-1 overflow-hidden rounded-full border border-dashed border-cyan/25">
              <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-[0.3em] text-cyan/40">
                drive lane
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-foreground/55">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: meta.color, boxShadow: `0 0 8px ${meta.glow}` }}
              />
              {meta.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
