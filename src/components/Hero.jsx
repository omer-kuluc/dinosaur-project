import { useRef } from 'react'
import { gsap, SplitText, useGSAP, MQ } from '../lib/gsap'
import { createSpecimen } from '../lib/specimen'
import { introDone } from '../lib/intro'
import { HERO, img } from '../data/content'
import Picture from './Picture'

// Full bleed, in real depth: a synthesised clean sky plate and the separated
// dinosaur are two planes that move independently, so pointer and scroll
// parallax never reveal a ghost. The ASCII decode is the entrance; on scroll the
// specimen breaks back into characters and sinks while the headline drops
// below its own baseline.
export default function Hero() {
  const root = useRef(null)
  const plate = img(HERO.image, 'hero-plate')
  const dino = img(HERO.image, 'hero-dino')
  const full = img(HERO.image)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [media] = q('.hero__media')
      const layers = q('.hero__layer')
      const [canvas] = q('.specimen-ascii')
      const [title] = q('.hero__title')
      const lines = q('.hero__title .line')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        const spec = createSpecimen({
          frame: media,
          layers,
          canvas,
          preview: full.preview,
          cols: desktop ? 112 : 54,
          posX: desktop ? 0.5 : 0.4,
          posY: desktop ? 0.3 : 0.5,
          clip: { from: 'bottom', bars: desktop ? 20 : 12, steps: 22, skew: 0.5, seed: 11 },
        })

        // Entrance and scroll share one state so they never fight.
        const s = { decode: 0, rise: 0, sink: 0 }
        const apply = () => spec.set({ decode: s.decode, reveal: Math.min(s.rise, 1 - s.sink), crumble: s.sink })
        apply()

        const split = SplitText.create(lines, { type: 'chars' })
        gsap.set(split.chars, { yPercent: 115 })
        gsap.set(q('.hero__sub'), { autoAlpha: 0 })

        const intro = gsap
          .timeline({ paused: true })
          .to(s, { decode: 1, duration: 1.1, ease: 'power2.out', onUpdate: apply }, 0)
          .to(s, { rise: 1, duration: 1.5, ease: 'power2.inOut', onUpdate: apply }, 0.5)
          .to(split.chars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.026 }, 0.75)
          .fromTo(title, { letterSpacing: '0.06em' }, { letterSpacing: '-0.02em', duration: 2.1, ease: 'expo.out' }, 0.75)
          .fromTo(q('.hero__sub'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 1.55)
        introDone.then(() => intro.play())

        // Pointer depth: the head moves more than the sky behind it.
        let offPointer = () => {}
        if (desktop && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          const to = (el, prop) => gsap.quickTo(el, prop, { duration: 1.4, ease: 'power3.out' })
          const [plateX, plateY, dinoX, dinoY] = [to(layers[0], 'x'), to(layers[0], 'y'), to(layers[1], 'x'), to(layers[1], 'y')]
          const onMove = (e) => {
            const nx = e.clientX / window.innerWidth - 0.5
            const ny = e.clientY / window.innerHeight - 0.5
            plateX(nx * -8)
            plateY(ny * -5)
            dinoX(nx * -24)
            dinoY(ny * -12)
          }
          window.addEventListener('pointermove', onMove, { passive: true })
          offPointer = () => window.removeEventListener('pointermove', onMove)
        }

        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: desktop ? '+=80%' : 'bottom top',
              pin: desktop,
              scrub: desktop ? 0.6 : 0.4,
              anticipatePin: 1,
            },
          })
          // Planes separate first, then the specimen sinks.
          .to(layers[0], { yPercent: 4, duration: 0.35, ease: 'none' }, 0)
          .to(layers[1], { yPercent: -3, scale: 1.05, duration: 0.35, ease: 'none' }, 0)
          .to(s, { sink: 1, duration: 0.8, ease: 'none', onUpdate: apply }, 0.2)
          .to(q('.hero__sink'), { yPercent: 28, duration: 0.8, ease: 'power1.in' }, 0.2)
          .to(lines, { yPercent: 118, duration: 0.45, ease: 'power2.in', stagger: 0.1 }, 0.24)
          .to(q('.hero__sub-wrap'), { autoAlpha: 0, y: 24, duration: 0.25, ease: 'power1.in' }, 0.12)
          .to(q('.hero__scrim'), { opacity: 0, duration: 0.4, ease: 'none' }, 0.6)

        return () => {
          offPointer()
          spec.destroy()
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="hero" data-mya="0" data-bg="#0b1619" aria-labelledby="hero-title">
      <div className="hero__media">
        <div className="hero__sink">
          <canvas className="specimen-ascii" aria-hidden="true" />
          <Picture data={plate} className="hero__layer hero__plate" sizes="100vw" eager />
          <Picture data={dino} className="hero__layer hero__dino" sizes="100vw" alt={HERO.alt} eager />
        </div>
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__copy grid">
        <h1 className="hero__title" id="hero-title" aria-label="T-Rex: Engineered by Evolution">
          <span className="line-mask" aria-hidden="true">
            <span className="line">
              {HERO.title[0]} <span className="hero__br" />
              {HERO.title[1]}
            </span>
          </span>
          <span className="line-mask" aria-hidden="true">
            <span className="line">{HERO.title[2]}</span>
          </span>
        </h1>
        <div className="hero__sub-wrap">
          <p className="hero__sub">{HERO.sub}</p>
        </div>
      </div>
    </section>
  )
}
