import { writeFileSync } from 'node:fs'
import { CLUBS } from '../src/data/clubs'

const meta = Object.fromEntries(
  CLUBS.map((c) => [
    c.id,
    { name: c.name, league: c.league, city: c.city, tag: c.tags[0], color: c.color },
  ]),
)

writeFileSync('api/clubShareMeta.json', JSON.stringify(meta, null, 2) + '\n')
console.log('wrote api/clubShareMeta.json')
