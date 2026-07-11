import clubShareMeta from './clubShareMeta.json'

export type ClubShareMeta = {
  name: string
  league: string
  city: string
  tag: string
  color: string
}

export const CLUB_SHARE_META = clubShareMeta as Record<string, ClubShareMeta>

export interface DecodedShareLink {
  clubId: string
  score: number
}

export function decodeShareLink(raw: string): DecodedShareLink | null {
  const parts = raw.split('.')
  if (parts.length !== 3) return null

  const [clubId, scoreStr, vecStr] = parts
  const score = Number(scoreStr)
  const vecParts = vecStr.split('-').map(Number)

  if (Number.isNaN(score)) return null
  if (vecParts.length !== 7 || vecParts.some((n) => Number.isNaN(n))) return null
  if (!CLUB_SHARE_META[clubId]) return null

  return { clubId, score }
}

export function sharePreview(clubId: string, score: number) {
  const club = CLUB_SHARE_META[clubId]
  if (!club) return null

  const pct = Math.round(score)
  return {
    title: `${pct}% match — ${club.name}`,
    description: `${club.league} · ${club.city} — "${club.tag}" energy on Kindred.`,
    club,
    pct,
  }
}
