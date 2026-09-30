import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { eraOf } from '../data/content'
import { PixelRex } from './sprites'

// Maps scroll depth to geological time. Sections carry `data-mya` markers and
// the readout interpolates between them.
//
// The runner's position and its facing are kept on separate elements: the
// wrapper is translated by scroll progress, the sprite inside only flips. A
// flip applied on the same element as the translate would mirror its position
// too, which is what made it drift below 1024px.
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

    const track = el.querySelector('.meter__track')
    const runner = el.querySelector('.meter__runner')
    const build = () => {
      // Travel distance measured from the real track, so scrollbars or safe
      // areas can never push the runner past its end.
      const vertical = track.clientHeight > track.clientWidth
      const run = vertical ? track.clientHeight - runner.offsetHeight : track.clientWidth - runner.offsetWidth
      el.style.setProperty('--run', `${Math.max(0, run)}px`)
      stops = [...document.querySelectorAll('[data-mya]')]
        .map((n) => ({ y: n.getBoundingClientRect().top + window.scrollY, v: Number(n.dataset.mya) }))
        .sort((a, b) => a.y - b.y)
    }

    const readout = () => {
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
    }

    // Progress is ScrollTrigger's own 0..1 for the whole document, so the
    // runner is a pure function of scroll position in both directions.
    const setP = (p) => el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4))
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        setP(self.progress)
        readout()
      },
      onRefresh: (self) => {
        build()
        setP(self.progress)
        readout()
      },
    })
    build()
    setP(st.progress)
    readout()

    if (prefersReducedMotion()) return

    // Legs cycle while scrolling, the sprite faces the direction of travel,
    // and it blinks now and then when left standing.
    let acc = 0
    let still = 0
    let frame = 0
    let dir = 'fwd'
    const tick = (time, dt) => {
      const v = st.getVelocity()
      if (Math.abs(v) > 20) {
        still = 0
        acc += dt
        if (acc > 95) {
          acc = 0
          frame ^= 1
          rex.dataset.pose = frame ? 'run1' : 'run2'
        }
        const d = v < 0 ? 'back' : 'fwd'
        if (d !== dir) rex.dataset.dir = dir = d
      } else if ((still += dt) > 140) {
        if (rex.dataset.pose !== 'stand') rex.dataset.pose = 'stand'
        rex.classList.toggle('is-blink', time % 3.6 < 0.14)
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  })

  return (
    <aside ref={ref} className="meter" aria-hidden="true">
      <div className="meter__track">
        <div className="meter__runner">
          <PixelRex className="meter__rex" />
        </div>
      </div>
      <p className="meter__readout">
        <span className="meter__num">000</span>
        <span className="meter__unit">mya</span>
        <span className="meter__era">Today</span>
      </p>
    </aside>
  )
}
