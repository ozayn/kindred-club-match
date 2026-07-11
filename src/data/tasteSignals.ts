import type { Axis } from './clubs'

export interface TasteSignal {
  match: string // lowercase substring to search for, in a player name or free-text answer
  label: string // display name for the transparency note
  axes: Partial<Record<Axis, number>>
}

// Hand-curated axis nudges for players, teams, or moments that aren't tied to
// any of our 33 clubs (so nothing in the structured data can vote for them).
// Matched against both the "players you love" list and the free-text answer.
// Each entry is a rough footballing archetype, not a precise rating — it lets
// a name or story still shape a user's taste profile instead of being
// silently ignored.
export const TASTE_SIGNALS: TasteSignal[] = [
  {
    match: 'ramin rezaeian',
    label: 'Ramin Rezaeian',
    axes: { attackingStyle: 6, localRoots: 7, underdog: 8, fanPassion: 8, galacticos: 2 },
  },
  {
    match: 'cape verde',
    label: 'Cape Verde',
    axes: { underdog: 9, fanPassion: 8, localRoots: 7, galacticos: 1, tradition: 2 },
  },
]
