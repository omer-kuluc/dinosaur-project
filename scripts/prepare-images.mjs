// Crops cinematic letterbox bars and exports responsive WebP renditions.
// Usage: npm run images
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'assets-src'
const OUT = 'public/img'
const WIDTHS = [480, 768, 1200]
const IDS = [1, 2, 3, 4, 5, 6]
const OVERRIDES = { 5: { top: 118 } }

// A row counts as letterbox when nearly all of it is black.
const BAR_MAX = 18 // luminance ceiling for a "black" pixel
const BAR_RATIO = 0.985 // share of black pixels needed to call the row a bar

async function findBars(file) {
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const isBar = (y) => {
    let dark = 0
    for (let x = 0; x < width; x++) if (data[y * width + x] <= BAR_MAX) dark++
    return dark / width >= BAR_RATIO
  }
  let top = 0
  while (top < height / 3 && isBar(top)) top++
  let bottom = height - 1
  while (bottom > (height * 2) / 3 && isBar(bottom)) bottom--
  // Shave a few extra px so no dark seam survives compression.
  const pad = top > 0 || bottom < height - 1 ? 4 : 0
  return { top: top + pad, height: bottom - top + 1 - pad * 2, width, full: height }
}

await mkdir(OUT, { recursive: true })
const manifest = {}

for (const id of IDS) {
  const file = path.join(SRC, `${id}.webp`)
  const bars = await findBars(file)
  // #5 has a near-black night sky that the detector mistakes for letterbox.
  if (OVERRIDES[id]) {
    const o = OVERRIDES[id]
    bars.height += bars.top - o.top
    bars.top = o.top
  }
  const cropped = sharp(file).extract({ left: 0, top: bars.top, width: bars.width, height: bars.height })
  const buf = await cropped.toBuffer()
  const widths = WIDTHS.filter((w) => w < bars.width).concat(bars.width)
  for (const w of widths) {
    await sharp(buf).resize({ width: w }).webp({ quality: 80, effort: 5 }).toFile(path.join(OUT, `specimen-${id}-${w}.webp`))
  }
  manifest[id] = { width: bars.width, height: bars.height, widths }
  console.log(`#${id}: cropped ${bars.full - bars.height}px of bars -> ${bars.width}x${bars.height}`)
}

await writeFile('src/data/images.json', JSON.stringify(manifest, null, 2))
console.log('manifest written to src/data/images.json')
