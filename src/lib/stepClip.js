// Builds a stepped "pixel block" clip-path polygon.
//
// The revealed area is a histogram: `bars` strips that each grow from one edge
// in whole `steps`. Strips start in sequence (skew) with a little jitter, so the
// leading edge is a jagged staircase that travels diagonally, like a sprite
// loading block by block. It stays a single polygon, so the browser clips it
// on the compositor with no extra DOM.

function hash1(i, seed) {
  let h = Math.imul(i + 1, 2654435761) ^ Math.imul(seed + 7, 1597334677)
  h = Math.imul(h ^ (h >>> 15), 2246822519)
  return ((h ^ (h >>> 13)) >>> 0) / 4294967295
}

const f = (n) => `${n.toFixed(2)}%`

export function stepClip(p, { bars = 14, steps = 18, from = 'top', skew = 0.55, flip = false, seed = 3, jitter = 0.22 } = {}) {
  if (p <= 0) return 'polygon(0% 0%, 0% 0%, 0% 0%)'
  if (p >= 1) return 'none'

  const span = 1 + skew + jitter
  const vals = new Array(bars)
  for (let i = 0; i < bars; i++) {
    const k = flip ? bars - 1 - i : i
    const local = p * span - (k / Math.max(1, bars - 1)) * skew - hash1(i, seed) * jitter
    const q = Math.min(1, Math.max(0, local))
    vals[i] = (Math.ceil(q * steps) / steps) * 100
  }

  const pts = []
  const edge = (i) => (i / bars) * 100
  if (from === 'top' || from === 'bottom') {
    const y = (v) => (from === 'top' ? v : 100 - v)
    const base = from === 'top' ? 0 : 100
    pts.push(`0% ${base}%`)
    for (let i = 0; i < bars; i++) pts.push(`${f(edge(i))} ${f(y(vals[i]))}`, `${f(edge(i + 1))} ${f(y(vals[i]))}`)
    pts.push(`100% ${base}%`)
  } else {
    const x = (v) => (from === 'left' ? v : 100 - v)
    const base = from === 'left' ? 0 : 100
    pts.push(`${base}% 0%`)
    for (let i = 0; i < bars; i++) pts.push(`${f(x(vals[i]))} ${f(edge(i))}`, `${f(x(vals[i]))} ${f(edge(i + 1))}`)
    pts.push(`${base}% 100%`)
  }
  return `polygon(${pts.join(', ')})`
}
