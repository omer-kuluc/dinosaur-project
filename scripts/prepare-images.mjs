// Crops cinematic letterbox bars and exports responsive AVIF + WebP renditions,
// plus a tiny inline preview per image (the ASCII layer samples it, so it can
// start before the real photo arrives). The hero ships only its separated
// dinosaur layer, with a transparent preview so its ASCII skips the sky.
// Usage: put the sources in assets-src/<section>.webp, then: npm run images
import sharp from 'sharp'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { makeCutout } from './cutout.mjs'

const SRC = 'assets-src'
const OUT = 'public/img'
const WIDTHS = [360, 540, 768, 1024]
// Image ids used by src/data/content.js, and the source file for each.
const SOURCES = { 1: 'senses', 2: 'discovery', 4: 'bite', 5: 'anatomy', 6: 'relatives', 7: 'hero' }
const HERO = 7
// The anatomy night sky is dark enough to read as letterbox; keep its headroom.
const OVERRIDES = { 5: { top: 118 } }

// A row counts as letterbox when nearly all of it is black.
const BAR_MAX = 18
const BAR_RATIO = 0.985

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
  const pad = top > 0 || bottom < height - 1 ? 4 : 0
  return { left: 0, top: top + pad, width, height: bottom - top + 1 - pad * 2 }
}

async function renditions(buf, name, width, { alpha = false } = {}) {
  const widths = WIDTHS.filter((w) => w < width).concat(width)
  for (const w of widths) {
    const r = sharp(buf).resize({ width: w })
    await r.clone().avif({ quality: alpha ? 58 : 52, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.avif`))
    await r.clone().webp({ quality: 80, effort: 5, alphaQuality: 90 }).toFile(path.join(OUT, `${name}-${w}.webp`))
  }
  return widths
}

async function preview(buf) {
  const small = await sharp(buf).resize({ width: 96 }).webp({ quality: 55 }).toBuffer()
  return `data:image/webp;base64,${small.toString('base64')}`
}

const readMask = (maskPath) => sharp(maskPath).extractChannel(0).raw().toBuffer({ resolveWithObject: true })

// Start clean so retired renditions never linger.
await mkdir(OUT, { recursive: true })
for (const f of await readdir(OUT)) await rm(path.join(OUT, f))

const manifest = {}

for (const [key, source] of Object.entries(SOURCES)) {
  const id = Number(key)
  const file = path.join(SRC, `${source}.webp`)
  const crop = await findBars(file)
  if (OVERRIDES[id]) {
    crop.height += crop.top - OVERRIDES[id].top
    crop.top = OVERRIDES[id].top
  }
  const buf = await sharp(file).extract(crop).png().toBuffer()

  if (id === HERO) {
    // Separate the dinosaur from the sky; build RGBA by hand (sharp's
    // joinChannel drops a raw single-channel alpha here).
    const maskPath = path.join(SRC, 'mask-hero.png')
    await makeCutout(file, crop, maskPath)
    const { data: mask } = await readMask(maskPath)
    const rgb = await sharp(buf).removeAlpha().raw().toBuffer()
    const rgba = Buffer.alloc(crop.width * crop.height * 4)
    for (let i = 0; i < crop.width * crop.height; i++) {
      rgba[i * 4] = rgb[i * 3]
      rgba[i * 4 + 1] = rgb[i * 3 + 1]
      rgba[i * 4 + 2] = rgb[i * 3 + 2]
      rgba[i * 4 + 3] = mask[i]
    }
    const dino = await sharp(rgba, { raw: { width: crop.width, height: crop.height, channels: 4 } }).png().toBuffer()
    const widths = await renditions(dino, 'hero-dino', crop.width, { alpha: true })
    manifest[id] = { width: crop.width, height: crop.height, widths, preview: await preview(buf), dinoPreview: await preview(dino) }
  } else {
    const widths = await renditions(buf, `specimen-${id}`, crop.width)
    manifest[id] = { width: crop.width, height: crop.height, widths, preview: await preview(buf) }
  }
  console.log(`#${id} ${source}: ${crop.width}x${crop.height} (cropped ${crop.top}px top)`)
}

await writeFile('src/data/images.json', JSON.stringify(manifest, null, 2))
console.log('manifest written to src/data/images.json')
