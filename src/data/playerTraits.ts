import type { Axis } from './clubs'

// Hand-curated axis nudges for notable players who aren't tied to any of our
// 33 clubs' rosters (so the free-text player search has no club to vote for).
// Keyed by lowercase name. Each entry is a rough footballing archetype, not a
// precise rating — it lets a named player still shape a user's taste profile
// instead of being silently ignored.
export const PLAYER_TRAITS: Record<string, Partial<Record<Axis, number>>> = {
  'ramin rezaeian': { attackingStyle: 6, localRoots: 7, underdog: 8, fanPassion: 8, galacticos: 2 },
}
