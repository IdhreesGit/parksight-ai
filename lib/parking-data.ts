export type SpaceStatus = "available" | "occupied" | "reserved" | "ev" | "accessible"

export type ParkingSpace = {
  id: string
  row: string
  number: number
  status: SpaceStatus
  /** minutes the space has been in current state */
  since: number
  /** AI confidence for the detection, 0-1 */
  confidence: number
}

export type LotSection = {
  id: string
  name: string
  level: string
  spaces: ParkingSpace[]
}

const ROWS = ["A", "B", "C", "D"]

// deterministic pseudo-random so server & client render identically
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function buildSection(id: string, name: string, level: string, seed: number, perRow: number): LotSection {
  const rand = seeded(seed)
  const spaces: ParkingSpace[] = []
  for (const row of ROWS) {
    for (let n = 1; n <= perRow; n++) {
      const r = rand()
      let status: SpaceStatus = "occupied"
      if (r > 0.62) status = "available"
      else if (r > 0.55) status = "reserved"
      if (row === "A" && n <= 2) status = "accessible"
      if (row === "D" && n >= perRow - 1) status = "ev"
      spaces.push({
        id: `${id}-${row}${n}`,
        row,
        number: n,
        status,
        since: Math.floor(rand() * 180),
        confidence: 0.9 + rand() * 0.099,
      })
    }
  }
  return { id, name, level, spaces }
}

export const LOT_SECTIONS: LotSection[] = [
  buildSection("north", "North Deck", "Level 2", 7, 8),
  buildSection("south", "South Deck", "Level 1", 42, 8),
  buildSection("east", "East Surface", "Ground", 128, 8),
]

export const STATUS_META: Record<
  SpaceStatus,
  { label: string; color: string; glow: string; ring: string }
> = {
  available: { label: "Available", color: "#38ff9c", glow: "rgba(56,255,156,0.55)", ring: "rgba(56,255,156,0.9)" },
  occupied: { label: "Occupied", color: "#3a4a6b", glow: "rgba(0,0,0,0)", ring: "rgba(120,140,180,0.4)" },
  reserved: { label: "Reserved", color: "#f5b544", glow: "rgba(245,181,68,0.45)", ring: "rgba(245,181,68,0.8)" },
  ev: { label: "EV Charging", color: "#22d3ee", glow: "rgba(34,211,238,0.5)", ring: "rgba(34,211,238,0.9)" },
  accessible: { label: "Accessible", color: "#a78bfa", glow: "rgba(167,139,250,0.45)", ring: "rgba(167,139,250,0.85)" },
}

export function getStats(sections: LotSection[]) {
  const all = sections.flatMap((s) => s.spaces)
  const total = all.length
  const available = all.filter((s) => s.status === "available" || s.status === "ev").length
  const occupied = all.filter((s) => s.status === "occupied").length
  const reserved = all.filter((s) => s.status === "reserved").length
  const occupancyRate = Math.round((occupied / total) * 100)
  return { total, available, occupied, reserved, occupancyRate }
}

// hourly occupancy trend for the sparkline / chart
export const OCCUPANCY_TREND = [
  { hour: "6a", value: 22 },
  { hour: "8a", value: 61 },
  { hour: "10a", value: 78 },
  { hour: "12p", value: 84 },
  { hour: "2p", value: 72 },
  { hour: "4p", value: 88 },
  { hour: "6p", value: 66 },
  { hour: "8p", value: 41 },
]

export const AI_PIPELINE = [
  {
    step: "01",
    title: "Camera Capture",
    desc: "Edge cameras stream 1080p frames from every deck at 4 FPS.",
    icon: "camera",
  },
  {
    step: "02",
    title: "Object Detection",
    desc: "A YOLO-based model localizes vehicles and empty bays per frame.",
    icon: "scan",
  },
  {
    step: "03",
    title: "Occupancy Classifier",
    desc: "Per-space CNN resolves availability with 98.7% precision.",
    icon: "cpu",
  },
  {
    step: "04",
    title: "Recommendation Engine",
    desc: "Graph routing ranks bays by walk time, EV need & turnover.",
    icon: "route",
  },
] as const
