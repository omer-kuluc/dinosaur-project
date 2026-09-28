import { useRef } from 'react'
import { gsap, SplitText, useGSAP, MQ } from '../lib/gsap'
import { bodyLines } from '../lib/text'
import { INTRO } from '../data/content'

export default function Intro() {
  const root = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [statement] = q('.intro__statement')
      const [note] = q('.intro__note')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        // The statement settles line by line out of a mask, easing down from a
        // slightly larger scale as it arrives.
        SplitText.create(statement, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              opacity: 0,
              scale: 1.04,
              transformOrigin: '0% 100%',
              ease: desktop ? 'power2.out' : 'expo.out',
              duration: desktop ? 1 : 1.3,
              stagger: desktop ? 0.22 : 0.12,
              scrollTrigger: desktop
                ? { trigger: statement, start: 'top 86%', end: 'bottom 52%', scrub: 0.7 }
                : { trigger: statement, start: 'top 82%', once: true },
            }),
        })
        bodyLines(note, { start: 'top 88%' })
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="intro" data-mya="0">
      <p className="intro__statement">{INTRO.statement}</p>
      <p className="intro__note">{INTRO.note}</p>
      <span className="trail-anchor intro__out" data-trail="out" />
    </section>
  )
}
