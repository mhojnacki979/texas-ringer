import type { BracketMatch, BracketShooter, EventDivision } from '@/data/events'

/**
 * True single-elimination bracket. Each round is a column of head-to-head
 * matches (the EOS pairing tree); winners are highlighted and flow rightward
 * to the champion. Matches space out per column so each aligns with the merge
 * point of the next round, the classic bracket shape.
 */

function ShooterRow({ shooter }: { shooter: BracketShooter | null }) {
  if (shooter === null) {
    return (
      <div className="match-row is-bye">
        <span className="match-seed" />
        <span className="match-name muted">Bye</span>
      </div>
    )
  }
  return (
    <div className={`match-row${shooter.winner ? ' is-winner' : ''}`}>
      <span className="match-seed">{shooter.seed}</span>
      <span className="match-name">{shooter.name}</span>
      <span className="match-score">{shooter.score}</span>
    </div>
  )
}

function Match({ match }: { match: BracketMatch }) {
  return (
    <div className="match">
      <ShooterRow shooter={match.a} />
      <ShooterRow shooter={match.b} />
    </div>
  )
}

export function DivisionBracket({ division }: { division: EventDivision }) {
  const rounds = division.bracket?.rounds ?? []
  if (rounds.length === 0) {
    return <p className="muted">No bracket recorded for this division.</p>
  }

  return (
    <div className="bracket-scroll">
      <div className="bracket-grid">
        {rounds.map((round, i) => (
          <div className="bracket-col" key={`${round.name}-${i}`}>
            <div className="bracket-col-head">
              <span className="bracket-col-name">{round.name}</span>
            </div>
            <div className="bracket-col-matches">
              {round.matches.map((m, j) => (
                <Match match={m} key={`${m.a.name}-${m.b?.name ?? 'bye'}-${j}`} />
              ))}
            </div>
          </div>
        ))}
        {division.champion !== null && (
          <div className="bracket-col bracket-col-champion">
            <div className="bracket-col-head">
              <span className="bracket-col-name is-gold">Champion</span>
            </div>
            <div className="bracket-col-matches">
              <div className="champion-chip">{division.champion}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
