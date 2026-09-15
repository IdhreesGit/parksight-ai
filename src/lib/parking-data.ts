export type SpaceStatus = "available" | "occupied" | "reserved" | "ev" | "accessible"
export type BayType = "standard" | "compact" | "ev" | "accessible"

export type ParkingSpace = {
  id: string
  row: string
  number: number
  status: SpaceStatus
  bayType: BayType
  /** minutes the space has been in current state */
  since: number
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
      let bayType: BayType = n % 4 === 0 ? "compact" : "standard"
      if (r > 0.62) status = "available"
      else if (r > 0.55) status = "reserved"
      if (row === "A" && n <= 2) {
        status = "accessible"
        bayType = "accessible"
      }
      if (row === "D" && n >= perRow - 1) {
        status = "ev"
        bayType = "ev"
      }
      spaces.push({
        id: `${id}-${row}${n}`,
        row,
        number: n,
        status,
        bayType,
        since: Math.floor(rand() * 180),
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

/**
 * Advances the simulated lot by one "tick": every space's `since` counter
 * ticks up (mimicking elapsed time in current state), and a small, weighted
 * number of available/occupied bays flip — occupied bays are somewhat more
 * likely to free up than free bays are to fill, so the lot naturally
 * oscillates instead of drifting to all-full or all-empty. Reserved, EV,
 * and accessible bays keep their designated type; only general
 * available/occupied bays change state, which keeps the demo readable.
 *
 * This is a frontend-only, client-side simulation for demo purposes — it
 * does not read from any camera, sensor, or backend.
 */
export function simulateTick(sections: LotSection[]): {
  sections: LotSection[]
  changedIds: string[]
} {
  const nextSections = sections.map((section) => {
    const spaces = section.spaces.map((sp) => ({ ...sp, since: sp.since + 1 }))

    const changeable = spaces.filter((s) => s.status === "available" || s.status === "occupied")
    const shuffled = [...changeable].sort(() => Math.random() - 0.5)
    const candidateCount = Math.min(shuffled.length, 1 + Math.floor(Math.random() * 2))

    for (const candidate of shuffled.slice(0, candidateCount)) {
      const target = spaces.find((s) => s.id === candidate.id)
      if (!target) continue
      // occupied -> available (a car leaves) is slightly more likely than
      // available -> occupied (a car arrives), which keeps turnover realistic
      const flipChance = target.status === "occupied" ? 0.55 : 0.45
      if (Math.random() < flipChance) {
        target.status = target.status === "occupied" ? "available" : "occupied"
        target.since = 0
      }
    }

    return { ...section, spaces }
  })

  // Count actual occupancy changes by diffing the previous and next states.
  // The `since` timer is intentionally ignored because it is not a bay-state
  // change.
  const changedIds = nextSections.flatMap((nextSection) => {
    const previousSection = sections.find((section) => section.id === nextSection.id)
    if (!previousSection) return []

    return nextSection.spaces
      .filter((nextSpace) => {
        const previousSpace = previousSection.spaces.find((space) => space.id === nextSpace.id)
        return previousSpace?.status !== nextSpace.status
      })
      .map((space) => space.id)
  })

  return { sections: nextSections, changedIds }
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

export type RecommendationFactors = {
  availability: number
  walkingDistance: number
  sectionAccess: number
  bayType: number
  reasonableDistance: number
}

export type RankedRecommendation = {
  space: ParkingSpace
  section: LotSection
  score: number
  walkDistance: number
  factors: RecommendationFactors
}

function sectionAccessScore(section: LotSection) {
  if (section.id === "north") return 14
  if (section.id === "south") return 10
  return 7
}

function bayTypeScore(space: ParkingSpace) {
  if (space.bayType === "standard") return 8
  if (space.bayType === "compact") return 6
  if (space.bayType === "ev" || space.bayType === "accessible") return 4
  return 0
}

function walkDistanceFor(section: LotSection, space: ParkingSpace) {
  const sectionOffset = section.id === "north" ? 0 : section.id === "south" ? 12 : 22
  const rowIndex = space.row.charCodeAt(0) - 65
  return 18 + sectionOffset + rowIndex * 12 + space.number * 3
}

/**
 * Ranks the currently open general bays using an explicit, prototype-only
 * score. It considers availability, walking distance, section access, bay
 * type, and a preference for a reasonable walking distance.
 */
export function rankRecommendations(sections: LotSection[]): RankedRecommendation[] {
  return sections
    .flatMap((section) =>
      section.spaces
        .filter((space) => space.status === "available")
        .map((space) => {
          const walkDistance = walkDistanceFor(section, space)
          const factors: RecommendationFactors = {
            availability: 45,
            walkingDistance: Math.max(0, 24 - walkDistance * 0.2),
            sectionAccess: sectionAccessScore(section),
            bayType: bayTypeScore(space),
            reasonableDistance: Math.max(0, 14 - Math.abs(walkDistance - 42) * 0.2),
          }
          const score = Math.round(
            Math.min(
              100,
              factors.availability +
                factors.walkingDistance +
                factors.sectionAccess +
                factors.bayType +
                factors.reasonableDistance,
            ),
          )

          return { space, section, score, walkDistance, factors }
        }),
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.walkDistance - b.walkDistance ||
        a.space.id.localeCompare(b.space.id),
    )
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
    desc: "Parking cameras provide sample frames for the prototype simulation.",
    icon: "camera",
  },
  {
    step: "02",
    title: "Bay State Update",
    desc: "The demo advances simulated occupied and open bay states on a timed loop.",
    icon: "scan",
  },
  {
    step: "03",
    title: "Occupancy Summary",
    desc: "The interface summarizes the current simulated states into an occupancy view.",
    icon: "cpu",
  },
  {
    step: "04",
    title: "Recommendation Engine",
    desc: "A ranking engine scores available bays by distance, access, and turnover.",
    icon: "route",
  },
] as const
