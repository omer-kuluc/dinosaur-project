import { useRef } from 'react'
import { gsap, SplitText, useGSAP, MQ } from '../lib/gsap'
import { bodyLines } from '../lib/text'
import { STATEMENT } from '../data/content'

// Text only, on a flat moss field: a quiet room after the hero.
export default function Statement() {
  const root = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [text] = q('.statement__text')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return
        // Lines settle out of a mask, easing down from a slightly larger scale.
        SplitText.create(text, {
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
                ? { trigger: text, start: 'top 88%', end: 'bottom 55%', scrub: 0.7 }
                : { trigger: text, start: 'top 82%', once: true },
            }),
        })
        bodyLines(q('.statement__note')[0], { start: 'top 90%' })
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="statement grid" data-mya="0" data-bg="#1e451c" data-field="0">
      <p className="statement__text">{STATEMENT.text}</p>
      <p className="statement__note">{STATEMENT.note}</p>
      <span className="trail-anchor statement__out" data-trail="out" />
    </section>
  )
}
