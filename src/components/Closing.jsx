import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../lib/gsap'
import { createSpecimen } from '../lib/specimen'
import { spotlight } from '../lib/field'
import { headingLines, bodyLines, scrambleIn } from '../lib/text'
import { scrollToTarget } from '../lib/scroll'
import { CLOSING, img } from '../data/content'
import Picture from './Picture'
import DigSite, { revealDig } from './DigSite'

// The bookend: the last specimen decodes out of the ASCII ground exactly like
// the first one did, and the headline overlaps it on a shared plane.
export default function Closing() {
  const root = useRef(null)
  const image = img(CLOSING.image)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [frame] = q('.closing__frame')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        const spec = createSpecimen({
          frame,
          layers: [q('.closing__frame picture')[0]],
          canvas: q('.specimen-ascii')[0],
          preview: image.preview,
          cols: desktop ? 80 : 46,
          posY: 0.35,
          clip: { from: 'top', flip: false, bars: desktop ? 14 : 10, steps: 22, skew: 0.6, seed: 71 },
        })
        const s = { decode: 0, reveal: 0 }
        const apply = () => spec.set(s)
        apply()
        revealDig(q('.dig')[0])

        gsap
          .timeline({ scrollTrigger: desktop ? { trigger: frame, start: 'top 85%', end: 'top 20%', scrub: 0.6 } : { trigger: frame, start: 'top 78%', once: true } })
          .to(s, { decode: 1, duration: desktop ? 0.5 : 0.9, ease: 'power1.out', onUpdate: apply }, 0)
          .to(s, { reveal: 1, duration: desktop ? 0.62 : 1.2, ease: 'power1.inOut', onUpdate: apply }, desktop ? 0.38 : 0.55)

        headingLines(q('.closing__title')[0], desktop ? { scrub: true, start: 'top 82%', end: 'top 40%' } : {})
        bodyLines(q('.closing__body')[0])

        // The last line resolves slowly: a wipe while its wide tracking draws in.
        gsap.fromTo(
          q('.closing__kicker'),
          { clipPath: 'inset(0% 100% 0% 0%)', letterSpacing: '0.14em' },
          { clipPath: 'inset(0% 0% 0% 0%)', letterSpacing: '0em', duration: 2.2, ease: 'expo.out', scrollTrigger: { trigger: q('.closing__kicker')[0], start: 'top 88%', once: true } },
        )
        const restore = scrambleIn(q('.cite')[0], { duration: 1.4 })
        gsap.from(q('.closing__action'), { opacity: 0, y: 16, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: q('.closing__action')[0], start: 'top 95%', once: true } })

        // While the specimen is on stage the ASCII field recedes.
        let isLit = false
        gsap.timeline({
          scrollTrigger: {
            trigger: frame,
            start: 'top 55%',
            end: 'bottom 40%',
            onToggle: (self) => {
              if (self.isActive === isLit) return
              isLit = self.isActive
              spotlight(isLit)
            },
          },
        })

        return () => {
          if (isLit) spotlight(false)
          spec.destroy()
          restore()
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="relatives" className="closing grid" data-bg="#000000" aria-labelledby="closing-title">
      <div className="closing__media">
        <DigSite small />
        <div className="closing__frame" data-mya="150">
          <canvas className="specimen-ascii" aria-hidden="true" />
          <Picture data={image} sizes="(min-width: 1024px) 50vw, (min-width: 600px) 75vw, 92vw" alt={CLOSING.alt} className="closing__picture" />
        </div>
      </div>

      <div className="closing__text">
        <h2 className="closing__title" id="closing-title">
          {CLOSING.title}
        </h2>
        <p className="closing__body">{CLOSING.body}</p>
        <p className="closing__kicker">{CLOSING.kicker}</p>
        <p className="cite">{CLOSING.cite}</p>
        <button type="button" className="closing__action" onClick={() => scrollToTarget(0, { duration: 2.6 })}>
          {CLOSING.action}
        </button>
      </div>
    </section>
  )
}
