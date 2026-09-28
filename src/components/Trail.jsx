import { useRef } from 'react'
import { ScrollTrigger, MotionPathPlugin, useGSAP, prefersReducedMotion, BREAKPOINT } from '../lib/gsap'
import { PRINT_D, PRINT_SIZE } from './sprites'

// A fossil trackway that leads from one exhibit to the next.
//
// Sections mark where the trail leaves ([data-trail="out"]) and where it
// arrives ([data-trail="in"], the dig site above each image). Each out/in pair
// becomes one S-curve through the empty gap between sections, so prints never
// sit under text. Prints alternate left and right of the path, rotated to its
// tangent, and appear as the reader's eye reaches them.

export default function Trail() {
  const ref = useRef(null)

  useGSAP(() => {
    const svg = ref.current
    const page = svg.parentElement
    const layer = svg.querySelector('.trail__prints')
    const reduce = prefersReducedMotion()
    let prints = []
    let lit = 0

    const build = () => {
      const mobile = window.innerWidth < BREAKPOINT
      const pageTop = page.getBoundingClientRect().top + window.scrollY
      const w = page.clientWidth
      const h = page.scrollHeight
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      svg.style.height = `${h}px`

      const point = (el) => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.top + window.scrollY - pageTop + r.height / 2 }
      }

      const anchors = [...page.querySelectorAll('[data-trail]')]
      const segments = []
      for (let i = 0; i < anchors.length - 1; i++) {
        if (anchors[i].dataset.trail !== 'out') continue
        const next = anchors.slice(i + 1).find((a) => a.dataset.trail === 'in')
        if (next) segments.push({ a: point(anchors[i]), b: point(next), small: next.dataset.trailSmall === 'true' })
      }

      const stride = mobile ? 34 : 46
      const spread = mobile ? 6 : 9
      const px = mobile ? 1.6 : 2
      let html = ''
      const ys = []
      segments.forEach(({ a, b, small }) => {
        const dy = b.y - a.y
        if (dy < 40) return
        const d = `M${a.x},${a.y} C${a.x},${a.y + dy * 0.55} ${b.x},${b.y - dy * 0.55} ${b.x},${b.y}`
        const raw = MotionPathPlugin.cacheRawPathMeasurements(MotionPathPlugin.getRawPath(d))
        const len = raw.totalLength
        const count = Math.floor(len / stride)
        for (let k = 1; k < count; k++) {
          const pos = MotionPathPlugin.getPositionOnPath(raw, k / count, true)
          const rad = (pos.angle * Math.PI) / 180
          const side = k % 2 ? 1 : -1
          const x = pos.x - Math.sin(rad) * spread * side
          const y = pos.y + Math.cos(rad) * spread * side
          // The last trackway shrinks toward bird-sized prints.
          const s = px * (small ? 1 - (k / count) * 0.45 : 1)
          const off = (-PRINT_SIZE * s) / 2
          html += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(pos.angle + 90).toFixed(1)}) scale(${side === 1 ? 1 : -1} 1)"><g transform="translate(${off} ${off}) scale(${s})"><path class="print" d="${PRINT_D}"/></g></g>`
          ys.push(y)
        }
      })
      layer.innerHTML = html
      prints = [...layer.querySelectorAll('.print')].map((el, i) => ({ el, y: ys[i], on: false }))
      lit = 0
      if (reduce) prints.forEach((p) => p.el.classList.add('is-on'))
    }

    const update = () => {
      if (reduce) return
      const head = window.scrollY - (page.getBoundingClientRect().top + window.scrollY) + window.innerHeight * 0.74
      // Prints are ordered top to bottom, so only the frontier needs checking.
      while (lit < prints.length && prints[lit].y < head) prints[lit++].el.classList.add('is-on')
      while (lit > 0 && prints[lit - 1].y >= head) prints[--lit].el.classList.remove('is-on')
    }

    const onRefresh = () => {
      build()
      update()
    }
    ScrollTrigger.addEventListener('refresh', onRefresh)
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update })

    return () => ScrollTrigger.removeEventListener('refresh', onRefresh)
  })

  return (
    <svg ref={ref} className="trail" aria-hidden="true" preserveAspectRatio="none" shapeRendering="crispEdges">
      <g className="trail__prints" />
    </svg>
  )
}
