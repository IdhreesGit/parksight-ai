"use client"

import { useEffect, useState } from "react"
import { Cctv, CircleDot } from "lucide-react"
import type { LotSection } from "@/lib/parking-data"

type Box = {
  id: string
  top: number
  left: number
  w: number
  h: number
  free: boolean
}

// deterministic-ish boxes derived from section, laid out as a detection overlay
function buildBoxes(section: LotSection): Box[] {
  const sample = section.spaces.slice(0, 12)
  return sample.map((s, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    const free = s.status !== "occupied" && s.status !== "reserved"
    return {
      id: s.id,
      left: 6 + col * 23,
      top: 12 + row * 28,
      w: 19,
      h: 22,
      free,
    }
  })
}

export function CameraPanel({ section }: { section: LotSection }) {
  const boxes = buildBoxes(section)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 10000), 240)
    return () => clearInterval(t)
  }, [])

  const freeCount = boxes.filter((b) => b.free).length

  return (
    <div className="glass overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cctv className="size-4 text-cyan" />
           <h3 className="font-display text-lg font-semibold">Sample Feed Overlay</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-400">
          <CircleDot className="size-3 animate-pulse" />
          SIM · {section.name}
        </div>
      </div>

      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-navy-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lot-aerial.png"
          alt="Aerial camera feed of the parking deck"
          className="absolute inset-0 size-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-navy-900/40" />

        {/* scanning line */}
        <div
          className="absolute inset-x-0 h-16 animate-scan"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(56,255,156,0.25), transparent)",
          }}
        />

        {/* detection boxes */}
        {boxes.map((b, i) => (
          <div
            key={b.id}
            className="absolute rounded-md transition-all"
            style={{
              top: `${b.top}%`,
              left: `${b.left}%`,
              width: `${b.w}%`,
              height: `${b.h}%`,
              border: `1.5px solid ${b.free ? "#38ff9c" : "#22d3ee"}`,
              boxShadow: `0 0 12px -2px ${b.free ? "rgba(56,255,156,0.6)" : "rgba(34,211,238,0.5)"}`,
              opacity: (frame + i) % 12 === 0 ? 0.4 : 1,
            }}
          >
            <span
              className="absolute -top-4 left-0 whitespace-nowrap rounded px-1 text-[8px] font-bold"
              style={{
                background: b.free ? "#38ff9c" : "#22d3ee",
                color: "#060b1a",
              }}
            >
              {b.free ? "OPEN" : "CAR"} · simulation
            </span>
          </div>
        ))}

        {/* HUD corner */}
        <div className="absolute bottom-2 left-2 rounded-md bg-navy-900/70 px-2 py-1 font-mono text-[9px] text-electric backdrop-blur">
          SIM-CAM · sample feed
        </div>
        <div className="absolute bottom-2 right-2 rounded-md bg-navy-900/70 px-2 py-1 font-mono text-[9px] text-cyan backdrop-blur">
          SIM FRAME #{10482 + frame}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Objects", value: boxes.length },
          { label: "Open bays", value: freeCount },
          { label: "Mode", value: "Demo" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.03] py-2">
            <div className="font-display text-lg font-bold text-foreground">{m.value}</div>
            <div className="text-[10px] uppercase tracking-wide text-foreground/45">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
