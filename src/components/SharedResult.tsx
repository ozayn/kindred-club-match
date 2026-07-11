import { CLUBS } from '../data/clubs'
import type { UserScores } from '../lib/match'
import { FitRadar } from './FitRadar'

interface SharedResultProps {
  clubId: string
  score: number
  userScores: UserScores
  onStartQuiz: () => void
}

export function SharedResult({ clubId, score, userScores, onStartQuiz }: SharedResultProps) {
  const club = CLUBS.find((c) => c.id === clubId)
  if (!club) return null

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 fade-in">
      <p className="text-xs tracking-widest uppercase text-[var(--muted)] mb-3">A friend's match</p>
      <h1 className="font-display text-4xl mb-2">{club.name}</h1>
      <p className="text-[var(--muted)] mb-2">
        {club.league} · {club.city}, {club.country} · founded {club.founded}
      </p>
      <p className="text-sm font-semibold mb-8" style={{ color: club.color }}>
        {Math.round(score)}% fit
      </p>

      <div className="border border-[var(--line)] rounded-2xl p-6 mb-10 bg-white/50">
        <FitRadar userScores={userScores} clubScores={club.scores} color={club.color} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Philosophy</p>
          <p className="text-[var(--ink)] leading-relaxed">{club.philosophy}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Culture</p>
          <p className="text-[var(--ink)] leading-relaxed">{club.culture}</p>
        </div>
      </div>

      <button
        onClick={onStartQuiz}
        className="px-8 py-4 bg-[var(--ink)] text-[var(--paper)] rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity"
      >
        Find your own club →
      </button>
    </div>
  )
}
