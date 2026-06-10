/**
 * Annual-event results, synced from the Eyes on Score API into JSON in
 * src/data/events/ (see scripts/sync-events.ts). Static data — no database.
 *
 * Brackets are the authoritative single-elimination pairing trees from EOS
 * (tournament_group_bracket_layout): seeds, head-to-head matches, real winners.
 */
import event2024 from './events/2024.json'
import event2025 from './events/2025.json'

export interface EventQualRow {
  rank: number
  name: string
  avg: string
  score: number
}

/** One archer's side of a head-to-head match. */
export interface BracketShooter {
  name: string
  seed: number
  score: number
  winner: boolean
}

export interface BracketMatch {
  a: BracketShooter
  b: BracketShooter | null
}

export interface BracketRound {
  name: string
  matches: BracketMatch[]
}

export interface EventBracket {
  rounds: BracketRound[]
}

export interface EventDivision {
  name: string
  champion: string | null
  qualification: EventQualRow[]
  bracket: EventBracket | null
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
