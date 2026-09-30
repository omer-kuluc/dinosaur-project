import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../lib/gsap'
import { headingLines, bodyLines, scrambleIn } from '../lib/text'
import { ANATOMY, img } from '../data/content'
import Picture from './Picture'

// Seeing inside the body. The specimen is first visible only through the word
// BALANCE; the camera pushes through the letters, and a scan line then sweeps
// across, turning the grey silhouette into its full-colour internal structure.
export default function Anatomy() {
  const root = useRef(null)
  const image = img(ANATOMY.image)
  // The lettering is filled with the same photograph (a mid-size rendition).
  const fill = { backgroundImage: `image-set(url("/img/specimen-${ANATOMY.image}-1024.avif") type("image/avif"), url("/img/specimen-${ANATOMY.image}-1024.webp") type("image/webp"))` }

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [stage] = q('.anatomy__stage')
      const [word] = q('.anatomy__word')
      const [grey] = q('.anatomy__grey')
      const [color] = q('.anatomy__color')
      const [scan] = q('.anatomy__scan')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        const restores = [scrambleIn(q('.numeral')[0], { trigger: q('.anatomy__copy')[0], start: 'top 90%', duration: 0.8 }), scrambleIn(q('.cite')[0], { duration: 1.4 })]
        const scanTo = (tl, at, duration) =>
          tl
            .fromTo(color, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: 'none' }, at)
            .fromTo(scan, { xPercent: 0, autoAlpha: 1 }, { xPercent: 100, duration, ease: 'none' }, at)
            .to(scan, { autoAlpha: 0, duration: duration * 0.1 }, at + duration)

        if (desktop) {
          const tl = gsap
            .timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: '+=160%', pin: true, scrub: 0.6, anticipatePin: 1 } })
            .fromTo(word, { scale: 1 }, { scale: 9, duration: 0.4, ease: 'power2.in' }, 0.05)
            .to(word, { autoAlpha: 0, duration: 0.12, ease: 'none' }, 0.33)
            .fromTo(grey, { autoAlpha: 0, scale: 1.2 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, 0.22)
          scanTo(tl, 0.5, 0.3)
          tl.to({}, { duration: 0.1 })
          // Chapter text sits below the pinned stage and reads in normally.
          headingLines(q('.anatomy__title')[0], { scrub: true, start: 'top 88%', end: 'top 55%' })
        } else {
          gsap.from(word, { scale: 1.12, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: word, start: 'top 85%', once: true } })
          const tl = gsap.timeline({ scrollTrigger: { trigger: grey, start: 'top 70%', once: true } })
          tl.fromTo(grey, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, 0)
          scanTo(tl, 0.4, 1.6)
          headingLines(q('.anatomy__title')[0])
        }

        bodyLines(q('.anatomy__body')[0])
        gsap.fromTo(q('.anatomy .facts > div'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: q('.anatomy .facts')[0], start: 'top 92%', once: true } })

        return () => restores.forEach((r) => r())
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="anatomy" className="anatomy" data-bg="#122624" aria-labelledby="anatomy-title">
      <div className="anatomy__stage">
        <div className="anatomy__view">
          <Picture data={image} sizes="100vw" className="anatomy__grey" />
          <Picture data={image} sizes="100vw" alt={ANATOMY.alt} className="anatomy__color" />
          <span className="anatomy__scan" aria-hidden="true" />
        </div>
        <p className="anatomy__word" style={fill} aria-hidden="true">
          {ANATOMY.word}
        </p>
      </div>

      <div className="anatomy__copy grid">
        <p className="numeral" aria-label={`Chapter ${ANATOMY.numeral}`}>
          {ANATOMY.numeral}
        </p>
        <h2 className="anatomy__title" id="anatomy-title">
          {ANATOMY.title}
        </h2>
        <p className="anatomy__body">{ANATOMY.body}</p>
        <dl className="facts">
          {ANATOMY.facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="cite">{ANATOMY.cite}</p>
        <span className="trail-anchor anatomy__out" data-trail="out" data-mya="68" />
      </div>
    </section>
  )
}
