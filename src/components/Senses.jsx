import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap'
import { createPixelFocus } from '../lib/pixelFocus'
import { bodyLines, scrambleIn } from '../lib/text'
import { SENSES, img } from '../data/content'
import Picture from './Picture'

// Perception as resolution: the specimen sits on a sticky panel and comes into
// focus block by block while the reader moves through the senses, then drifts
// slowly toward the eye.
export default function Senses() {
  const root = useRef(null)
  const image = img(SENSES.image)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [panel] = q('.senses__panel')
      const [lens] = q('.senses__lens')
      const [canvas] = q('.senses__pixels')
      const [photo] = q('.senses__lens img')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        const focus = createPixelFocus({ canvas, img: photo, preview: image.preview, from: desktop ? 64 : 40, posX: 0.5, posY: 0.2 })
        focus.set(0)

        // Zoom toward the eye: work out where the eye lands inside the
        // object-fit: cover crop so the transform origin sits on it.
        const placeOrigin = () => {
          const W = lens.clientWidth
          const H = lens.clientHeight
          const scale = Math.max(W / image.width, H / image.height)
          const [ex, ey] = SENSES.eye
          const x = ex * image.width * scale - (image.width * scale - W) * 0.5
          const y = ey * image.height * scale - (image.height * scale - H) * 0.2
          gsap.set(lens, { transformOrigin: `${x}px ${y}px` })
        }
        placeOrigin()
        ScrollTrigger.addEventListener('refresh', placeOrigin)

        const f = { p: 0 }
        gsap.to(f, {
          p: 1,
          ease: 'none',
          onUpdate: () => focus.set(f.p),
          scrollTrigger: { trigger: root.current, start: desktop ? 'top 70%' : 'top 75%', end: desktop ? 'top -60%' : 'top -30%', scrub: 0.4 },
        })
        gsap.fromTo(lens, { scale: 1 }, { scale: desktop ? 1.35 : 1.2, ease: 'none', scrollTrigger: { trigger: root.current, start: desktop ? 'top -60%' : 'top -30%', end: 'bottom bottom', scrub: 0.6 } })

        // Each sense arrives with its figure wiping in, a label decoding and
        // the explanation rising line by line.
        const restores = []
        q('.sense').forEach((block) => {
          const fig = block.querySelector('.sense__figure')
          gsap.fromTo(
            fig,
            { clipPath: 'inset(0% 100% 0% 0%)' },
            desktop
              ? { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', scrollTrigger: { trigger: block, start: 'top 80%', end: 'top 45%', scrub: 0.6 } }
              : { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: block, start: 'top 85%', once: true } },
          )
          restores.push(scrambleIn(block.querySelector('.sense__label'), { trigger: block, start: 'top 78%', duration: 0.9 }))
          bodyLines(block.querySelector('.sense__text'), { trigger: block, start: desktop ? 'top 62%' : 'top 80%' })
        })
        restores.push(scrambleIn(q('.numeral')[0], { duration: 0.8 }))
        restores.push(scrambleIn(q('.cite')[0], { duration: 1.4 }))
        gsap.from(q('.senses__title'), { yPercent: 40, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: q('.senses__title')[0], start: 'top 85%', once: true } })

        return () => {
          ScrollTrigger.removeEventListener('refresh', placeOrigin)
          focus.destroy()
          restores.forEach((r) => r())
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="senses" className="senses grid" data-bg="#000000" aria-labelledby="senses-title">
      <div className="senses__panel">
        <div className="senses__lens">
          <Picture data={image} sizes="(min-width: 1024px) 50vw, 100vw" alt={SENSES.alt} imgClassName="senses__img" />
          <canvas className="senses__pixels" aria-hidden="true" />
        </div>
      </div>

      <div className="senses__content">
        <header className="senses__head">
          <span className="trail-anchor senses__in" data-trail="in" />
          <p className="numeral" aria-label={`Chapter ${SENSES.numeral}`}>
            {SENSES.numeral}
          </p>
          <h2 className="senses__title" id="senses-title">
            {SENSES.title}
          </h2>
        </header>
        {SENSES.blocks.map((b) => (
          <article className="sense" key={b.label}>
            <p className="sense__figure">{b.figure}</p>
            <p className="sense__label">{b.label}</p>
            <p className="sense__text">{b.text}</p>
          </article>
        ))}
        <p className="cite">{SENSES.cite}</p>
      </div>
    </section>
  )
}
