/**
 * Annual-event results (historical EOS exports, parsed to JSON in
 * src/data/events/). Static data — no database involved.
 */
import event2024 from './events/2024.json'
import event2025 from './events/2025.json'

export interface EventQualRow {
  rank: number
  name: string
  avg: string
  score: number
}

export interface EventElimRow {
  rank: number
  name: string
  ends: number[]
  score: number
  winner: boolean
}

export interface EventElimRound {
  round: number
  results: EventElimRow[]
}

export interface EventDivision {
  name: string
  qualification: EventQualRow[]
  eliminationRounds: EventElimRound[]
  champion: string | null
}

export interface AnnualEvent {
  year: number
  name: string
  venue: string
  date: string
  archers: number
  divisions: EventDivision[]
}

const EVENTS: AnnualEvent[] = [event2025 as AnnualEvent, event2024 as AnnualEvent]

export function listEvents(): AnnualEvent[] {
  return EVENTS
}

export function getEvent(year: number): AnnualEvent | null {
  return EVENTS.find((e) => e.year === year) ?? null
}

/** Standard archery elimination round names, counting back from the final. */
const ROUND_NAMES_FROM_FINAL = [
  'Finals',
  'Semi Finals',
  'Quarter Finals',
  '1/8th Round',
  '1/16th Round',
] as const

/**
 * Label a shoot-off round by its position from the final. The last round is
 * always "Finals", the prior is "Semi Finals", etc. — matching how Eyes on
 * Score names the rounds, regardless of how many an undersized field needed.
 */
export function roundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex
  return ROUND_NAMES_FROM_FINAL[fromEnd] ?? `Round ${roundIndex + 1}`
}
