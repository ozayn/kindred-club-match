/// <reference types="node" />
import sharp from 'sharp'
import { decodeShareLink, sharePreview } from './shareMeta.js'

interface VercelLikeRequest {
  query?: Record<string, string | string[] | undefined>
}
interface VercelLikeResponse {
  setHeader(name: string, value: string): void
  status(code: number): VercelLikeResponse
  send(body: Buffer): void
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function initials(name: string) {
  return name
    .split(' ')
    .filter((w) => !['FC', 'CF', 'AC', 'AS', 'of', 'de', 'the', '&'].includes(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function buildShareCardSvg(opts: {
  pct?: number
  clubName?: string
  subtitle?: string
  tagline?: string
  color?: string
}) {
  const pct = opts.pct ?? null
  const clubName = escapeXml(opts.clubName ?? 'Kindred')
  const subtitle = escapeXml(opts.subtitle ?? 'Find the club that feels like you')
  const tagline = escapeXml(opts.tagline ?? 'Values, culture, and footballing philosophy')
  const color = opts.color ?? '#16171a'
  const badge = pct !== null ? initials(opts.clubName ?? 'K') : 'K'
  const headline = pct !== null ? `${pct}% match` : 'Kindred'

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#faf9f6"/>
  <rect x="0" y="0" width="1200" height="8" fill="#16171a"/>
  <circle cx="160" cy="315" r="88" fill="${color}"/>
  <text x="160" y="332" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="700">${badge}</text>
  <text x="300" y="250" fill="#78766f" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" letter-spacing="6">KINDRED</text>
  <text x="300" y="320" fill="#16171a" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="600">${escapeXml(headline)}</text>
  <text x="300" y="390" fill="#16171a" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500">${clubName}</text>
  <text x="300" y="440" fill="#78766f" font-family="Inter, Arial, sans-serif" font-size="28">${subtitle}</text>
  <text x="300" y="500" fill="#78766f" font-family="Inter, Arial, sans-serif" font-size="24">"${tagline}"</text>
</svg>`
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  const raw = typeof req.query?.r === 'string' ? req.query.r : undefined
  let svg: string

  if (raw) {
    const decoded = decodeShareLink(raw)
    const preview = decoded ? sharePreview(decoded.clubId, decoded.score) : null
    if (preview) {
      svg = buildShareCardSvg({
        pct: preview.pct,
        clubName: preview.club.name,
        subtitle: `${preview.club.league} · ${preview.club.city}`,
        tagline: preview.club.tag,
        color: preview.club.color,
      })
    } else {
      svg = buildShareCardSvg({})
    }
  } else {
    svg = buildShareCardSvg({})
  }

  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800')
  res.status(200).send(png)
}
