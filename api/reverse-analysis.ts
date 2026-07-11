/// <reference types="node" />
import { CLUBS, AXES, type Axis } from '../src/data/clubs.js'
import { stripCodeFences } from './_shared.js'

const AXIS_KEYS = AXES.map((a) => a.key)

interface VercelLikeRequest {
  method?: string
  body?: unknown
}
interface VercelLikeResponse {
  status(code: number): VercelLikeResponse
  json(body: unknown): void
}

function buildSystemPrompt(): string {
  const axisDescriptions = AXES.map(
    (a) => `- ${a.key}: ${a.label} (0 = ${a.low}, 10 = ${a.high})`,
  ).join('\n')

  return `You write a short, warm explanation of why a football fan with the given profile might be drawn to their stated club, grounded ONLY in the club's real history/philosophy/culture/values provided below — not in stereotypes about nationality or age. Treat nationality and age as light context (e.g. "growing up watching..." or "as someone into...") rather than a basis for generalizations about a nationality or generation.

Axes (reference, to choose which ones the club's story resonates with for this person):
${axisDescriptions}

Respond with strict JSON only, no prose, no markdown fences, in this exact shape:
{"explanation": "<2-4 sentence explanation, second person, warm and specific to the club's real story>", "highlightedAxes": ["<2-4 axis keys from the list above that most explain the connection>"]}`
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

  const body = req.body as {
    clubId?: string
    ageRange?: string
    nationality?: string
    otherInfo?: string
  }

  const club = CLUBS.find((c) => c.id === body.clubId)
  if (!club) {
    res.status(400).json({ error: 'Unknown club' })
    return
  }

  const profileLines = [
    body.ageRange ? `Age range: ${body.ageRange}` : null,
    body.nationality ? `Nationality/background: ${body.nationality}` : null,
    body.otherInfo ? `Other info: ${body.otherInfo}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const clubBrief = `Club: ${club.name} (${club.league})
History: ${club.history}
Philosophy: ${club.philosophy}
Culture: ${club.culture}
Values: ${club.values}
Tags: ${club.tags.join(', ')}
Axis scores: ${AXIS_KEYS.map((k) => `${k}=${club.scores[k]}`).join(', ')}`

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
        max_tokens: 512,
        temperature: 0.4,
        system: buildSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: `${clubBrief}\n\nFan profile:\n${profileLines || '(no extra info given)'}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      res.status(502).json({ error: 'AI provider error' })
      return
    }

    const data = (await response.json()) as { content?: { type: string; text?: string }[] }
    const text = data.content?.find((c) => c.type === 'text')?.text ?? ''
    const parsed = JSON.parse(stripCodeFences(text)) as { explanation?: string; highlightedAxes?: unknown }

    const highlightedAxes = Array.isArray(parsed.highlightedAxes)
      ? parsed.highlightedAxes.filter((a): a is Axis => AXIS_KEYS.includes(a as Axis))
      : []

    res.status(200).json({
      explanation: typeof parsed.explanation === 'string' ? parsed.explanation : '',
      highlightedAxes,
    })
  } catch {
    res.status(502).json({ error: 'AI request failed' })
  }
}
