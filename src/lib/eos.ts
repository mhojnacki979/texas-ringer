/**
 * Client-side Eyes on Score API access for the live page.
 *
 * Runs entirely in the visitor's browser (CORS is open on the EOS API). The
 * token is EOS's public read-only scoreboard token — the same one their own
 * public scoreboard ships in client code — so embedding it here is expected.
 */
import type { BracketMatch, BracketShooter, EventBracket, EventDivision } from '@/data/events'

const API = 'https://api.eyesonscore.com/api'
const TOKEN = 'Bearer 08a42685c4d02c948fd16848e38e194bab23d2ba90d390e14b772122f631c3b0b18f8cc3170040fa'

async function post(path: string): Promise<any> {
  const res = await fetch(`${API}/${path}`, {
    method: 'POST',
    headers: { Authorization: TOKEN, 'Content-Type': 'application/json' },
  })
  const json = await res.json()
  if (json.status_code !== 200) throw new Error(json.message ?? `EOS ${res.status}`)
  return json.data
}

function toInt(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

function rowsOf(sorting: any, group: string): any[] {
  const inner = sorting?.[group]
  if (inner === undefined || inner === null) return []
  // The group object mixes shooter rows with metadata keys (max_round_count,
  // elimination_round_list, active_elimination_round) — keep only shooters.
  return Object.values(inner).filter(
    (v) => typeof v === 'object' && v !== null && 'name' in v,
  )
}

function shooterCard(s: any): BracketShooter {
  return {
    name: String(s?.name ?? '').trim(),
    seed: toInt(s?.rank),
    score: toInt(s?.score),
    winner: String(s?.winner ?? '') === '1',
  }
}

function toMatches(shooters: any[]): BracketMatch[] {
  const matches: BracketMatch[] = []
  for (let i = 0; i < shooters.length; i += 2) {
    matches.push({
      a: shooterCard(shooters[i]),
      b: shooters[i + 1] ? shooterCard(shooters[i + 1]) : null,
    })
  }
  return matches
}

export interface LiveData {
  divisions: EventDivision[]
  updatedAt: number
}

/** Fetch a live snapshot: qualification standings + bracket per division. */
export async function fetchLive(tournamentId: string): Promise<LiveData> {
  const qual = await post(
    `tournament_score_list?is_private=false&id=${tournamentId}&for_fav=true`,
  )
  const sorting = qual.sortingResult ?? {}
  const groups = Object.keys(sorting)

  const divisions = await Promise.all(
    groups.map(async (group) => {
      const rows = rowsOf(sorting, group)
      const qualification = rows.map((r) => ({
        rank: toInt(r.rank),
        name: String(r.name ?? '').trim(),
        avg: String(r.avg_count ?? r.arr_avg ?? ''),
        score: toInt(r.total_score),
      }))

      // Bracket (only if this division's elimination has started).
      let bracket: EventBracket | null = null
      let champion: string | null = null
      const shooterId = String(rows[0]?.shooter_id ?? '')
      if (shooterId !== '') {
        const layout = await post(
          `tournament_group_bracket_layout?id=${tournamentId}&shooter_id=${encodeURIComponent(shooterId)}`,
        ).catch(() => null)
        const result = layout?.result
        const rounds = result
          ? Object.entries(result)
              .map(([name, shooters]) => ({ name, matches: toMatches(shooters as any[]) }))
              .filter((r) => r.matches.length > 0)
          : []
        if (rounds.length > 0) {
          bracket = { rounds }
          const final = rounds[rounds.length - 1]
          const gold = final?.matches[0]
          champion = gold?.a.winner ? gold.a.name : gold?.b?.winner ? gold.b.name : null
        }
      }

      return { name: group, champion, qualification, bracket }
    }),
  )

  return { divisions, updatedAt: Date.now() }
}
