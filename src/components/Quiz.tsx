import { useState } from 'react'
import { AXES, type Axis } from '../data/clubs'
import { Slider } from './Slider'
import type { UserScores } from '../lib/match'

const DEFAULT_SCORES: UserScores = {
  tradition: 5,
  attackingStyle: 5,
  localRoots: 5,
  underdog: 5,
  fanPassion: 5,
  galacticos: 5,
  socialIdentity: 5,
}

interface QuizProps {
  onComplete: (scores: UserScores, freeText: string, players: string) => void
}

export function Quiz({ onComplete }: QuizProps) {
  const [scores, setScores] = useState<UserScores>(DEFAULT_SCORES)
  const [freeText, setFreeText] = useState('')
  const [showFreeText, setShowFreeText] = useState(false)
  const [players, setPlayers] = useState('')
  const [showPlayers, setShowPlayers] = useState(false)

  const setAxis = (axis: Axis, value: number) => setScores((s) => ({ ...s, [axis]: value }))

  return (
    <div className="max-w-xl mx-auto px-6 py-16 fade-in">
      <p className="text-xs tracking-widest uppercase text-[var(--muted)] mb-3">The Quiz</p>
      <h1 className="font-display text-4xl mb-3">Where do you stand?</h1>
      <p className="text-[var(--muted)] mb-10">
        Move each slider to where you genuinely sit. There's no correct answer — a club's whole
        identity, not just its trophy count, is what we're matching against.
      </p>

      <div>
        {AXES.map((axis, i) => (
          <Slider
            key={axis.key}
            label={axis.label}
            low={axis.low}
            high={axis.high}
            blurb={axis.blurb}
            value={scores[axis.key]}
            onChange={(v) => setAxis(axis.key, v)}
            index={i}
            total={AXES.length}
          />
        ))}
      </div>

      <div className="mt-10 border-t border-[var(--line)] pt-8">
        {!showFreeText ? (
          <button
            onClick={() => setShowFreeText(true)}
            className="text-sm underline underline-offset-4 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            + Add anything in your own words (optional)
          </button>
        ) : (
          <div>
            <h3 className="font-display text-xl mb-2">In your own words</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Anything the sliders didn't capture — a country you love, a player who inspired you,
              a cause you care about.
            </p>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={4}
              placeholder="e.g. I care about clubs that stand for something beyond football..."
              className="w-full border border-[var(--line)] rounded-lg p-4 text-sm bg-white/60 focus:outline-none focus:border-[var(--ink)] transition-colors resize-none"
            />
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-[var(--line)] pt-8">
        {!showPlayers ? (
          <button
            onClick={() => setShowPlayers(true)}
            className="text-sm underline underline-offset-4 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            + Name some players you love (optional)
          </button>
        ) : (
          <div>
            <h3 className="font-display text-xl mb-2">Players you love</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Current stars or legends, one per line or comma-separated. If they play or played
              for a club in our list, it counts as a strong vote for that club.
            </p>
            <textarea
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              rows={3}
              placeholder="e.g. Haaland, Bellingham, Maradona"
              className="w-full border border-[var(--line)] rounded-lg p-4 text-sm bg-white/60 focus:outline-none focus:border-[var(--ink)] transition-colors resize-none"
            />
          </div>
        )}
      </div>

      <button
        onClick={() => onComplete(scores, freeText, players)}
        className="mt-12 w-full sm:w-auto px-8 py-4 bg-[var(--ink)] text-[var(--paper)] rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity"
      >
        Find my club →
      </button>
    </div>
  )
}
