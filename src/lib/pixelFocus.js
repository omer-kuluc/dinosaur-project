// Senses chapter: the image arrives out of focus as huge pixel blocks and
// sharpens as you read. Coarse stages draw from the inline preview, so they
// cost nothing to load; the full photo takes over for the fine stages.
//
//   set(p)  p 0..1  -> block size from `from` px down to 1 (then the real <img>)

export function createPixelFocus({ canvas, img, preview, from = 56, posX = 0.5, posY = 0.5 }) {
  const ctx = canvas.getContext('2d')
  const off = document.createElement('canvas')
  const octx = off.getContext('2d')
  let small = null
  let W = 0
  let H = 0
  let dpr = 1
  let p = 0
  let last = -1
  let destroyed = false

  const pre = new Image()
  pre.onload = () => {
    small = pre
    draw(true)
  }
  pre.src = preview

  const full = () => (img.complete && img.naturalWidth ? img : null)

  function size() {
    W = canvas.clientWidth
    H = canvas.clientHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.round(W * dpr))
    canvas.height = Math.max(1, Math.round(H * dpr))
    last = -1
  }

  function draw(force = false) {
    if (destroyed || !W) return
    // Quantise to whole steps so it reads as pixels snapping into focus.
    const block = Math.max(1, Math.round(from * Math.pow(1 - p, 1.6)))
    const done = block <= 1 && full()
    img.style.opacity = done ? '1' : '0'
    canvas.style.visibility = done ? 'hidden' : 'visible'
    if (done || (!force && block === last)) return
    last = block
    const src = block > 10 || !full() ? small : full()
    if (!src) return
    const cw = Math.max(1, Math.round((W * dpr) / (block * dpr)))
    const ch = Math.max(1, Math.round((H * dpr) / (block * dpr)))
    off.width = cw
    off.height = ch
    const iw = src.naturalWidth
    const ih = src.naturalHeight
    const scale = Math.max(W / iw, H / ih)
    const sw = W / scale
    const sh = H / scale
    octx.imageSmoothingEnabled = true
    octx.drawImage(src, (iw - sw) * posX, (ih - sh) * posY, sw, sh, 0, 0, cw, ch)
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(off, 0, 0, cw, ch, 0, 0, canvas.width, canvas.height)
  }

  const ro = new ResizeObserver(() => {
    size()
    draw(true)
  })
  ro.observe(canvas)
  img.addEventListener('load', () => draw(true))

  return {
    set(v) {
      p = v
      draw()
    },
    destroy() {
      destroyed = true
      ro.disconnect()
      img.style.opacity = ''
      canvas.style.visibility = ''
    },
  }
}
