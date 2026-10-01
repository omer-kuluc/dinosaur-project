import { useRef } from 'react'
import { gsap, SplitText, useGSAP, MQ } from '../lib/gsap'
import { createSpecimen } from '../lib/specimen'
import { introDone } from '../lib/intro'
import { HERO, img } from '../data/content'
import images from '../data/images.json'
import Picture from './Picture'

// Type and subject share one stage. A huge stacked headline sits on a flat
// ground; the cut-out dinosaur stands in front of it, so the snout and teeth
// cross the ends of the letters and the page reads in depth. The ASCII decode
// is the entrance; on scroll the specimen breaks back into characters and
// sinks while the headline drops below its own baseline.
export default function Hero() {
  const root = useRef(null)
  const dino = img(HERO.image, 'hero-dino')
  const preview = images[HERO.image].dinoPreview

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [media] = q('.hero__media')
      const [layer] = q('.hero__dino')
      const [canvas] = q('.specimen-ascii')
      const [title] = q('.hero__title')
      const lines = q('.hero__title .line')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        const spec = createSpecimen({
          frame: media,
          layers: [layer],
          canvas,
          preview,
          cols: desktop ? 104 : 60,
          clip: { from: 'bottom', bars: desktop ? 18 : 12, steps: 22, skew: 0.5, seed: 11 },
          clearRevealed: true,
        })

        // Entrance and scroll share one state so they never fight.
        const s = { decode: 0, rise: 0, sink: 0 }
        const apply = () => spec.set({ decode: s.decode, reveal: Math.min(s.rise, 1 - s.sink), crumble: s.sink })
        apply()

        const split = SplitText.create(lines, { type: 'chars' })
        gsap.set(split.chars, { yPercent: 115 })
        gsap.set(q('.hero__sub'), { autoAlpha: 0 })

        // Headline first: the letters rise while their tracking settles; the
        // specimen then decodes in front of them and resolves into the photo.
        const intro = gsap
          .timeline({ paused: true })
          .to(split.chars, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.022 }, 0.1)
          .fromTo(title, { letterSpacing: '0.05em' }, { letterSpacing: '-0.02em', duration: 2.2, ease: 'expo.out' }, 0.1)
          .to(s, { decode: 1, duration: 1.2, ease: 'power2.out', onUpdate: apply }, 0.55)
          .to(s, { rise: 1, duration: 1.5, ease: 'power2.inOut', onUpdate: apply }, 1.05)
          .fromTo(q('.hero__sub'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 1.4)
        introDone.then(() => intro.play())

        // Pointer depth: the subject drifts against the still headline.
        let offPointer = () => { }
        if (desktop && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          const dx = gsap.quickTo(layer, 'x', { duration: 1.6, ease: 'power3.out' })
          const dy = gsap.quickTo(layer, 'y', { duration: 1.6, ease: 'power3.out' })
          const onMove = (e) => {
            dx((e.clientX / window.innerWidth - 0.5) * -22)
            dy((e.clientY / window.innerHeight - 0.5) * -12)
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
          .to(layer, { scale: 1.04, duration: 0.3, ease: 'none' }, 0)
          .to(s, { sink: 1, duration: 0.8, ease: 'none', onUpdate: apply }, 0.2)
          .to(q('.hero__sink'), { yPercent: 26, duration: 0.8, ease: 'power1.in' }, 0.2)
          .to(lines, { yPercent: 118, duration: 0.45, ease: 'power2.in', stagger: 0.07 }, 0.22)
          .to(q('.hero__sub'), { autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, 0.12)

        return () => {
          offPointer()
          spec.destroy()
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  const [l1, l2, l3, l4] = HERO.title
  return (
    <section ref={root} className="hero" data-mya="0" data-bg="#122624" aria-labelledby="hero-title">
      <div className="hero__stage grid">
        <h1 className="hero__title" id="hero-title" aria-label="T-Rex: Engineered by Evolution">
          <span className="line-mask" aria-hidden="true">
            <span className="line t-rex-line">{l1}</span>
          </span>
          <span className="line-mask" aria-hidden="true">
            <span className="line">{l2}</span>
          </span>
          <span className="line-mask hero__row" aria-hidden="true">
            <span className="line">{l3}</span>
            <span className="hero__sub">{HERO.sub}</span>
          </span>
          <span className="line-mask" aria-hidden="true">
            <span className="line">{l4}</span>
          </span>
        </h1>
        <p className="sr-only">{HERO.sub}</p>
      </div>

      <div className="hero__media">
        <div className="hero__sink">
          <canvas className="specimen-ascii" aria-hidden="true" />
          <Picture data={dino} className="hero__dino" sizes="(min-width: 1024px) 72vw, 150vw" alt={HERO.alt} eager />
        </div>
      </div>
    </section>
  )
}
