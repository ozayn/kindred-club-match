import { AXES, CLUBS, type Axis, type Club } from '../data/clubs'
import { TASTE_SIGNALS, type TasteSignal } from '../data/tasteSignals'

export type UserScores = Record<Axis, number>

export interface MatchResult {
  club: Club
  score: number // 0-100
  axisFit: Record<Axis, number> // 0-100 per axis, for display
  playerHits: string[] // liked players who play/played at this club
}

// Very small, transparent keyword weighting used to nudge the vector-similarity
// score based on free-text input. Not a language model — just a legible boost
// so the "in your own words" field visibly matters.
const KEYWORD_AXIS_HINTS: Partial<Record<Axis, string[]>> = {
  tradition: ['history', 'historic', 'tradition', 'legacy', 'heritage', 'old', 'classic'],
  attackingStyle: ['attack', 'entertaining', 'flair', 'exciting', 'goals', 'possession', 'beautiful football', 'technical'],
  localRoots: ['community', 'local', 'roots', 'working class', 'working-class', 'neighbourhood', 'neighborhood', 'authentic', 'grassroots'],
  underdog: ['underdog', 'underrated', 'small', 'overachieve', 'resilience', 'scrappy', 'punch above'],
  fanPassion: ['passion', 'ultras', 'atmosphere', 'loud', 'intense', 'chant', 'fans'],
  galacticos: ['star', 'galactico', 'money', 'spending', 'superstar', 'famous players', 'big names'],
  socialIdentity: ['politics', 'political', 'values', 'social justice', 'lgbt', 'anti-fascist', 'activism', 'identity', 'culture'],
}

interface FreeTextBoost {
  axisHits: Partial<Record<Axis, number>>
  tagHits: number
}

function scoreFromFreeText(text: string, club: Club): FreeTextBoost {
  const lower = text.toLowerCase()
  const axisHits: Partial<Record<Axis, number>> = {}
  if (!lower.trim()) return { axisHits, tagHits: 0 }

  for (const axis of Object.keys(KEYWORD_AXIS_HINTS) as Axis[]) {
    const hints = KEYWORD_AXIS_HINTS[axis] ?? []
    const hit = hints.some((h) => lower.includes(h))
    if (hit) axisHits[axis] = club.scores[axis]
  }

  // Direct tag matches against the club's own tags carry more weight
  const tagHits = club.tags.filter((tag) => lower.includes(tag.toLowerCase())).length
  return { axisHits, tagHits }
}

function normalizePlayerName(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase()
}

function joinFreeText(entries: string[]): string {
  return entries.join('. ')
}

function scorePlayerMatches(players: string[], club: Club): string[] {
  const entries = players.map((s) => normalizePlayerName(s)).filter((s) => s.length >= 2)
  if (!entries.length) return []

  const clubPlayers = [...club.currentStars, ...club.legends]
  const matched = new Set<string>()

  for (const entry of entries) {
    for (const cp of clubPlayers) {
      const normCp = normalizePlayerName(cp)
      if (normCp.includes(entry) || entry.includes(normCp)) {
        matched.add(cp.replace(/\s*\([^)]*\)/g, '').trim())
        break
      }
    }
  }
  return [...matched]
}

export interface TasteSignalNote {
  label: string
  axes: Axis[]
  source: 'curated' | 'ai'
}

// For players, teams, or moments that aren't tied to any of our 33 clubs
// (named in the "players you love" list, or mentioned in the free-text
// answer), fall back to a hand-curated axis profile so they still shape the
// taste vector used for matching — instead of being silently inert.
// `extraSignals` carries AI-derived signals for entries the curated list
// doesn't cover (see findUnmatchedEntries + /api/taste-signal).
function findTasteSignals(players: string[], freeTextEntries: string[], extraSignals: TasteSignal[] = []) {
  const lowerFreeText = joinFreeText(freeTextEntries).toLowerCase()
  const lowerPlayers = players.map((p) => normalizePlayerName(p))
  const allSignals = [...TASTE_SIGNALS, ...extraSignals]

  return allSignals.filter((signal) => {
    const inPlayers = lowerPlayers.some((p) => p.includes(signal.match) || signal.match.includes(p))
    const inFreeText = lowerFreeText.includes(signal.match)
    return inPlayers || inFreeText
  })
}

export function getTasteSignalNotes(
  players: string[],
  freeTextEntries: string[],
  extraSignals: TasteSignal[] = [],
): TasteSignalNote[] {
  const extraMatches = new Set(extraSignals.map((s) => s.match))
  return findTasteSignals(players, freeTextEntries, extraSignals).map((s) => ({
    label: s.label,
    axes: Object.keys(s.axes) as Axis[],
    source: extraMatches.has(s.match) ? 'ai' : 'curated',
  }))
}

function applyTasteSignalNudges(
  userScores: UserScores,
  players: string[],
  freeTextEntries: string[],
  extraSignals: TasteSignal[] = [],
): UserScores {
  const signals = findTasteSignals(players, freeTextEntries, extraSignals)
  if (!signals.length) return userScores

  const adjusted = { ...userScores }
  for (const axis of AXES.map((a) => a.key)) {
    const values = signals.map((s) => s.axes[axis]).filter((v): v is number => v !== undefined)
    if (!values.length) continue
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    // Blend lightly — enough to visibly shift the profile without letting a
    // single signal override what the sliders say.
    adjusted[axis] = userScores[axis] * 0.7 + avg * 0.3
  }
  return adjusted
}

// Entries (named players, or free-text sentences) that neither the club
// rosters nor the curated taste-signal list recognize — candidates to send
// to the AI fallback so they aren't silently ignored. Each free-text
// sentence is checked independently so a curated match in one sentence
// doesn't hide an unrecognized one in another.
export function findUnmatchedEntries(players: string[], freeTextEntries: string[]): string[] {
  const unmatched: string[] = []

  for (const p of players) {
    const norm = normalizePlayerName(p)
    if (norm.length < 2) continue

    const isClubTied = CLUBS.some((club) =>
      [...club.currentStars, ...club.legends].some((cp) => {
        const normCp = normalizePlayerName(cp)
        return normCp.includes(norm) || norm.includes(normCp)
      }),
    )
    const isCurated = TASTE_SIGNALS.some((s) => norm.includes(s.match) || s.match.includes(norm))
    if (!isClubTied && !isCurated) unmatched.push(p)
  }

  for (const sentence of freeTextEntries) {
    const trimmed = sentence.trim()
    if (!trimmed) continue
    const lower = trimmed.toLowerCase()
    const isCurated = TASTE_SIGNALS.some((s) => lower.includes(s.match))
    if (!isCurated) unmatched.push(trimmed)
  }

  return unmatched
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let magA = 0
  let magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

export function matchClubs(
  userScores: UserScores,
  freeTextEntries: string[],
  players: string[],
  leagueFilter?: string,
  extraSignals: TasteSignal[] = [],
): MatchResult[] {
  const axes = AXES.map((a) => a.key)
  const rawUserVec = axes.map((a) => userScores[a])

  // Curated (and, where available, AI-derived) taste signals nudge the
  // vector used for ranking; the radar chart below still shows the raw
  // slider answers.
  const effectiveScores = applyTasteSignalNudges(userScores, players, freeTextEntries, extraSignals)
  const userVec = axes.map((a) => effectiveScores[a])

  const results: MatchResult[] = CLUBS
    .filter((c) => !leagueFilter || leagueFilter === 'All' || c.league === leagueFilter)
    .map((club) => {
      const clubVec = axes.map((a) => club.scores[a])
      const similarity = cosineSimilarity(userVec, clubVec) // -1..1, but our data is 0-10 so effectively 0..1
      let score = similarity * 100

      // Free-text nudge: small, bounded boost so it visibly matters without
      // overwhelming the structured quiz answers.
      const { axisHits, tagHits } = scoreFromFreeText(joinFreeText(freeTextEntries), club)
      score += Object.keys(axisHits).length * 1.5
      if (tagHits) score += Math.min(tagHits * 3, 9)

      // Liked-player nudge: a strong, legible signal since naming a player
      // is a near-direct vote for their club.
      const playerHits = scorePlayerMatches(players, club)
      score += Math.min(playerHits.length * 10, 30)

      // Small tie-breaking jitter so near-identical matches don't always
      // resolve the same way between quiz attempts — bounded tightly enough
      // that it can only reorder genuine near-ties, never flip a real gap.
      score += (Math.random() - 0.5) * 0.6

      score = Math.max(0, Math.min(100, score))

      const axisFit: Record<Axis, number> = {} as Record<Axis, number>
      axes.forEach((a, i) => {
        // per-axis closeness, 0-100, for the radar chart — measured against
        // the raw slider answers, not the player-trait-nudged vector, so the
        // chart always reflects what the user actually set.
        const diff = Math.abs(rawUserVec[i] - clubVec[i])
        axisFit[a] = Math.round(100 - (diff / 10) * 100)
      })

      return { club, score: Math.round(score * 10) / 10, axisFit, playerHits }
    })

  return results.sort((a, b) => b.score - a.score)
}
