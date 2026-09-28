import { gsap } from '../lib/gsap'
import { BONES } from './sprites'

// Where a trackway ends: a pegged excavation square and a few exposed bones,
// uncovered in stepped increments just before the specimen above them decodes.
export default function DigSite({ small = false }) {
  return (
    <div className="dig" aria-hidden="true">
      <span className="dig__square" />
      <pre className="dig__bones">{BONES}</pre>
      <span className="trail-anchor dig__anchor" data-trail="in" data-trail-small={small ? 'true' : undefined} />
    </div>
  )
}

export function revealDig(el) {
  if (!el) return
  gsap
    .timeline({ scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
    .fromTo(el.querySelector('.dig__square'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'steps(8)' })
    .fromTo(el.querySelector('.dig__bones'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'steps(6)' }, 0.35)
}
