// Renders public/icon.svg into the PNG sizes iOS and the manifest need.
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'

const svg = await readFile('public/icon.svg')
const out = [
  ['public/apple-touch-icon.png', 180],
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/icon-maskable-512.png', 512],
]
for (const [file, size] of out) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(file)
}
console.log('icons written')
