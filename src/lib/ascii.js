// Shared ASCII helpers: a glyph atlas so canvases blit pre-rendered characters
// with drawImage instead of calling fillText thousands of times per frame,
// plus cheap deterministic noise for the strata texture.

const atlasCache = new Map()

export function createAtlas({ chars, colors, cellW, cellH, fontPx, dpr }) {
  const cw = Math.max(1, Math.round(cellW * dpr))
  const ch = Math.max(1, Math.round(cellH * dpr))
  const px = Math.min(Math.round(fontPx * dpr), Math.round(ch * 0.98))
  const key = `${chars}|${colors.join(',')}|${cw}|${ch}|${px}`
  const hit = atlasCache.get(key)
  if (hit) return hit
  if (atlasCache.size > 24) atlasCache.clear()

  const canvas = document.createElement('canvas')
  canvas.width = cw * chars.length
  canvas.height = ch * colors.length
  const g = canvas.getContext('2d')
  g.font = `400 ${px}px "IBM Plex Mono", ui-monospace, monospace`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  colors.forEach((color, t) => {
    g.fillStyle = color
    for (let i = 0; i < chars.length; i++) g.fillText(chars[i], i * cw + cw / 2, t * ch + ch / 2 + dpr * 0.5)
  })

  const atlas = { canvas, cw, ch, chars }
  atlasCache.set(key, atlas)
  return atlas
}

export function hash2(x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

export function vnoise(x, y) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

export const fontsReady = () =>
  Promise.race([
    document.fonts.load('400 12px "IBM Plex Mono"').then(() => document.fonts.ready),
    new Promise((r) => setTimeout(r, 2000)),
  ])
