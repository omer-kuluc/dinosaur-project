import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../lib/gsap'
import { headingLines, scrambleIn } from '../lib/text'
import { FINALE } from '../data/content'
import { PixelRex } from './sprites'

const NUMERALS = ['I', 'II', 'III']
// Long enough for the widest card; the excess is clipped.
const DASHES = '-'.repeat(240)
const PIPES = Array.from({ length: 80 }, () => '|').join('\n')

// The final section credits what the project grew from. Each inspiration is a
// full-width name that starts as an outline and fills solid as it scrolls
// through the screen; the Dinosaur Game's runner keeps pace with the fill.
// The design inspiration follows under its own heading, as a large title in a
// card framed with ASCII characters.
export default function Finale() {
  const root = useRef(null)
  const { title, works, credit, note } = FINALE

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        if (ctx.conditions.reduce) return
        const restores = []

        headingLines(q('.finale__title')[0])
        headingLines(q('.credit__heading')[0])

        q('.work').forEach((item) => {
          const once = { trigger: item, start: 'top 90%', once: true }
          gsap.fromTo(item.querySelector('.work__rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: once })
          restores.push(scrambleIn(item.querySelector('.numeral'), { trigger: item, start: once.start, duration: 0.8 }))
          restores.push(scrambleIn(item.querySelector('.work__medium'), { trigger: item, start: once.start, delay: 0.2, duration: 1 }))
          restores.push(scrambleIn(item.querySelector('.work__year'), { trigger: item, start: once.start, delay: 0.35, duration: 0.8 }))

          // The name fills from its outline as the row crosses the screen.
          const name = item.querySelector('.work__name')
          const fill = item.querySelector('.work__fill')
          const runner = item.querySelector('.work__runner')
          const rex = runner?.querySelector('.rex')
          let blinked = false
          const tl = gsap.timeline({
            scrollTrigger: { trigger: name, start: 'top 85%', end: 'bottom 45%', scrub: 0.6, invalidateOnRefresh: true },
            onUpdate: () => {
              if (!rex) return
              const p = tl.progress()
              if (p > 0 && p < 1) {
                rex.dataset.pose = Math.floor(p * 36) % 2 ? 'run1' : 'run2'
                blinked = false
              } else {
                rex.dataset.pose = 'stand'
                if (p >= 1 && !blinked) {
                  blinked = true
                  rex.classList.add('is-blink')
                  gsap.delayedCall(0.15, () => rex.classList.remove('is-blink'))
                }
              }
            },
          })
          tl.fromTo(fill, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 1 }, 0)
          if (runner) {
            tl.fromTo(runner, { x: 0 }, { x: () => name.offsetWidth - runner.offsetWidth, ease: 'none', duration: 1 }, 0)
            tl.fromTo(item.querySelector('.work__ground'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 1 }, 0)
          }
        })

        // The card: frame builds in character steps, the title decodes out of
        // ASCII, then the author appears.
        const [card] = q('.ascii-card')
        const cst = { trigger: card, start: 'top 85%', once: true }
        gsap
          .timeline({ scrollTrigger: cst })
          .fromTo(q('.ascii-card__edge'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'steps(30)', stagger: 0.15 }, 0)
          .fromTo(q('.ascii-card__side'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'steps(10)' }, 0.3)
        restores.push(scrambleIn(q('.ascii-card__work')[0], { trigger: card, start: cst.start, delay: 0.5, duration: 1.6 }))
        restores.push(scrambleIn(q('.ascii-card__author')[0], { trigger: card, start: cst.start, delay: 1.3, duration: 1 }))
        gsap.from(q('.finale__note'), { opacity: 0, y: 10, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: q('.finale__note')[0], start: 'top 95%', once: true } })

        return () => restores.forEach((r) => r())
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="finale" data-bg="#000000" data-field="0">
      <div className="finale__inner grid">
        <h2 className="finale__title">{title}</h2>

        <ol className="finale__list">
          {works.map((w, i) => (
            <li className="work" key={w.name}>
              <span className="work__rule" aria-hidden="true" />
              <div className="work__head">
                <p className="numeral" aria-hidden="true">
                  {NUMERALS[i]}
                </p>
                <p className="work__meta">
                  <span className="work__medium">{w.medium}</span>
                  <span className="work__year">{w.year}</span>
                </p>
              </div>
              <h3 className="work__name" aria-label={w.name}>
                <span className="work__outline" aria-hidden="true">
                  {w.name}
                </span>
                <span className="work__fill" aria-hidden="true">
                  {w.name}
                </span>
                {w.runner && (
                  <>
                    <span className="work__ground" aria-hidden="true" />
                    <span className="work__runner" aria-hidden="true">
                      <PixelRex />
                    </span>
                  </>
                )}
              </h3>
            </li>
          ))}
        </ol>

        <h2 className="credit__heading">{credit.heading}</h2>
        <div className="ascii-card" role="note" aria-label={`${credit.work} by ${credit.author}`}>
          <p className="ascii-card__edge" aria-hidden="true">
            +<span>{DASHES}</span>+
          </p>
          <div className="ascii-card__body" aria-hidden="true">
            <span className="ascii-card__side ascii-card__side--l">{PIPES}</span>
            <p className="ascii-card__work">“{credit.work}”</p>
            <p className="ascii-card__author">by {credit.author}</p>
            <span className="ascii-card__side ascii-card__side--r">{PIPES}</span>
          </div>
          <p className="ascii-card__edge" aria-hidden="true">
            +<span>{DASHES}</span>+
          </p>
        </div>
        <p className="finale__note">{note}</p>
      </div>
    </footer>
  )
}
