import { useMemo, useState } from 'react'
import type { UserScores, MatchResult } from '../lib/match'
import { matchClubs, getTasteSignalNotes } from '../lib/match'
import { AXES } from '../data/clubs'
import { FitRadar } from './FitRadar'
import { ClubCard } from './ClubCard'

interface ResultsPageProps {
  userScores: UserScores
  freeText: string
  players: string[]
  initialLeague?: string
  onRestart: () => void
}

const LEAGUES = ['All', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1']

export function ResultsPage({ userScores, freeText, players, initialLeague, onRestart }: ResultsPageProps) {
  const [league, setLeague] = useState(initialLeague ?? 'All')
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')

  const results: MatchResult[] = useMemo(
    () => matchClubs(userScores, freeText, players, league),
    [userScores, freeText, players, league],
  )

  const top = results[0]
  const rest = results.slice(1, 10)

  const traitNotes = useMemo(() => getTasteSignalNotes(players, freeText), [players, freeText])

  if (!top) return null

  const axisLabel = (key: string) => AXES.find((a) => a.key === key)?.label ?? key

  async function handleShare() {
    const pct = Math.round(top.score)
    const tagline = top.club.tags[0]
    const shareText = `I'm a ${pct}% match for ${top.club.name} (${top.club.league} · ${top.club.city}) on Kindred — "${tagline}" energy. Find your own club:`
    const url = window.location.origin

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Kindred — find your club', text: shareText, url })
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
      return
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${url}`)
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 2000)
    } catch {
      // Clipboard API blocked or unavailable — fall back to a manual-copy prompt.
      window.prompt('Copy this link to share:', `${shareText} ${url}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 fade-in">
      <p className="text-xs tracking-widest uppercase text-[var(--muted)] mb-3">Your match</p>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="font-display text-4xl">{top.club.name}</h1>
        <button
          onClick={handleShare}
          className="shrink-0 text-xs px-4 py-2 rounded-full border border-[var(--line)] hover:border-[var(--ink)] transition-colors"
        >
          {shareState === 'copied' ? 'Link copied ✓' : 'Share ↗'}
        </button>
      </div>
      <p className="text-[var(--muted)] mb-8">
        {top.club.league} · {top.club.city}, {top.club.country} · founded {top.club.founded}
      </p>

      <div className="border border-[var(--line)] rounded-2xl p-6 mb-4 bg-white/50">
        <FitRadar userScores={userScores} clubScores={top.club.scores} color={top.club.color} />
      </div>

      {traitNotes.length > 0 && (
        <p className="text-xs text-[var(--muted)] mb-10 leading-relaxed">
          {traitNotes.map((n) => (
            <span key={n.label}>
              Because of <strong className="text-[var(--ink)]">{n.label}</strong>, we nudged your
              taste profile toward {n.axes.map(axisLabel).join(', ')}.{' '}
            </span>
          ))}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
        <SummaryStat label="Philosophy" value={top.club.philosophy} />
        <SummaryStat label="Culture" value={top.club.culture} />
      </div>

      <ClubCard result={top} rank={1} defaultOpen />

      <div className="mt-16 mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl">Other clubs worth knowing</h2>
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="text-xs border border-[var(--line)] rounded-full px-3 py-1.5 bg-white/60 focus:outline-none"
        >
          {LEAGUES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {rest.map((r, i) => (
          <ClubCard key={r.club.id} result={r} rank={i + 2} />
        ))}
      </div>

      <button
        onClick={onRestart}
        className="mt-14 text-sm underline underline-offset-4 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
      >
        ← Start over
      </button>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">{label}</p>
      <p className="text-[var(--ink)] leading-relaxed">{value}</p>
    </div>
  )
}
