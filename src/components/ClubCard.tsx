import { useState } from 'react'
import type { MatchResult } from '../lib/match'

interface ClubCardProps {
  result: MatchResult
  rank: number
  defaultOpen?: boolean
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

export function ClubCard({ result, rank, defaultOpen = false }: ClubCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { club, score, playerHits } = result

  return (
    <div className="border border-[var(--line)] rounded-2xl overflow-hidden bg-white/50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-black/[0.02] transition-colors"
      >
        <span className="text-xs text-[var(--muted)] w-5 shrink-0">{rank}</span>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
          style={{ backgroundColor: club.color }}
        >
          {initials(club.shortName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-lg truncate">{club.name}</h3>
            <span className="text-sm tabular-nums text-[var(--muted)] shrink-0">{Math.round(score)}% fit</span>
          </div>
          <p className="text-xs text-[var(--muted)]">{club.league} · {club.city}</p>
          {playerHits.length > 0 && (
            <p className="text-xs mt-1" style={{ color: club.color }}>
              ★ tied to {playerHits.join(', ')}
            </p>
          )}
          <div className="mt-2 h-1 bg-[var(--line)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(4, score)}%`, backgroundColor: club.color }}
            />
          </div>
        </div>
        <span className="text-[var(--muted)] text-sm shrink-0">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-5 pb-6 pt-1 fade-in space-y-4 text-sm leading-relaxed">
          <Field label="History">{club.history}</Field>
          <Field label="Philosophy">{club.philosophy}</Field>
          <Field label="Fan culture">{club.culture}</Field>
          <Field label="Values">{club.values}</Field>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Legends</p>
              <p>{club.legends.join(', ')}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Current stars</p>
              <p>{club.currentStars.join(', ')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {club.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full border border-[var(--line)] text-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">{label}</p>
      <p className="text-[var(--ink)]">{children}</p>
    </div>
  )
}
