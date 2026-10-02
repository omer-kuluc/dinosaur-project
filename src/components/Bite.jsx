import { useRef } from 'react'
import { gsap, SplitText, useGSAP, MQ } from '../lib/gsap'
import { jawClip } from '../lib/stepClip'
import { bodyLines, scrambleIn } from '../lib/text'
import { BITE, img } from '../data/content'
import Picture from './Picture'

// The peak. The frame itself opens like a pair of jaws, then the number fills
// the screen. Pinned for the longest span on the page on desktop.
export default function Bite() {
  const root = useRef(null)
  const image = img(BITE.image)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [frame] = q('.bite__frame')
      const [photo] = q('.bite__frame img')
      const [figure] = q('.bite__figure')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        const j = { p: 0 }
        const teeth = desktop ? 14 : 8
        const bite = () => {
          const v = jawClip(j.p, { teeth })
          frame.style.clipPath = v
          frame.style.webkitClipPath = v
        }
        bite()

        const split = SplitText.create(figure, { type: 'chars' })
        gsap.set(split.chars, { yPercent: 110 })
        const restores = [scrambleIn(q('.numeral')[0], { trigger: root.current, start: desktop ? 'top top' : 'top 60%', duration: 0.8 })]

        if (desktop) {
          gsap
            .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=180%', pin: true, scrub: 0.6, anticipatePin: 1 } })
            .to(j, { p: 1, duration: 0.45, ease: 'power2.inOut', onUpdate: bite }, 0)
            .fromTo(photo, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: 'power1.out' }, 0)
            .to(split.chars, { yPercent: 0, duration: 0.3, stagger: 0.03, ease: 'power3.out' }, 0.42)
            .from(q('.bite__title'), { yPercent: 60, opacity: 0, duration: 0.2, ease: 'power2.out' }, 0.5)
            .from(q('.bite__body, .bite__detail'), { y: 24, opacity: 0, duration: 0.25, stagger: 0.06, ease: 'power2.out' }, 0.62)
            .to({}, { duration: 0.15 })
        } else {
          gsap
            .timeline({ scrollTrigger: { trigger: root.current, start: 'top 65%', once: true } })
            .to(j, { p: 1, duration: 1.5, ease: 'power3.inOut', onUpdate: bite }, 0)
            .fromTo(photo, { scale: 1.25 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0)
          gsap.to(split.chars, { yPercent: 0, duration: 1.1, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: figure, start: 'top 85%', once: true } })
          bodyLines(q('.bite__body')[0])
        }

        restores.push(scrambleIn(q('.cite')[0], { trigger: desktop ? root.current : q('.cite')[0], start: desktop ? 'top -120%' : 'top 95%', duration: 1.4 }))
        return () => {
          frame.style.clipPath = ''
          frame.style.webkitClipPath = ''
          restores.forEach((r) => r())
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="bite" className="bite" data-bg="#000000" aria-labelledby="bite-title">
      <div className="bite__frame">
        {/* Full-bleed cover: on screens narrower than the image (5:4) it is sized by
            height, so it renders ~125vh wide; on wider screens it is 100vw. */}
        <Picture data={image} sizes="(max-aspect-ratio: 5/4) 125vh, 100vw" alt={BITE.alt} />
      </div>
      <div className="bite__scrim" aria-hidden="true" />
      <div className="bite__copy grid">
        <p className="numeral" aria-label={`Chapter ${BITE.numeral}`}>
          {BITE.numeral}
        </p>
        <h2 className="bite__title" id="bite-title">
          {BITE.title}
        </h2>
        <p className="bite__figure" aria-label="35,000 newtons">
          {BITE.figure}
        </p>
        <div className="bite__aside">
          <p className="bite__body">{BITE.body}</p>
          <p className="bite__detail">{BITE.detail}</p>
          <p className="cite">{BITE.cite}</p>
        </div>
      </div>
    </section>
  )
}
