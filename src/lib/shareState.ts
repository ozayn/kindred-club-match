import { AXES, CLUBS } from '../data/clubs'
import type { UserScores } from './match'

// Compact, URL-safe encoding of a single result so a shared link can show
// a friend the actual match (club + your slider profile) without a
// backend — everything needed to render it is either in the URL or
// already in the static club data.
export function encodeShareState(clubId: string, score: number, userScores: UserScores): string {
  const vec = AXES.map((a) => userScores[a.key]).join('-')
  return `${clubId}.${Math.round(score)}.${vec}`
}

export interface DecodedShareState {
  clubId: string
  score: number
  userScores: UserScores
}

export function decodeShareState(raw: string): DecodedShareState | null {
  const parts = raw.split('.')
  if (parts.length !== 3) return null

  const [clubId, scoreStr, vecStr] = parts
  const score = Number(scoreStr)
  const vecParts = vecStr.split('-').map(Number)

  if (Number.isNaN(score)) return null
  if (vecParts.length !== AXES.length || vecParts.some((n) => Number.isNaN(n))) return null
  if (!CLUBS.some((c) => c.id === clubId)) return null

  const userScores = {} as UserScores
  AXES.forEach((a, i) => {
    userScores[a.key] = vecParts[i]
  })

  return { clubId, score, userScores }
}
