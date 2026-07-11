import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public/favicon.svg'))

const sizes = [180, 192, 512]

for (const size of sizes) {
  const name =
    size === 180 ? 'apple-touch-icon.png' : `pwa-${size}x${size}.png`
  await sharp(svg).resize(size, size).png().toFile(join(root, 'public', name))
  console.log(`wrote public/${name}`)
}
