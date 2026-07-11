// Underscore-prefixed so Vercel doesn't treat this as its own route —
// it's imported by the other functions in this directory.

// Models sometimes wrap JSON responses in markdown code fences even when
// told not to. Strip them defensively before JSON.parse.
export function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return fenceMatch ? fenceMatch[1] : trimmed
}
