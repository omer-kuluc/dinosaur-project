import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { PixelRex } from './sprites'

// Maps scroll depth to geological time. Sections carry `data-mya` markers and
// the readout interpolates between them, so the number only moves where the
// story moves through time.
const eraOf = (m) =>
  m < 0.5 ? 'Today' : m < 2.58 ? 'Quaternary' : m < 23 ? 'Neogene' : m < 66 ? 'Paleogene' : m < 100.5 ? 'Late Cretaceous' : m < 145 ? 'Early Cretaceous' : 'Late Jurassic'

export default function DepthMeter() {
  const ref = useRef(null)

  useGSAP(() => {
    const el = ref.current
    const num = el.querySelector('.meter__num')
    const era = el.querySelector('.meter__era')
    const rex = el.querySelector('.rex')
    let stops = []
    let shown = -1
    let shownEra = ''

    const build = () => {
      stops = [...document.querySelectorAll('[data-mya]')]
        .map((n) => ({ y: n.getBoundingClientRect().top + window.scrollY, v: Number(n.dataset.mya) }))
        .sort((a, b) => a.y - b.y)
    }

    const update = () => {
      const probe = window.scrollY + window.innerHeight * 0.5
      let v = 0
      if (stops.length) {
        v = stops[stops.length - 1].v
        if (probe <= stops[0].y) v = stops[0].v
        else {
          for (let i = 0; i < stops.length - 1; i++) {
            const a = stops[i]
            const b = stops[i + 1]
            if (probe < b.y) {
              v = a.v + (b.v - a.v) * ((probe - a.y) / Math.max(1, b.y - a.y))
              break
            }
          }
        }
      }
      const r = Math.round(v)
      if (r !== shown) {
        num.textContent = String(r).padStart(3, '0')
        shown = r
      }
      const e = eraOf(v)
      if (e !== shownEra) {
        era.textContent = e
        shownEra = e
      }
      const max = ScrollTrigger.maxScroll(window) || 1
      el.style.setProperty('--p', Math.min(1, window.scrollY / max).toFixed(4))
    }

    const onRefresh = () => {
      build()
      update()
    }
    ScrollTrigger.addEventListener('refresh', onRefresh)
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update })
    onRefresh()

    if (prefersReducedMotion()) return () => ScrollTrigger.removeEventListener('refresh', onRefresh)

    // The runner: legs cycle while scrolling, it faces the scroll direction,
    // and blinks now and then when left standing.
    let lastY = window.scrollY
    let acc = 0
    let still = 0
    let frame = 0
    const tick = (time, dt) => {
      const dy = window.scrollY - lastY
      lastY = window.scrollY
      if (Math.abs(dy) > 0.4) {
        still = 0
        acc += dt
        if (acc > 95) {
          acc = 0
          frame ^= 1
          rex.dataset.pose = frame ? 'run1' : 'run2'
        }
        rex.dataset.dir = dy < 0 ? 'back' : 'fwd'
      } else if ((still += dt) > 120) {
        if (rex.dataset.pose !== 'stand') rex.dataset.pose = 'stand'
        rex.classList.toggle('is-blink', time % 3.6 < 0.14)
      }
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      ScrollTrigger.removeEventListener('refresh', onRefresh)
    }
  })

  return (
    <aside ref={ref} className="meter" aria-hidden="true">
      <div className="meter__track">
        <PixelRex className="meter__rex" />
      </div>
      <p className="meter__readout">
        <span className="meter__num">000</span>
        <span className="meter__unit">million years ago</span>
        <span className="meter__era">Today</span>
      </p>
    </aside>
  )
}
