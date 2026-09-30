import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../lib/gsap'
import { bodyLines, scrambleIn } from '../lib/text'
import { SENSES, img } from '../data/content'
import Picture from './Picture'

// The specimen holds on a sticky panel while the senses scroll past it.
export default function Senses() {
  const root = useRef(null)
  const image = img(SENSES.image)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [lens] = q('.senses__lens')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        // The typography carries this chapter, so the image stays quiet: one
        // soft entrance as the panel arrives, then it holds still.
        gsap.fromTo(
          lens,
          { autoAlpha: 0, scale: 1.05 },
          { autoAlpha: 1, scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: desktop ? 'top 65%' : 'top 75%', once: true } },
        )

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
