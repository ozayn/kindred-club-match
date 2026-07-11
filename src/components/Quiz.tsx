import { useState } from 'react'
import { AXES, ALL_PLAYERS, type Axis } from '../data/clubs'
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
  onComplete: (scores: UserScores, freeTextEntries: string[], players: string[]) => void
}

export function Quiz({ onComplete }: QuizProps) {
  const [scores, setScores] = useState<UserScores>(DEFAULT_SCORES)
  const [freeTextEntries, setFreeTextEntries] = useState<string[]>([])
  const [freeTextInput, setFreeTextInput] = useState('')
  const [showFreeText, setShowFreeText] = useState(false)
  const [players, setPlayers] = useState<string[]>([])
  const [playerInput, setPlayerInput] = useState('')
  const [showPlayers, setShowPlayers] = useState(false)

  const setAxis = (axis: Axis, value: number) => setScores((s) => ({ ...s, [axis]: value }))

  const addFreeText = () => {
    const trimmed = freeTextInput.trim()
    if (!trimmed) return
    setFreeTextEntries((entries) => [...entries, trimmed])
    setFreeTextInput('')
  }

  const removeFreeText = (i: number) => setFreeTextEntries((entries) => entries.filter((_, idx) => idx !== i))

  const suggestions =
    playerInput.trim().length >= 2
      ? ALL_PLAYERS.filter(
          (p) =>
            p.name.toLowerCase().includes(playerInput.trim().toLowerCase()) &&
            !players.includes(p.name),
        ).slice(0, 6)
      : []

  const addPlayer = (name: string) => {
    setPlayers((p) => (p.includes(name) ? p : [...p, name]))
    setPlayerInput('')
  }

  const removePlayer = (name: string) => setPlayers((p) => p.filter((n) => n !== name))

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
              a cause you care about. Type a sentence and press Enter to add it, then keep going.
            </p>
            <input
              type="text"
              value={freeTextInput}
              onChange={(e) => setFreeTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                addFreeText()
              }}
              placeholder="e.g. I loved how Cape Verde fought against Argentina at the World Cup"
              className="w-full border border-[var(--line)] rounded-lg p-4 text-sm bg-white/60 focus:outline-none focus:border-[var(--ink)] transition-colors"
            />
            {freeTextEntries.length > 0 && (
              <ul className="mt-4 space-y-2">
                {freeTextEntries.map((entry, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-start justify-between gap-3 border border-[var(--line)] rounded-lg px-4 py-2.5"
                  >
                    <span>{entry}</span>
                    <button
                      type="button"
                      onClick={() => removeFreeText(i)}
                      aria-label="Remove"
                      className="text-[var(--muted)] hover:text-[var(--ink)] leading-none shrink-0"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
              Search and pick from current stars or legends for a strong vote toward their club.
              Not finding someone? Press Enter to add any name anyway — it just won't move the
              score if we don't have them on file.
            </p>
            <div className="relative">
              <input
                type="text"
                value={playerInput}
                onChange={(e) => setPlayerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  if (suggestions[0]) addPlayer(suggestions[0].name)
                  else if (playerInput.trim()) addPlayer(playerInput.trim())
                }}
                placeholder="Start typing a player name…"
                className="w-full border border-[var(--line)] rounded-lg p-4 text-sm bg-white/60 focus:outline-none focus:border-[var(--ink)] transition-colors"
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-[var(--paper)] border border-[var(--line)] rounded-lg shadow-md overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => addPlayer(s.name)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left hover:bg-black/[0.03] transition-colors"
                    >
                      <span>{s.name}</span>
                      <span className="text-xs text-[var(--muted)] shrink-0">{s.club}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {players.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {players.map((name) => (
                  <span
                    key={name}
                    className="text-xs pl-3 pr-2 py-1.5 rounded-full border border-[var(--line)] flex items-center gap-2"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removePlayer(name)}
                      aria-label={`Remove ${name}`}
                      className="text-[var(--muted)] hover:text-[var(--ink)] leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          const trimmed = freeTextInput.trim()
          const finalEntries = trimmed ? [...freeTextEntries, trimmed] : freeTextEntries
          onComplete(scores, finalEntries, players)
        }}
        className="mt-12 w-full sm:w-auto px-8 py-4 bg-[var(--ink)] text-[var(--paper)] rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity"
      >
        Find my club →
      </button>
    </div>
  )
}
