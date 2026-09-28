import { useRef } from 'react'
import { gsap, SplitText, useGSAP, MQ } from '../lib/gsap'
import { createSpecimen } from '../lib/specimen'
import { hash2 } from '../lib/ascii'
import { HERO, img } from '../data/content'
import { Cactus } from './sprites'

// The Chrome-dino horizon: mostly underscores, with the odd pebble and gap.
const GROUND = Array.from({ length: 320 }, (_, i) => {
  const h = hash2(i, 42)
  return h > 0.96 ? ' ' : h > 0.9 ? '.' : h > 0.86 ? '-' : h > 0.84 ? ',' : '_'
}).join('')

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export default function Hero() {
  const root = useRef(null)
  const image = img(HERO.image)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [frame] = q('.hero__frame')
      const [imgEl] = q('.hero__img')
      const [canvas] = q('.specimen-ascii')
      const [title] = q('.hero__title')
      const lines = q('.hero__title .line')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        const spec = createSpecimen({
          frame,
          img: imgEl,
          canvas,
          cols: desktop ? 92 : 50,
          posY: 0.3,
          clip: { from: 'bottom', bars: desktop ? 18 : 11, steps: 22, skew: 0.5, seed: 11 },
        })

        // Intro and scroll both feed one state, so scrolling during the intro
        // never fights it: the photo shows only where both allow it.
        const s = { decode: 0, rise: 0, sink: 0 }
        const apply = () => spec.set({ decode: s.decode, reveal: Math.min(s.rise, 1 - s.sink), crumble: s.sink })
        apply()

        const split = SplitText.create(lines, { type: 'chars' })
        gsap.set(split.chars, { yPercent: 115 })
        gsap.set(q('.hero__meta, .hero__sub'), { autoAlpha: 0 })
        const [meta] = q('.hero__meta')
        meta.textContent = ' '

        // Load: characters decode out of noise, the photograph rises from the
        // ground in pixel blocks, the title climbs out while its tracking
        // settles to the final -2%.
        const intro = gsap
          .timeline({ paused: true })
          .to(s, { decode: 1, duration: 1.3, ease: 'power2.out', onUpdate: apply }, 0)
          .to(s, { rise: 1, duration: 1.6, ease: 'power2.inOut', onUpdate: apply }, 0.7)
          .to(split.chars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.035 }, 0.45)
          .fromTo(title, { letterSpacing: '0.07em' }, { letterSpacing: '-0.02em', duration: 2, ease: 'expo.out' }, 0.45)
          .set(q('.hero__meta'), { autoAlpha: 1 }, 1)
          .to(q('.hero__meta'), { duration: 1.2, ease: 'none', scrambleText: { text: HERO.meta, chars: '.:-=+*#', revealDelay: 0.2, speed: 0.5 } }, 1)
          .fromTo(q('.hero__sub'), { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 1.4, ease: 'expo.out' }, 1.35)
        Promise.race([spec.ready, wait(2500)]).then(() => intro.play())

        // Scroll: the specimen sinks back into the ground. The photograph
        // breaks into characters from the top down, the characters fall and
        // dissolve, and the title sinks below its own baseline.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: desktop ? '+=100%' : 'bottom top',
              pin: desktop,
              scrub: desktop ? 0.6 : 0.4,
              anticipatePin: 1,
            },
          })
          .to(s, { sink: 1, duration: 1, ease: 'none', onUpdate: apply }, 0)
          .to(q('.hero__sink'), { yPercent: 34, duration: 1, ease: 'power1.in' }, 0)
          .to(lines, { yPercent: 118, duration: 0.55, ease: 'power2.in', stagger: 0.12 }, 0.12)
          .to(q('.hero__meta-wrap, .hero__sub-wrap'), { autoAlpha: 0, y: 30, duration: 0.3, ease: 'power1.in' }, 0.04)
          .to(q('.hero__ground-line'), { xPercent: -22, duration: 1, ease: 'none' }, 0)
          .to(q('.cactus'), { x: () => -window.innerWidth * 0.28, duration: 1, ease: 'none' }, 0)

        return () => {
          spec.destroy()
          meta.textContent = HERO.meta
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="hero" data-mya="0" aria-labelledby="hero-title">
      <div className="hero__stage">
        <div className="hero__frame">
          <div className="hero__sink">
            <canvas className="specimen-ascii" aria-hidden="true" />
            <img
              className="hero__img"
              src={image.src}
              srcSet={image.srcSet}
              sizes="(min-width: 960px) 52vw, 100vw"
              width={image.width}
              height={image.height}
              alt={HERO.alt}
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <div className="hero__ground" aria-hidden="true">
        <Cactus kind="tall" className="cactus--a" />
        <Cactus kind="short" className="cactus--b" />
        <Cactus kind="tall" className="cactus--c" />
        <div className="hero__ground-line">{GROUND}</div>
      </div>

      <div className="hero__copy">
        <div className="hero__meta-wrap">
          <p className="hero__meta">{HERO.meta}</p>
        </div>
        <h1 className="hero__title" id="hero-title" aria-label={HERO.lines.join(' ')}>
          {HERO.lines.map((l) => (
            <span className="line-mask" key={l} aria-hidden="true">
              <span className="line">{l}</span>
            </span>
          ))}
        </h1>
        <div className="hero__sub-wrap">
          <p className="hero__sub">{HERO.sub}</p>
        </div>
      </div>
    </section>
  )
}
