import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../lib/gsap'
import { headingLines, bodyLines, scrambleIn } from '../lib/text'
import { DISCOVERY, img } from '../data/content'
import Picture from './Picture'
import DigSite, { revealDig } from './DigSite'

// A display case opening: the image appears through a horizontal slit that
// widens top and bottom while the photograph settles from a slight zoom.
export default function Discovery() {
  const root = useRef(null)
  const image = img(DISCOVERY.image)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [frame] = q('.discovery__frame')
      const [photo] = q('.discovery__frame img')
      const rows = q('.facts > div')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        revealDig(q('.dig')[0])
        const slit = { clipPath: 'inset(49.5% 0% 49.5% 0%)' }
        const open = { clipPath: 'inset(0% 0% 0% 0%)' }

        if (desktop) {
          gsap
            .timeline({ scrollTrigger: { trigger: frame, start: 'top 88%', end: 'top 22%', scrub: 0.6 } })
            .fromTo(frame, slit, { ...open, ease: 'power2.inOut', duration: 1 }, 0)
            .fromTo(photo, { scale: 1.18 }, { scale: 1, ease: 'power1.out', duration: 1.2 }, 0)
          headingLines(q('.discovery__title')[0], { scrub: true, start: 'top 86%', end: 'top 52%' })
          rows.forEach((row) =>
            gsap.fromTo(row, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', scrollTrigger: { trigger: row, start: 'top 94%', end: 'top 78%', scrub: 0.6 } }),
          )
        } else {
          gsap
            .timeline({ scrollTrigger: { trigger: frame, start: 'top 82%', once: true } })
            .fromTo(frame, slit, { ...open, duration: 1.3, ease: 'expo.inOut' }, 0)
            .fromTo(photo, { scale: 1.18 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.1)
          headingLines(q('.discovery__title')[0])
          gsap.fromTo(rows, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: rows[0], start: 'top 92%', once: true } })
        }

        bodyLines(q('.discovery__body')[0])
        const r1 = scrambleIn(q('.numeral')[0], { duration: 0.8 })
        const r2 = scrambleIn(q('.cite')[0], { duration: 1.4 })
        return () => {
          r1()
          r2()
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="discovery" className="discovery grid" data-mya="66" data-bg="#0b1a18" aria-labelledby="discovery-title">
      <header className="discovery__head">
        <p className="numeral" aria-label={`Chapter ${DISCOVERY.numeral}`}>
          {DISCOVERY.numeral}
        </p>
        <h2 className="discovery__title" id="discovery-title">
          {DISCOVERY.title}
        </h2>
      </header>

      <div className="discovery__media">
        <DigSite />
        <div className="discovery__frame" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
          <Picture data={image} sizes="(min-width: 1024px) 80vw, (min-width: 600px) 92vw, 100vw" alt={DISCOVERY.alt} />
        </div>
      </div>

      <dl className="facts discovery__facts">
        {DISCOVERY.facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="discovery__text">
        <p className="discovery__body">{DISCOVERY.body}</p>
        <p className="cite">{DISCOVERY.cite}</p>
      </div>

      <span className="trail-anchor discovery__out" data-trail="out" />
    </section>
  )
}
