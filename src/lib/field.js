import { createAtlas, hash2, vnoise, fontsReady } from './ascii'
import { gsap, BREAKPOINT } from './gsap'

// The ambient ASCII ground behind the whole page.
//
// World space scrolls at a fraction of the page (parallax), so scrolling down
// reads as descending through rock. Near the surface there is only sky; below
// it, strata separated by Chrome-dino style ground lines. Scroll *speed* moves
// the strata sideways like the game's ground while the runner is running;
// when scrolling stops, the field settles and only a faint shimmer remains.

const PARALLAX = 0.32
const BAND = 16
const DRIFT_PER_PX = 0.018

const CHARS = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i)).join('')
const COLORS = [
  'rgba(44, 96, 42, 0.62)',
  'rgba(56, 112, 54, 0.9)',
  'rgba(92, 142, 94, 0.85)',
  'rgba(255, 255, 255, 0.17)',
  'rgba(255, 255, 255, 0.38)',
]
const RAMPS = [".,:'`", '.:-=+~', ':=+*#%']

const CLOUD = ['   .-~~-.', ' .(      ).', '(__________)']
const FOSSILS = [
  [' .-.       .-.', '(   )=====(   )', " '-'       '-'"],
  ['[]-[]-[]-[]-[]-[]'],
  ['  .--.', ' /.-. \\', '| (@) |', ' \\ `-\' /', "  `--'"],
  ['   __', '  / /', ' / /__', '/_____)'],
]

const code = (ch) => ch.charCodeAt(0) - 33

export function createField(canvas) {
  const ctx = canvas.getContext('2d')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  let W, H, dpr, cellW, cellH, cols, rows, atlas, xs
  let surfaceRows = 0
  let strataRows = 1
  let brush = null
  let brushEnergy = 0
  let drift = 0
  let lastY = window.scrollY
  let lastDraw = 0
  let raf = 0
  let destroyed = false
  let ready = false
  let pointer = null

  function measure() {
    W = canvas.clientWidth
    H = canvas.clientHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mobile = W < BREAKPOINT
    // Mobile renders roughly a third of the desktop cell count.
    cellW = mobile ? 17 : 13
    cellH = mobile ? 25 : 19
    cols = Math.ceil(W / cellW) + 1
    rows = Math.ceil(H / cellH) + 1
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    atlas = createAtlas({ chars: CHARS, colors: COLORS, cellW, cellH, fontPx: mobile ? 12 : 11, dpr })
    xs = new Int32Array(cols)
    for (let x = 0; x < cols; x++) xs[x] = Math.round(x * cellW * dpr)
    surfaceRows = Math.ceil((window.innerHeight * 0.92) / cellH)
    const doc = document.documentElement.scrollHeight
    strataRows = Math.max(1, Math.ceil((doc * PARALLAX + H) / cellH) - surfaceRows)
    brush = finePointer && !mobile && !reduced ? new Float32Array(cols * rows) : null
  }

  function blit(ch, tone, x, py) {
    const c = code(ch)
    if (c < 0 || c >= 94) return
    ctx.drawImage(atlas.canvas, c * atlas.cw, tone * atlas.ch, atlas.cw, atlas.ch, xs[x] ?? Math.round(x * cellW * dpr), py, atlas.cw, atlas.ch)
  }

  function sprite(lines, col, worldRow, base, off, tone) {
    for (let r = 0; r < lines.length; r++) {
      const y = worldRow + r - base
      if (y < 0 || y > rows) continue
      const py = Math.round((y * cellH - off) * dpr)
      const line = lines[r]
      for (let k = 0; k < line.length; k++) {
        const ch = line[k]
        const x = col + k
        if (ch === ' ' || x < 0 || x >= cols) continue
        const b = brush ? brush[y * cols + x] || 0 : 0
        blit(ch, b > 0.1 ? 4 : tone, x, py)
      }
    }
  }

  function draw(now) {
    const par = reduced ? 0 : window.scrollY * PARALLAX
    const rowF = par / cellH
    const base = Math.floor(rowF)
    const off = (rowF - base) * cellH
    const tt = now * 0.001
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y <= rows; y++) {
      const wr = base + y
      const py = Math.round((y * cellH - off) * dpr)
      const brow = y * cols

      if (wr < surfaceRows) {
        // Night sky: sparse points that breathe slowly.
        for (let x = 0; x < cols; x++) {
          const h = hash2(x, wr)
          if (h < 0.986) continue
          const tw = reduced ? 1 : 0.5 + 0.5 * Math.sin(tt * 1.2 + h * 900)
          blit(h > 0.996 ? '+' : '.', tw > 0.6 ? 3 : 0, x, py)
        }
        continue
      }

      const sr = wr - surfaceRows
      const bi = Math.floor(sr / BAND)
      const inBand = sr - bi * BAND
      const bh = hash2(bi, 91)
      const speed = 0.45 + bh * 1.3
      const depth = Math.min(1, sr / strataRows)

      if (inBand === 0) {
        // Stratum boundary drawn like the Chrome dino's ground line.
        const shift = Math.floor(drift * speed)
        for (let x = 0; x < cols; x++) {
          const h = hash2(x + shift, bi * 7 + 3)
          const ch = h > 0.95 ? ' ' : h > 0.87 ? '.' : h > 0.82 ? '-' : '_'
          if (ch === ' ') continue
          const b = brush ? brush[brow + x] : 0
          blit(ch, b > 0.1 ? 3 : 1, x, py)
        }
        continue
      }

      const ramp = RAMPS[depth < 0.34 ? 0 : depth < 0.67 ? 1 : 2]
      const th = 0.64 - depth * 0.2 - (bh - 0.5) * 0.06
      const shift = drift * speed * 0.35
      const ishift = Math.floor(shift)
      for (let x = 0; x < cols; x++) {
        let n = vnoise((x + shift) * 0.12, wr * 0.26) * 0.72 + hash2(x + ishift, wr) * 0.28
        if (!reduced) n += Math.sin(tt * 0.9 + hash2(x, wr) * 50) * 0.035
        const b = brush ? brush[brow + x] : 0
        if (b > 0.01) n -= b * 0.6
        if (n < th) {
          // The brush leaves a lighter rim of disturbed grains.
          if (b > 0.12 && b < 0.45) blit('.', 3, x, py)
          continue
        }
        const k = (n - th) / (1 - th)
        const ch = ramp[Math.min(ramp.length - 1, (k * ramp.length * 1.25) | 0)]
        const tone = b > 0.08 ? 3 : k > 0.55 ? 2 : k > 0.25 ? 1 : 0
        blit(ch, tone, x, py)
      }
    }

    // Clouds drift slowly with the run.
    if (base < surfaceRows) {
      for (let i = 0; i < 3; i++) {
        const row = 4 + i * 5
        const span = cols + 16
        const col = Math.floor((((hash2(i, 3) * span - drift * (0.08 + i * 0.05)) % span) + span) % span) - 12
        sprite(CLOUD, col, row, base, off, 3)
      }
    }

    // Fossils embedded in the strata.
    const b0 = Math.max(0, Math.floor((base - surfaceRows) / BAND))
    const b1 = Math.floor((base + rows - surfaceRows) / BAND)
    for (let bi = b0; bi <= b1; bi++) {
      if (hash2(bi, 5) < 0.4) continue
      const fossil = FOSSILS[Math.floor(hash2(bi, 11) * FOSSILS.length)]
      const speed = 0.45 + hash2(bi, 91) * 1.3
      const row = surfaceRows + bi * BAND + 3 + Math.floor(hash2(bi, 13) * (BAND - 8))
      const span = cols + 20
      const col = Math.floor((((hash2(bi, 19) * span - drift * speed * 0.35) % span) + span) % span) - 10
      sprite(fossil, col, row, base, off, 3)
    }
  }

  function stampBrush() {
    if (!brush || !pointer) return
    const cx = pointer.x / cellW
    const cy = pointer.y / cellH
    const R = 6
    for (let y = Math.max(0, Math.floor(cy - R)); y <= Math.min(rows - 1, Math.ceil(cy + R)); y++) {
      for (let x = Math.max(0, Math.floor(cx - R * 1.4)); x <= Math.min(cols - 1, Math.ceil(cx + R * 1.4)); x++) {
        const dx = (x - cx) / 1.4
        const dy = y - cy
        const d = Math.sqrt(dx * dx + dy * dy) / R
        if (d >= 1) continue
        const i = y * cols + x
        brush[i] = Math.min(1, brush[i] + (1 - d) * 0.22)
      }
    }
    brushEnergy = 1
    pointer = null
  }

  function decayBrush() {
    if (!brush || brushEnergy <= 0) return
    let sum = 0
    for (let i = 0; i < brush.length; i++) {
      if (brush[i] > 0.002) {
        brush[i] *= 0.95
        sum += brush[i]
      } else brush[i] = 0
    }
    brushEnergy = sum > 0.5 ? 1 : 0
  }

  function loop(now) {
    raf = requestAnimationFrame(loop)
    const y = window.scrollY
    const dy = y - lastY
    lastY = y
    drift += Math.abs(dy) * DRIFT_PER_PX
    stampBrush()
    const active = Math.abs(dy) > 0.2 || brushEnergy > 0
    // 40fps while moving, 12fps idle shimmer.
    if (now - lastDraw < (active ? 25 : 83)) return
    lastDraw = now
    decayBrush()
    draw(now)
  }

  function start() {
    if (destroyed || raf || reduced || document.hidden) return
    lastY = window.scrollY
    raf = requestAnimationFrame(loop)
  }
  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
  }

  const onVisibility = () => (document.hidden ? stop() : start())
  const onPointer = (e) => {
    pointer = { x: e.clientX, y: e.clientY }
  }
  let resizeTimer
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      if (!ready) return
      measure()
      draw(performance.now())
    }, 150)
  }
  const ro = new ResizeObserver(onResize)

  fontsReady().then(() => {
    if (destroyed) return
    measure()
    ready = true
    draw(performance.now())
    ro.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)
    if (brush) window.addEventListener('pointermove', onPointer, { passive: true })
    start()
  })

  return {
    // Page height changes (pins, fonts) alter how deep the strata go.
    refresh: onResize,
    setDim(value) {
      gsap.to(canvas, { opacity: value, duration: 1.4, ease: 'power2.out', overwrite: true })
    },
    destroy() {
      destroyed = true
      stop()
      ro.disconnect()
      clearTimeout(resizeTimer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
    },
  }
}

// Exhibits ask for the spotlight; the field dims while any exhibit is lit.
let fieldApi = null
let lit = 0
export const registerField = (api) => {
  fieldApi = api
}
export function spotlight(on) {
  lit = Math.max(0, lit + (on ? 1 : -1))
  fieldApi?.setDim(lit > 0 ? 0.32 : 1)
}
