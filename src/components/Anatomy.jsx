import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../lib/gsap'
import { headingLines, bodyLines, scrambleIn } from '../lib/text'
import { ANATOMY, img } from '../data/content'
import Picture from './Picture'

// Seeing the whole body. The specimen is first visible only through the word
// BALANCE; a single window then opens from the middle of the word to the full
// frame while the lettering dissolves into the image it was cut from.
export default function Anatomy() {
  const root = useRef(null)
  const image = img(ANATOMY.image)
  // The lettering is filled with the same photograph: 1440 on standard screens,
  // 2000 on high-density ones (usually the same file the photo below loads).
  const src = (w, ext) => `url("/img/specimen-${ANATOMY.image}-${w}.${ext}") type("image/${ext}")`
  const fill = {
    backgroundImage: `image-set(${src(1440, 'avif')} 1x, ${src(1440, 'webp')} 1x, ${src(2000, 'avif')} 2x, ${src(2000, 'webp')} 2x)`,
  }

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const [stage] = q('.anatomy__stage')
      const [word] = q('.anatomy__word')
      const [letters] = q('.anatomy__letters')
      const [view] = q('.anatomy__color')
      const [photo] = q('.anatomy__color img')
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop, reduce } = ctx.conditions
        if (reduce) return

        const restores = [scrambleIn(q('.numeral')[0], { trigger: q('.anatomy__copy')[0], start: 'top 90%', duration: 0.8 }), scrambleIn(q('.cite')[0], { duration: 1.4 })]

        if (desktop) {
          // A closed band across the middle of the word, as wide as the word.
          const band = () => {
            const s = stage.getBoundingClientRect()
            const l = letters.getBoundingClientRect()
            const mid = ((l.top + l.height / 2 - s.top) / s.height) * 100
            const left = ((l.left - s.left) / s.width) * 100
            const right = ((s.right - l.right) / s.width) * 100
            return `inset(${mid}% ${right}% ${100 - mid}% ${left}%)`
          }
          gsap
            .timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: '+=100%', pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true } })
            .fromTo(view, { clipPath: band }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 0.1)
            .fromTo(photo, { scale: 1.08 }, { scale: 1, duration: 1.1, ease: 'power1.out' }, 0.1)
            .to(word, { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, 0.25)
            .to({}, { duration: 0.15 })
          // Chapter text sits below the pinned stage and reads in normally.
          headingLines(q('.anatomy__title')[0], { scrub: true, start: 'top 88%', end: 'top 55%' })
        } else {
          gsap.from(word, { opacity: 0, y: 24, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: word, start: 'top 85%', once: true } })
          gsap
            .timeline({ scrollTrigger: { trigger: view, start: 'top 75%', once: true } })
            .fromTo(view, { clipPath: 'inset(16% 12% 16% 12%)', autoAlpha: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', autoAlpha: 1, duration: 1.6, ease: 'expo.inOut' }, 0)
            .fromTo(photo, { scale: 1.12 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0)
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
          {/* Cover-fit: phones use a 4:5 frame (~165vw wide), desktop fills the screen
              (~132vh wide when the screen is narrower than 4:3), otherwise full width. */}
          <Picture
            data={image}
            sizes="(max-width: 599px) 165vw, (min-width: 1024px) and (max-aspect-ratio: 4/3) 132vh, 100vw"
            alt={ANATOMY.alt}
            className="anatomy__color"
          />
        </div>
        <p className="anatomy__word" style={fill} aria-hidden="true">
          <span className="anatomy__letters">{ANATOMY.word}</span>
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
