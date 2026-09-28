import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap'
import { createSpecimen } from '../lib/specimen'
import { spotlight } from '../lib/field'
import { headingLines, bodyLines, scrambleIn } from '../lib/text'
import { img } from '../data/content'
import DigSite, { revealDig } from './DigSite'

export default function Exhibit({ data, index, mya, myaOut }) {
  const root = useRef(null)
  const image = img(data.image)
  const left = data.side === 'left'

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [frame] = q('.exhibit__frame')
      const [imgEl] = q('.exhibit__img')
      const [canvas] = q('.specimen-ascii')
      const [card] = q('.card')
      const [title] = q('.card__title')
      const rows = q('.card__facts > div')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        // Mobile crops tighter around the head, so the ASCII sampler follows
        // the same focal point as object-position.
        const [fx, fy] = desktop ? [0.5, 0.5] : data.focus
        const spec = createSpecimen({
          frame,
          img: imgEl,
          canvas,
          cols: desktop ? 84 : 46,
          posX: fx,
          posY: fy,
          // Blocks start at the corner the trackway arrives at.
          clip: { from: 'top', flip: left, bars: desktop ? 16 : 10, steps: desktop ? 18 : 14, skew: 0.6, seed: index * 13 + 5 },
        })
        const s = { decode: 0, reveal: 0 }
        const apply = () => spec.set(s)
        apply()

        revealDig(q('.dig')[0])

        if (desktop) {
          gsap
            .timeline({ scrollTrigger: { trigger: frame, start: 'top 88%', end: 'top 26%', scrub: 0.6 } })
            .to(s, { decode: 1, duration: 0.5, ease: 'power1.out', onUpdate: apply }, 0)
            .to(s, { reveal: 1, duration: 0.62, ease: 'power1.inOut', onUpdate: apply }, 0.38)
          gsap.fromTo(frame, { yPercent: 4 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
          gsap.fromTo(card, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', scrollTrigger: { trigger: card, start: 'top 94%', end: 'top 62%', scrub: 0.6 } })
          headingLines(title, { scrub: true, trigger: card, start: 'top 80%', end: 'top 44%' })
          rows.forEach((row) =>
            gsap.fromTo(row, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', scrollTrigger: { trigger: row, start: 'top 95%', end: 'top 76%', scrub: 0.6 } }),
          )
        } else {
          gsap
            .timeline({ scrollTrigger: { trigger: frame, start: 'top 78%', once: true } })
            .to(s, { decode: 1, duration: 0.9, ease: 'power2.out', onUpdate: apply }, 0)
            .to(s, { reveal: 1, duration: 1.2, ease: 'power2.inOut', onUpdate: apply }, 0.55)
          gsap.fromTo(card, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', scrollTrigger: { trigger: card, start: 'top 90%', once: true } })
          headingLines(title, { trigger: card })
          gsap.fromTo(rows, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: rows[0], start: 'top 92%', once: true } })
        }

        bodyLines(q('.card__body')[0], { start: desktop ? 'top 78%' : 'top 88%' })
        const restoreNum = scrambleIn(q('.card__num')[0], { trigger: card, start: desktop ? 'top 70%' : 'top 85%', duration: 0.8 })
        const restoreCite = scrambleIn(q('.card__cite')[0], { start: 'top 94%', duration: 1.4 })

        // Spotlight: while the specimen is on stage the ASCII field recedes.
        let isLit = false
        ScrollTrigger.create({
          trigger: frame,
          start: 'top 55%',
          end: 'bottom 40%',
          onToggle: (self) => {
            if (self.isActive === isLit) return
            isLit = self.isActive
            spotlight(isLit)
            root.current?.classList.toggle('is-lit', isLit)
          },
        })

        return () => {
          if (isLit) spotlight(false)
          spec.destroy()
          restoreNum()
          restoreCite()
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={data.id} className={`exhibit exhibit--${data.side} exhibit--${data.id}`} aria-labelledby={`${data.id}-title`} data-mya={mya}>
      <div className="exhibit__media">
        <DigSite />
        <div className="exhibit__frame" style={{ '--ar': `${image.width} / ${image.height}`, '--focus': `${data.focus[0] * 100}% ${data.focus[1] * 100}%` }}>
          <canvas className="specimen-ascii" aria-hidden="true" />
          <img
            className="exhibit__img"
            src={image.src}
            srcSet={image.srcSet}
            sizes="(min-width: 960px) 60vw, 94vw"
            width={image.width}
            height={image.height}
            alt={data.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <article className="card">
        <p className="card__num" aria-label={`Exhibit ${data.numeral}`}>
          {data.numeral}
        </p>
        <h2 className="card__title" id={`${data.id}-title`}>
          {data.title}
        </h2>
        <p className="card__body">{data.body}</p>
        <dl className="card__facts">
          {data.facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="card__cite">{data.cite}</p>
      </article>

      <span className="trail-anchor exhibit__out" data-trail="out" data-mya={myaOut} />
    </section>
  )
}
