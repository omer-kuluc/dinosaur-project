// Crops cinematic letterbox bars and exports responsive AVIF + WebP renditions,
// a tiny inline preview per image (the ASCII layer samples it, so it can start
// before the real photo arrives), and for the hero a separated dinosaur layer
// plus a synthesised clean sky plate for true depth parallax.
// Usage: npm run images
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { makeCutout } from './cutout.mjs'

const SRC = 'assets-src'
const OUT = 'public/img'
const WIDTHS = [360, 540, 768, 1024]
const IDS = [1, 2, 4, 5, 6, 7]
const HERO = 7
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

// Clean plate: the sky is a vertical gradient, so each row of the dinosaur
// area is filled by interpolating the sky on either side of it (or copying the
// nearest row when a row is fully covered). A wide blur then melts the seams.
// Moving the dinosaur layer then never exposes a ghost of itself.
async function cleanPlate(buf, maskPath) {
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  const { data: fg } = await readMask(maskPath)
  const isSky = (i) => fg[i] < 60
  const out = Buffer.from(data)
  const rowOk = new Uint8Array(H)
  for (let y = 0; y < H; y++) {
    let x = 0
    while (x < W) {
      if (isSky(y * W + x)) {
        x++
        continue
      }
      const start = x
      while (x < W && !isSky(y * W + x)) x++
      const L = start > 0 ? (y * W + start - 1) * 3 : -1
      const R = x < W ? (y * W + x) * 3 : -1
      if (L < 0 && R < 0) break
      for (let k = start; k < x; k++) {
        const t = L < 0 ? 1 : R < 0 ? 0 : (k - start + 1) / (x - start + 1)
        for (let c = 0; c < 3; c++) {
          const a = L < 0 ? data[R + c] : data[L + c]
          const b = R < 0 ? data[L + c] : data[R + c]
          out[(y * W + k) * 3 + c] = Math.round(a + (b - a) * t)
        }
      }
      rowOk[y] = 1
    }
    let any = false
    for (let k = 0; k < W; k++) if (isSky(y * W + k)) any = true
    if (any) rowOk[y] = 1
  }
  // Rows with no sky at all copy the nearest filled row.
  for (let y = 0; y < H; y++) {
    if (rowOk[y]) continue
    let d = 1
    while (y - d >= 0 || y + d < H) {
      const s = y - d >= 0 && rowOk[y - d] ? y - d : y + d < H && rowOk[y + d] ? y + d : -1
      if (s >= 0) {
        out.copy(out, y * W * 3, s * W * 3, (s + 1) * W * 3)
        break
      }
      d++
    }
  }
  const smooth = await sharp(out, { raw: { width: W, height: H, channels: 3 } }).blur(24).raw().toBuffer()
  // Keep the real sky crisp; use the smoothed fill only inside the dinosaur.
  for (let i = 0; i < W * H; i++) {
    const k = fg[i] / 255
    for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(data[i * 3 + c] * (1 - k) + smooth[i * 3 + c] * k)
  }
  return sharp(out, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer()
}

await mkdir(OUT, { recursive: true })
const manifest = {}

for (const id of IDS) {
  const file = path.join(SRC, `${id}.webp`)
  const crop = await findBars(file)
  if (OVERRIDES[id]) {
    crop.height += crop.top - OVERRIDES[id].top
    crop.top = OVERRIDES[id].top
  }
  const buf = await sharp(file).extract(crop).png().toBuffer()
  const widths = await renditions(buf, `specimen-${id}`, crop.width)
  manifest[id] = { width: crop.width, height: crop.height, widths, preview: await preview(buf) }

  if (id === HERO) {
    const maskPath = path.join('assets-src', `mask-${id}.png`)
    await makeCutout(file, crop, maskPath)
    const plate = await cleanPlate(buf, maskPath)
    await renditions(plate, `hero-plate`, crop.width)
    // Build RGBA by hand: sharp's joinChannel drops a raw single-channel alpha here.
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
    await renditions(dino, `hero-dino`, crop.width, { alpha: true })
    // Transparent preview so the hero ASCII only draws the dinosaur, not the sky.
    manifest[id].dinoPreview = await preview(dino)
  }
  console.log(`#${id}: ${crop.width}x${crop.height} (cropped ${crop.top}px top)`)
}

await writeFile('src/data/images.json', JSON.stringify(manifest, null, 2))
console.log('manifest written to src/data/images.json')
