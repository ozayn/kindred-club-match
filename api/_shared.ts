// Underscore-prefixed so Vercel doesn't treat this as its own route —
// it's imported by the other functions in this directory.
//
// Axis definitions are intentionally duplicated here rather than imported
// from ../src/data/clubs.ts: Vercel's Node.js function bundler doesn't
// reliably resolve relative imports that reach outside the /api directory
// (fails at runtime with ERR_MODULE_NOT_FOUND even though local builds and
// type-checks pass). Keep this list in sync with AXES in src/data/clubs.ts
// if the axes ever change.
export type Axis =
  | 'tradition'
  | 'attackingStyle'
  | 'localRoots'
  | 'underdog'
  | 'fanPassion'
  | 'galacticos'
  | 'socialIdentity'

export const AXIS_DEFINITIONS: { key: Axis; label: string; low: string; high: string }[] = [
  { key: 'tradition', label: 'History & Tradition', low: 'A newer story', high: 'Deep, storied history' },
  { key: 'attackingStyle', label: 'Style of Play', low: 'Disciplined & defensive', high: 'Open & attacking' },
  { key: 'localRoots', label: 'Roots vs. Global Brand', low: 'Global commercial giant', high: 'Local & community-rooted' },
  { key: 'underdog', label: 'Underdog vs. Dynasty', low: 'Dominant establishment', high: 'Underdog spirit' },
  { key: 'fanPassion', label: 'Fan Culture Intensity', low: 'Calm, understated', high: 'Ultras, full-throated passion' },
  { key: 'galacticos', label: 'Star Power vs. Academy', low: 'Homegrown, developed', high: 'Big-money star signings' },
  { key: 'socialIdentity', label: 'Social & Political Identity', low: 'Apolitical, neutral', high: 'Strong social/political identity' },
]

export const AXIS_KEYS: Axis[] = AXIS_DEFINITIONS.map((a) => a.key)

// Models sometimes wrap JSON responses in markdown code fences even when
// told not to. Strip them defensively before JSON.parse.
export function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return fenceMatch ? fenceMatch[1] : trimmed
}
