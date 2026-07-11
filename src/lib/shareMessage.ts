import type { Club } from '../data/clubs'
import type { UserScores } from './match'
import { encodeShareState } from './shareState'

export function buildShareUrl(
  origin: string,
  clubId: string,
  score: number,
  userScores: UserScores,
): string {
  const param = encodeShareState(clubId, score, userScores)
  return `${origin}/?r=${encodeURIComponent(param)}`
}

export function buildSharePayload(club: Club, score: number, url: string) {
  const pct = Math.round(score)
  const tagline = club.tags[0]

  const title = `${pct}% match — ${club.name}`
  const text = [
    `${club.league} · ${club.city}`,
    '',
    `"${tagline}" energy on Kindred.`,
    '',
    'See my match and find your club:',
    url,
  ].join('\n')

  return { title, text }
}
