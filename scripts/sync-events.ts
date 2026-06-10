/**
 * Pull annual-event brackets straight from the Eyes on Score API into the
 * static JSON the site reads (src/data/events/<year>.json).
 *
 *   EOS_API_TOKEN=... pnpm sync:events
 *
 * Uses tournament_group_bracket_layout — the authoritative single-elimination
 * pairing tree (seeds, head-to-head matches, real winners). The champion is the
 * winner of the final round's gold match, NOT the highest raw score.
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const TOKEN = process.env.EOS_API_TOKEN
if (TOKEN === undefined || TOKEN === '') {
  console.error('EOS_API_TOKEN is required (see .env)')
  process.exit(1)
}

const API = 'https://api.eyesonscore.com/api'
const HEADERS = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

const TOURNAMENTS = [
  { year: 2025, id: 'V0V0bVVGaUNzUjZrajNQN0p4eUU3QT09', name: '2025 Texas Ringer' },
  { year: 2024, id: 'ZEp4ZUFsZm9ZSTBlb21YTnBNeXhlQT09', name: '2024 Texas Ringer' },
] as const

async function post(url: string): Promise<any> {
  const res = await fetch(url, { method: 'POST', headers: HEADERS })
  const json = await res.json()
  if (json.status_code !== 200) throw new Error(`${url.slice(0, 90)} -> ${json.message ?? res.status}`)
  return json.data
}

function toInt(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

function won(s: any): boolean {
  return String(s?.winner ?? '') === '1'
}

function shooterCard(s: any) {
  return {
    name: String(s?.name ?? '').trim(),
    seed: toInt(s?.rank),
    score: toInt(s?.score),
    winner: won(s),
  }
}

/** Chunk a round's bracket-ordered shooter list into head-to-head matches. */
function toMatches(shooters: any[]) {
  const matches: { a: ReturnType<typeof shooterCard>; b: ReturnType<typeof shooterCard> | null }[] = []
  for (let i = 0; i < shooters.length; i += 2) {
    matches.push({
      a: shooterCard(shooters[i]),
      b: shooters[i + 1] ? shooterCard(shooters[i + 1]) : null,
    })
  }
  return matches
}

function sessionDate(rows: any[]): string {
  for (const r of rows) {
    const m = /(\d{2})-(\d{2})-(\d{4})/.exec(String(r.session ?? ''))
    if (m) return `${m[3]}-${m[1]}-${m[2]}`
  }
  return ''
}

async function syncTournament(t: (typeof TOURNAMENTS)[number]) {
  const qual = await post(`${API}/tournament_score_list?is_private=false&id=${t.id}&for_fav=true`)
  const qualSorting = qual.sortingResult ?? {}

  const divisions: any[] = []
  let archers = 0
  let date = ''

  for (const group of Object.keys(qualSorting)) {
    const rows = Object.values(qualSorting[group] ?? {}) as any[]
    if (rows.length === 0) continue
    archers += rows.length
    if (date === '') date = sessionDate(rows)

    const qualification = rows.map((r) => ({
      rank: toInt(r.rank),
      name: String(r.name ?? '').trim(),
      avg: String(r.avg_count ?? ''),
      score: toInt(r.total_score),
    }))

    // Any shooter in the group keys the bracket layout for the whole group.
    const shooterId = String(rows[0].shooter_id ?? '')
    let bracket: { rounds: { name: string; matches: any[] }[] } | null = null
    let champion: string | null = null

    if (shooterId !== '') {
      const layout = await post(
        `${API}/tournament_group_bracket_layout?id=${t.id}&shooter_id=${encodeURIComponent(shooterId)}`,
      ).catch(() => null)
      const result = layout?.result
      if (result && Object.keys(result).length > 0) {
        const rounds = Object.entries(result).map(([name, shooters]) => ({
          name,
          matches: toMatches(shooters as any[]),
        }))
        bracket = { rounds }
        const finalRound = rounds[rounds.length - 1]
        const goldMatch = finalRound?.matches[0]
        champion =
          goldMatch?.a.winner ? goldMatch.a.name : goldMatch?.b?.winner ? goldMatch.b.name : null
      }
    }

    // No bracket (qual-only division): champion is the top qualifier.
    if (champion === null && bracket === null) {
      champion = qualification.find((q) => q.rank === 1)?.name ?? null
    }

    divisions.push({ name: group, champion, qualification, bracket })
  }

  const out = {
    year: t.year,
    name: t.name,
    venue: 'Texas Archery',
    date: date || String(t.year),
    archers,
    divisions,
  }
  const file = path.join(process.cwd(), 'src', 'data', 'events', `${t.year}.json`)
  writeFileSync(file, JSON.stringify(out, null, 1))
  console.log(
    `${t.year}: ${divisions.length} divisions, ${archers} archers, ` +
      `${divisions.filter((d) => d.bracket).length} with brackets, ` +
      `${divisions.filter((d) => d.champion).length} champions -> ${path.basename(file)}`,
  )
}

async function main() {
  for (const t of TOURNAMENTS) await syncTournament(t)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
