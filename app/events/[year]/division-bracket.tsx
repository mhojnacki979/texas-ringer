import type { EventDivision } from '@/data/events'
import { roundLabel } from '@/data/events'

/**
 * Progression bracket for a shoot-off division. The Texas Ringer eliminations
 * are a shoot-DOWN (the field narrows 16 -> 8 -> 4 -> finals), not head-to-head
 * pairings — so this renders one column per round, archers as cards, with those
 * who advanced to the next round highlighted and flowing toward the champion.
 */

interface BracketCard {
  rank: number
  name: string
  score: number
  advanced: boolean
  isChampion: boolean
}

function buildColumns(division: EventDivision): { label: string; count: number; cards: BracketCard[] }[] {
  const total = division.eliminationRounds.length
  return division.eliminationRounds.map((round, i) => {
    const nextNames = new Set(
      (division.eliminationRounds[i + 1]?.results ?? []).map((r) => r.name),
    )
    const isFinal = i === total - 1
    const cards: BracketCard[] = [...round.results]
      .sort((a, b) => a.rank - b.rank)
      .map((r) => ({
        rank: r.rank,
        name: r.name,
        score: r.score,
        advanced: nextNames.has(r.name),
        isChampion: isFinal && r.name === division.champion,
      }))
    return { label: roundLabel(i, total), count: round.results.length, cards }
  })
}

function Card({ card }: { card: BracketCard }) {
  const cls = card.isChampion
    ? 'bracket-card is-champion'
    : card.advanced
      ? 'bracket-card is-advanced'
      : 'bracket-card'
  return (
    <div className={cls}>
      <span className="bracket-seed">{card.rank}</span>
      <span className="bracket-card-name">{card.name}</span>
      <span className="bracket-card-score">{card.score}</span>
    </div>
  )
}

export function DivisionBracket({ division }: { division: EventDivision }) {
  const columns = buildColumns(division)
  if (columns.length === 0) {
    return <p className="muted">No shoot-off rounds recorded for this division.</p>
  }

  return (
    <div className="bracket-scroll">
      <div className="bracket-grid">
        {columns.map((col, i) => (
          <div className="bracket-col" key={`${col.label}-${i}`}>
            <div className="bracket-col-head">
              <span className="bracket-col-name">{col.label}</span>
              <span className="bracket-col-count">{col.count}</span>
            </div>
            <div className="bracket-col-cards">
              {col.cards.map((c) => (
                <Card card={c} key={`${c.rank}-${c.name}`} />
              ))}
            </div>
          </div>
        ))}
        {division.champion !== null && (
          <div className="bracket-col bracket-col-champion">
            <div className="bracket-col-head">
              <span className="bracket-col-name is-gold">Champion</span>
            </div>
            <div className="bracket-col-cards">
              <div className="bracket-card is-champion bracket-champion-final">
                <span className="bracket-card-name">{division.champion}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
