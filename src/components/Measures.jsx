import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../lib/gsap'
import { headingLines, bodyLines } from '../lib/text'
import { MEASURES } from '../data/content'

const { scale } = MEASURES
const pct = (m) => `${(m / scale.max) * 100}%`

export default function Measures() {
  const root = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        headingLines(q('.measures__title')[0], desktop ? { scrub: true, start: 'top 84%', end: 'top 50%' } : {})
        bodyLines(q('.measures__body')[0])

        // Figures count up from zero once, their labels wipe in beside them.
        q('.fig').forEach((fig, i) => {
          const num = fig.querySelector('.fig__num')
          const to = Number(num.dataset.value)
          const dec = Number(num.dataset.decimals)
          const o = { v: 0 }
          const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 88%', once: true }, delay: desktop ? i * 0.08 : 0 })
          tl.fromTo(fig.querySelector('.fig__value'), { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }, 0)
            .to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => (num.textContent = o.v.toFixed(dec)) }, 0)
            .fromTo(fig.querySelector('.fig__label'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.out' }, 0.35)
        })

        // The scale bars grow in pixel steps, tied to the scroll.
        q('.scale__bar').forEach((bar) =>
          gsap.fromTo(
            bar,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: desktop ? 'steps(24)' : 'steps(16)',
              duration: desktop ? 1 : 1.4,
              scrollTrigger: desktop ? { trigger: bar, start: 'top 90%', end: 'top 60%', scrub: 0.5 } : { trigger: bar, start: 'top 90%', once: true },
            },
          ),
        )
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="measures" className="measures" aria-labelledby="measures-title">
      <span className="trail-anchor measures__in" data-trail="in" />

      <div className="measures__head">
        <h2 className="measures__title" id="measures-title">
          {MEASURES.title}
        </h2>
        <p className="measures__body">{MEASURES.body}</p>
      </div>

      <div className="measures__figures">
        {MEASURES.figures.map((f) => (
          <div key={f.label} className={`fig fig--${f.size}`}>
            <p className="fig__value">
              <span className="fig__num" data-value={f.value} data-decimals={f.decimals}>
                {f.value.toFixed(f.decimals)}
              </span>
              <span className="fig__unit">{f.unit}</span>
            </p>
            <p className="fig__label">{f.label}</p>
          </div>
        ))}
      </div>

      <figure className="scale" aria-label={`Scale comparison: Sue at ${scale.sue} meters beside an adult human at about ${scale.person} meters.`}>
        <div className="scale__row">
          <span className="scale__name">Sue</span>
          <div className="scale__track">
            <div className="scale__bar scale__bar--sue" style={{ width: pct(scale.sue) }} />
          </div>
        </div>
        <div className="scale__row">
          <span className="scale__name">Adult human</span>
          <div className="scale__track">
            <div className="scale__bar scale__bar--human" style={{ width: pct(scale.person) }} />
          </div>
        </div>
        <div className="scale__ticks" aria-hidden="true">
          {Array.from({ length: scale.max + 1 }, (_, m) => (
            <span key={m} className={m % 5 && m !== scale.max ? 'is-minor' : ''}>
              {m === scale.max ? `${m} m` : m}
            </span>
          ))}
        </div>
      </figure>

      <p className="measures__cite">{MEASURES.cite}</p>
      <span className="trail-anchor measures__out" data-trail="out" />
    </section>
  )
}
