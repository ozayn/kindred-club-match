/// <reference types="node" />
import { AXIS_DEFINITIONS, AXIS_KEYS, type Axis, stripCodeFences } from './_shared.js'

function buildSystemPrompt(): string {
  const axisDescriptions = AXIS_DEFINITIONS.map(
    (a) => `- ${a.key}: ${a.label} (0 = ${a.low}, 10 = ${a.high})`,
  ).join('\n')

  return `You infer a football-fan "taste profile" from a short entry (a player's name, a team, or a described moment/story) that isn't in our curated database.

Score the entry on these axes, each 0-10, ONLY including axes you have real signal for (omit any axis you have no clear connection for — do not guess just to fill every axis):
${axisDescriptions}

Respond with strict JSON only, no prose, no markdown fences, in this exact shape:
{"results": [{"entry": "<echo the input entry exactly>", "label": "<short 2-5 word display label>", "axes": {"<axisKey>": <0-10 number>, ...}}]}`
}

interface AnthropicMessage {
  content?: { type: string; text?: string }[]
}

// Minimal request/response typing so this file has no dependency on
// @vercel/node — Vercel's build detects and bundles any function under /api.
interface VercelLikeRequest {
  method?: string
  body?: unknown
}
interface VercelLikeResponse {
  status(code: number): VercelLikeResponse
  json(body: unknown): void
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Server not configured' })
    return
  }

  const body = req.body as { entries?: unknown }
  const entries = Array.isArray(body?.entries) ? body.entries : []
  if (!entries.length) {
    res.status(400).json({ error: 'entries required' })
    return
  }

  // Cap both count and length per entry to keep cost and latency bounded.
  const trimmed = entries
    .filter((e): e is string => typeof e === 'string' && e.trim().length > 0)
    .slice(0, 5)
    .map((e) => e.slice(0, 300))

  if (!trimmed.length) {
    res.status(400).json({ error: 'entries required' })
    return
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        temperature: 0,
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: `Entries:\n${trimmed.map((e) => `- ${e}`).join('\n')}` }],
      }),
    })

    if (!response.ok) {
      res.status(502).json({ error: 'AI provider error' })
      return
    }

    const data = (await response.json()) as AnthropicMessage
    const text = data.content?.find((c) => c.type === 'text')?.text ?? ''
    const parsed = JSON.parse(stripCodeFences(text)) as { results?: unknown }

    const results = Array.isArray(parsed.results)
      ? parsed.results
          .filter(
            (r): r is { entry: string; label: string; axes?: Record<string, unknown> } =>
              !!r &&
              typeof r === 'object' &&
              typeof (r as { entry?: unknown }).entry === 'string' &&
              typeof (r as { label?: unknown }).label === 'string',
          )
          .map((r) => ({
            entry: r.entry,
            label: r.label,
            axes: Object.fromEntries(
              Object.entries(r.axes ?? {}).filter(
                (entry): entry is [Axis, number] =>
                  AXIS_KEYS.includes(entry[0] as Axis) &&
                  typeof entry[1] === 'number' &&
                  entry[1] >= 0 &&
                  entry[1] <= 10,
              ),
            ),
          }))
      : []

    res.status(200).json({ results })
  } catch {
    res.status(502).json({ error: 'AI request failed' })
  }
}
