import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion, BREAKPOINT } from '../lib/gsap'
import { finishIntro } from '../lib/intro'
import { lockScroll } from '../lib/scroll'
import { stepClip } from '../lib/stepClip'
import { hash2 } from '../lib/ascii'
import { eraOf } from '../data/content'
import { PixelRex, Cactus } from './sprites'

// Entering the timeline. Borrowed from the offline dino game: a runner on a
// ground line while the world scrolls past. Reworked for the archive: night
// greens instead of white, the clock counts geological time down to today,
// and a single amber streak marks the impact 66 million years ago. On exit the
// scene breaks away in pixel blocks and the runner lands on the depth gauge.

const GROUND = Array.from({ length: 240 }, (_, i) => {
  const h = hash2(i, 7)
  return h > 0.95 ? ' ' : h > 0.88 ? '.' : h > 0.84 ? '-' : '_'
}).join('')

// Cacti spaced irregularly along one loop of the strip.
const CACTI = [
  { at: 8, kind: 'tall' },
  { at: 11, kind: 'short' },
  { at: 34, kind: 'short' },
  { at: 57, kind: 'tall' },
  { at: 78, kind: 'tall' },
  { at: 80.5, kind: 'short' },
]

const SEEN = 'night-archive:intro'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const loaded = (img) =>
  img.complete && img.naturalWidth ? Promise.resolve() : new Promise((r) => {
    img.addEventListener('load', r, { once: true })
    img.addEventListener('error', r, { once: true })
  })

export default function Loader() {
  const root = useRef(null)

  useGSAP(
    () => {
      const el = root.current
      const q = gsap.utils.selector(el)
      const html = document.documentElement
      const hide = () => {
        el.style.display = 'none'
        html.classList.remove('is-intro')
      }

      let seen = false
      try {
        seen = sessionStorage.getItem(SEEN) === '1'
      } catch {
        /* storage blocked: play the intro */
      }

      // Returning visitors and reduced motion skip straight to the hero.
      if (seen || prefersReducedMotion()) {
        finishIntro()
        gsap.to(el, { autoAlpha: 0, duration: prefersReducedMotion() ? 0.01 : 0.5, delay: 0.1, onComplete: hide })
        return
      }

      html.classList.add('is-intro')
      lockScroll(true)

      const [num] = q('.loader__num')
      const [era] = q('.loader__era')
      const [panel] = q('.loader__panel')
      const [runner] = q('.loader__runner')
      const [rex] = q('.loader__runner .rex')
      const [strip] = q('.loader__strip')
      const [meteor] = q('.loader__meteor')

      const t = { mya: 150, speed: 0 }
      let shown = 150
      const render = () => {
        const v = Math.round(t.mya)
        if (v === shown) return
        shown = v
        num.textContent = String(v).padStart(3, '0')
        era.textContent = eraOf(t.mya)
      }

      // The world scrolls under a stationary runner, faster as time speeds up.
      let x = 0
      let legT = 0
      let leg = 0
      const tick = (_, dt) => {
        const loop = strip.scrollWidth / 2
        x -= t.speed * dt * 0.55
        if (loop && x <= -loop) x += loop
        strip.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`
        if (t.speed > 0.05) {
          legT += dt
          if (legT > 90 / Math.max(0.7, t.speed)) {
            legT = 0
            leg ^= 1
            rex.dataset.pose = leg ? 'run1' : 'run2'
          }
        } else if (rex.dataset.pose !== 'stand') rex.dataset.pose = 'stand'
      }
      gsap.ticker.add(tick)

      const heroImgs = [...document.querySelectorAll('.hero img')]
      const ready = Promise.race([Promise.all([document.fonts.ready, ...heroImgs.map(loaded)]), wait(6000)])

      const exit = () => {
        try {
          sessionStorage.setItem(SEEN, '1')
        } catch {
          /* ignore */
        }
        finishIntro()
        const desktop = window.innerWidth >= BREAKPOINT
        const target = document.querySelector('.meter__rex')?.getBoundingClientRect()
        const from = runner.getBoundingClientRect()
        const s = { p: 1 }
        gsap
          .timeline({
            onComplete: () => {
              gsap.ticker.remove(tick)
              lockScroll(false)
              hide()
            },
          })
          .to(runner, { y: -34, duration: 0.28, ease: 'power2.out' }, 0)
          .to(runner, { y: 0, duration: 0.26, ease: 'power2.in' }, 0.28)
          .to(num, { yPercent: -105, duration: 0.7, ease: 'expo.in' }, 0.1)
          .to(q('.loader__label, .loader__skip'), { autoAlpha: 0, duration: 0.3 }, 0.1)
          .to(s, {
            p: 0,
            duration: 1.15,
            ease: 'power2.inOut',
            onUpdate: () => {
              panel.style.clipPath = stepClip(s.p, { from: 'top', bars: desktop ? 18 : 10, steps: 16, skew: 0.45, seed: 3 })
            },
          }, 0.45)
          .to(
            runner,
            target && target.width
              ? {
                  x: target.left + target.width / 2 - (from.left + from.width / 2),
                  y: target.top + target.height / 2 - (from.top + from.height / 2),
                  scaleX: (target.width / from.width) * (desktop ? -1 : 1),
                  scaleY: target.height / from.height,
                  duration: 1.05,
                  ease: 'power3.inOut',
                }
              : { autoAlpha: 0, duration: 0.4 },
            0.55,
          )
          .to(runner, { autoAlpha: 0, duration: 0.2 }, 1.5)
      }

      const tl = gsap
        .timeline({ onComplete: () => ready.then(exit) })
        .from(num, { yPercent: 105, duration: 1, ease: 'expo.out' }, 0.1)
        .from(q('.loader__label'), { autoAlpha: 0, y: 10, duration: 0.8, ease: 'expo.out' }, 0.35)
        .fromTo(q('.loader__ground'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'steps(14)' }, 0.2)
        .from(runner, { autoAlpha: 0, y: 8, duration: 0.4, ease: 'power2.out' }, 0.55)
        // Deep time passes quickly, then slows as it nears the present.
        .to(t, { speed: 2.2, duration: 1.4, ease: 'power1.in' }, 0.7)
        .to(t, { mya: 66, duration: 1.4, ease: 'power1.in', onUpdate: render }, 0.7)
        .addLabel('impact', 2.15)
        .to(t, { speed: 0.5, duration: 0.3, ease: 'power2.out' }, 'impact')
        .fromTo(
          meteor,
          // Streak from the upper right down toward the horizon, head first.
          { autoAlpha: 1, x: 0, y: 0, scaleX: 0.15, rotation: () => (-Math.atan2(window.innerHeight * 0.5, window.innerWidth * 0.42) * 180) / Math.PI },
          { x: () => -window.innerWidth * 0.42, y: () => window.innerHeight * 0.5, scaleX: 1, duration: 0.5, ease: 'power2.in' },
          'impact',
        )
        .to(meteor, { autoAlpha: 0, duration: 0.15 }, 'impact+=0.48')
        .fromTo(q('.loader__flash'), { opacity: 0 }, { opacity: 1, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out' }, 'impact+=0.46')
        .to(t, { speed: 1.4, duration: 0.5, ease: 'power1.in' }, 'impact+=0.65')
        .to(t, { mya: 0, duration: 1.05, ease: 'power3.out', onUpdate: render }, 'impact+=0.65')
        .to(t, { speed: 0, duration: 0.6, ease: 'power2.out' }, 'impact+=1.25')
        .to({}, { duration: 0.15 })

      // Any input fast-forwards rather than cutting, so the handover still plays.
      const skip = () => tl.timeScale(6)
      el.addEventListener('pointerdown', skip)
      window.addEventListener('keydown', skip)
      window.addEventListener('wheel', skip, { passive: true })
      window.addEventListener('touchmove', skip, { passive: true })

      return () => {
        gsap.ticker.remove(tick)
        el.removeEventListener('pointerdown', skip)
        window.removeEventListener('keydown', skip)
        window.removeEventListener('wheel', skip)
        window.removeEventListener('touchmove', skip)
        lockScroll(false)
      }
    },
    { scope: root },
  )

  const strip = (copy) => (
    <div className="loader__loop" key={copy}>
      <span className="loader__line">{GROUND}</span>
      {CACTI.map((c, i) => (
        <Cactus key={i} kind={c.kind} className="loader__cactus" style={{ left: `${c.at}%` }} />
      ))}
    </div>
  )

  return (
    <div ref={root} className="loader" role="status" aria-label="Loading the archive">
      <div className="loader__panel">
        <div className="loader__sky" aria-hidden="true" />
        <div className="loader__count grid" aria-hidden="true">
          <p className="loader__num-mask">
            <span className="loader__num">150</span>
          </p>
          <p className="loader__label">
            <span className="loader__unit">Million years ago</span>
            <span className="loader__era">Late Jurassic</span>
          </p>
        </div>
        <div className="loader__ground" aria-hidden="true">
          <div className="loader__strip">{[0, 1].map(strip)}</div>
          <span className="loader__flash" />
        </div>
        <span className="loader__meteor" aria-hidden="true" />
        <button type="button" className="loader__skip">
          Skip intro
        </button>
      </div>
      <div className="loader__runner" aria-hidden="true">
        <PixelRex />
      </div>
    </div>
  )
}
