import { useState } from 'react'
import type { ReactNode } from 'react'
import { CLUBS, AXES, type Axis } from '../data/clubs'

interface ReverseAnalysisProps {
  onBack: () => void
}

const AGE_RANGES = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55+']

interface AnalysisResult {
  explanation: string
  highlightedAxes: Axis[]
}

export function ReverseAnalysis({ onBack }: ReverseAnalysisProps) {
  const [clubId, setClubId] = useState(CLUBS[0].id)
  const [ageRange, setAgeRange] = useState(AGE_RANGES[1])
  const [nationality, setNationality] = useState('')
  const [otherInfo, setOtherInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const club = CLUBS.find((c) => c.id === clubId)!

  async function handleAnalyze() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/reverse-analysis', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clubId, ageRange, nationality, otherInfo }),
      })
      if (!res.ok) throw new Error('request failed')
      const data = await res.json()
      setResult({ explanation: data.explanation ?? '', highlightedAxes: data.highlightedAxes ?? [] })
    } catch {
      setError("Couldn't analyze that right now — try again in a moment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16 fade-in">
      <p className="text-xs tracking-widest uppercase text-[var(--muted)] mb-3">Reverse analysis</p>
      <h1 className="font-display text-4xl mb-3">Already have a club?</h1>
      <p className="text-[var(--muted)] mb-10">
        Tell us who you support and a little about yourself — we'll try to explain why, grounded in
        the club's own history and identity, not guesswork about who you are.
      </p>

      <div className="space-y-6">
        <Field label="Favorite club">
          <select
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            className="w-full border border-[var(--line)] rounded-lg p-3 text-sm bg-white/60 focus:outline-none focus:border-[var(--ink)] transition-colors"
          >
            {CLUBS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Age range">
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="w-full border border-[var(--line)] rounded-lg p-3 text-sm bg-white/60 focus:outline-none focus:border-[var(--ink)] transition-colors"
          >
            {AGE_RANGES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Nationality / where you're from">
          <input
            type="text"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            placeholder="e.g. Iranian"
            className="w-full border border-[var(--line)] rounded-lg p-3 text-sm bg-white/60 focus:outline-none focus:border-[var(--ink)] transition-colors"
          />
        </Field>

        <Field label="Anything else? (optional)">
          <textarea
            value={otherInfo}
            onChange={(e) => setOtherInfo(e.target.value)}
            rows={3}
            placeholder="e.g. I grew up watching with my dad, I love underdog stories..."
            className="w-full border border-[var(--line)] rounded-lg p-3 text-sm bg-white/60 focus:outline-none focus:border-[var(--ink)] transition-colors resize-none"
          />
        </Field>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-10 w-full sm:w-auto px-8 py-4 bg-[var(--ink)] text-[var(--paper)] rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Analyzing…' : 'Explain my club →'}
      </button>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-12 border-t border-[var(--line)] pt-10 fade-in">
          <h2 className="font-display text-2xl mb-4">{club.name}</h2>
          <p className="text-[var(--ink)] leading-relaxed mb-10">{result.explanation}</p>

          <div className="space-y-3">
            {AXES.map((axis) => {
              const highlighted = result.highlightedAxes.includes(axis.key)
              return (
                <div key={axis.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={highlighted ? 'text-[var(--ink)] font-semibold' : 'text-[var(--muted)]'}>
                      {axis.label} {highlighted && '★'}
                    </span>
                    <span className="text-[var(--muted)] tabular-nums">{club.scores[axis.key]}/10</span>
                  </div>
                  <div className="h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${club.scores[axis.key] * 10}%`,
                        backgroundColor: highlighted ? club.color : 'var(--muted)',
                        opacity: highlighted ? 1 : 0.35,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-14 text-sm underline underline-offset-4 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
      >
        ← Back
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2 block">{label}</label>
      {children}
    </div>
  )
}
