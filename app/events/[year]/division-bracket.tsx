import type { BracketMatch, BracketShooter, EventDivision } from '@/data/events'

/**
 * True single-elimination bracket. Each round is a column of head-to-head
 * matches (the EOS pairing tree); winners flow rightward and converge on the
 * Championship match, which sits centered directly left of the Champion box.
 *
 * The final round holds two games: match 0 is the gold/championship match
 * (winner = 1st, loser = 2nd) and match 1 is the bronze match contested by the
 * semi-final losers (winner = 3rd). The bronze match is shown in its own block
 * below so it doesn't push the championship line off-centre.
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

function Match({ match, bronze }: { match: BracketMatch; bronze?: boolean }) {
  return (
    <div className={`match${bronze ? ' is-bronze-match' : ''}`}>
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

  const lastIndex = rounds.length - 1
  const bronzeMatch = rounds[lastIndex]?.matches[1] ?? null

  return (
    <>
      <div className="bracket-scroll">
        <div className="bracket-grid">
          {rounds.map((round, i) => {
            // Final round: show only the championship match so it centres.
            const matches = i === lastIndex ? round.matches.slice(0, 1) : round.matches
            return (
              <div className="bracket-col" key={`${round.name}-${i}`}>
                <div className="bracket-col-head">
                  <span className="bracket-col-name">{round.name}</span>
                </div>
                <div className="bracket-col-matches">
                  {matches.map((m, j) => (
                    <Match match={m} key={`${m.a.name}-${m.b?.name ?? 'bye'}-${j}`} />
                  ))}
                </div>
              </div>
            )
          })}
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

      {bronzeMatch !== null && (
        <div className="bronze-block">
          <span className="match-caption is-bronze">3rd Place Match</span>
          <Match match={bronzeMatch} bronze />
        </div>
      )}
    </>
  )
}
