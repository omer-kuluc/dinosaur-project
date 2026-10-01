import { createAtlas, fontsReady } from './ascii'
import { stepClip, stepBars } from './stepClip'

// The signature move, used on the first and last image only.
// The image is first "decoded" as ASCII sampled from its own light and shadow,
// then the photograph replaces it through a stepped pixel-block clip-path.
// Run backwards with `crumble`, the image breaks down into falling characters.
//
// The ASCII samples a ~2 KB inline preview, so it can start before the real
// photograph has downloaded. The photo layer only takes over once it has
// actually loaded; until then the characters stay on screen.
//
//   decode  0..1  characters resolve out of scrambled glyphs
//   reveal  0..1  the stepped clip-path uncovers the photograph
//   crumble 0..1  characters drop and dissolve

const RAMP = ' .:-=+*#%@'
const TONES = ['#1E451C', '#2F6230', '#5E8A66', '#9DB8A6', '#D8E6DC', '#FFFFFF', '#C99A55']
const AMBER = TONES.length - 1

const loadImage = (src) =>
  new Promise((res) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = () => res(null)
    i.src = src
  })

const whenLoaded = (el) =>
  el.complete && el.naturalWidth
    ? Promise.resolve()
    : new Promise((res) => {
        el.addEventListener('load', res, { once: true })
        el.addEventListener('error', res, { once: true })
      })

export function createSpecimen({ frame, layers, canvas, preview, cols = 84, clip = {}, posX = 0.5, posY = 0.5, clearRevealed = false }) {
  const ctx = canvas.getContext('2d')
  const state = { decode: 0, reveal: 0, crumble: 0 }
  let ready = false
  let photoReady = false
  let destroyed = false
  let source = null
  let atlas, W, H, dpr, cellW, cellH, rows
  let charIdx, toneIdx, thr, rnd, colFall
  let lastClip = ''

  function applyClip() {
    // Hold the photo back until it has pixels to show.
    const v = stepClip(photoReady ? state.reveal : 0, clip)
    if (v !== lastClip) {
      for (const l of layers) {
        l.style.clipPath = v
        l.style.webkitClipPath = v
      }
      lastClip = v
    }
    const photoCovers = photoReady && state.reveal >= 1 && state.crumble <= 0
    canvas.style.visibility = state.decode > 0 && !photoCovers ? 'visible' : 'hidden'
  }

  function prepare() {
    W = frame.clientWidth
    H = frame.clientHeight
    if (!W || !H || !source) return false
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)

    cellW = W / cols
    rows = Math.max(1, Math.floor(H / (cellW * 1.8)))
    cellH = H / rows
    atlas = createAtlas({ chars: RAMP, colors: TONES, cellW, cellH, fontPx: cellW / 0.6, dpr })

    // One sample per cell, matching object-fit: cover and object-position.
    const off = document.createElement('canvas')
    off.width = cols
    off.height = rows
    const g = off.getContext('2d', { willReadFrequently: true })
    const iw = source.naturalWidth
    const ih = source.naturalHeight
    const scale = Math.max(W / iw, H / ih)
    const sw = W / scale
    const sh = H / scale
    g.drawImage(source, (iw - sw) * posX, (ih - sh) * posY, sw, sh, 0, 0, cols, rows)
    const px = g.getImageData(0, 0, cols, rows).data

    const n = cols * rows
    const lum = new Float32Array(n)
    for (let i = 0; i < n; i++) lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255

    // Auto-contrast: these images are dark, so stretch between percentiles.
    const opaque = lum.filter((_, i) => px[i * 4 + 3] >= 110)
    const sorted = (opaque.length ? opaque : lum).sort()
    const lo = sorted[Math.floor(sorted.length * 0.04)]
    const hi = sorted[Math.floor(sorted.length * 0.985)]
    const range = Math.max(0.05, hi - lo)

    charIdx = new Uint8Array(n)
    toneIdx = new Uint8Array(n)
    thr = new Float32Array(n)
    rnd = new Float32Array(n)
    colFall = new Float32Array(cols)
    for (let x = 0; x < cols; x++) colFall[x] = 0.35 + Math.random() * 0.65

    const from = clip.from || 'top'
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x
        const l = Math.pow(Math.min(1, Math.max(0, (lum[i] - lo) / range)), 0.9)
        // Transparent pixels (a cut-out subject) stay empty.
        charIdx[i] = px[i * 4 + 3] < 110 ? 0 : Math.round(l * (RAMP.length - 1))
        const r = px[i * 4]
        const gg = px[i * 4 + 1]
        const b = px[i * 4 + 2]
        const warm = r > gg * 1.12 && gg > b * 1.05 && l > 0.42
        toneIdx[i] = warm ? AMBER : Math.min(5, Math.floor(l * 6))
        // Characters resolve in the same direction the clip travels.
        const along = from === 'top' ? y / rows : from === 'bottom' ? 1 - y / rows : from === 'left' ? x / cols : 1 - x / cols
        const across = clip.flip ? 1 - x / cols : x / cols
        thr[i] = 0.62 * Math.random() + 0.38 * (along * 0.7 + across * 0.3)
        rnd[i] = Math.random()
      }
    }
    return true
  }

  function render() {
    if (!ready || destroyed) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const { decode, crumble } = state
    if (decode <= 0 || canvas.style.visibility === 'hidden') return

    const { canvas: src, cw, ch } = atlas
    const D = decode * 1.3
    const scrambling = decode < 1
    const c2 = crumble * crumble
    const fallPx = H * 0.55 * dpr

    // Entrance only (no crumble): characters vanish as soon as the photograph
    // block above them is revealed, so none linger around the subject.
    const vals = clearRevealed && crumble <= 0 && photoReady && state.reveal > 0 ? stepBars(state.reveal, clip) : null
    const bars = clip.bars ?? 14
    const from = clip.from || 'top'
    const covered = (x, y) => {
      const vertical = from === 'top' || from === 'bottom'
      const bi = Math.min(bars - 1, Math.floor(((vertical ? x + 0.5 : y + 0.5) / (vertical ? cols : rows)) * bars))
      const along =
        from === 'bottom' ? (rows - y - 0.5) / rows : from === 'top' ? (y + 0.5) / rows : from === 'left' ? (x + 0.5) / cols : (cols - x - 0.5) / cols
      return along * 100 <= vals[bi]
    }

    for (let y = 0; y < rows; y++) {
      const baseY = y * cellH * dpr
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x
        let c = charIdx[i]
        if (!c) continue
        const t0 = thr[i]
        if (t0 > D) continue
        if (vals && covered(x, y)) continue
        let t = toneIdx[i]
        if (scrambling && D - t0 < 0.22) {
          c = 1 + ((Math.random() * (RAMP.length - 1)) | 0)
          t = 1
        }
        let py = baseY
        if (crumble > 0) {
          if (rnd[i] < c2 * 1.15) continue
          py += c2 * colFall[x] * fallPx * (0.6 + (y / rows) * 0.4)
        }
        ctx.drawImage(src, c * cw, t * ch, cw, ch, Math.round(x * cellW * dpr), Math.round(py), cw, ch)
      }
    }
  }

  function set(partial) {
    Object.assign(state, partial)
    applyClip()
    render()
  }

  let resizeTimer
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      if (!destroyed && prepare()) {
        ready = true
        render()
      }
    }, 150)
  })

  // The preview is inline, so this resolves almost immediately.
  const whenReady = Promise.all([loadImage(preview), fontsReady()]).then(([p]) => {
    if (destroyed || !p) return
    source = p
    ready = prepare()
    ro.observe(frame)
    applyClip()
    render()
  })

  Promise.all(layers.map((l) => whenLoaded(l.tagName === 'IMG' ? l : l.querySelector('img')))).then(() => {
    if (destroyed) return
    photoReady = true
    applyClip()
    render()
  })

  applyClip()

  return {
    set,
    state,
    ready: whenReady,
    destroy() {
      destroyed = true
      clearTimeout(resizeTimer)
      ro.disconnect()
      for (const l of layers) {
        l.style.clipPath = ''
        l.style.webkitClipPath = ''
      }
      canvas.style.visibility = ''
    },
  }
}
