import { useRef } from 'react'
import { ScrollTrigger, useGSAP } from '../lib/gsap'
import { scrollToTarget } from '../lib/scroll'

const LINKS = [
  ['#discovery', 'Exhibits'],
  ['#measures', 'Sue'],
  ['#relatives', 'Relatives'],
]

export default function Nav() {
  const ref = useRef(null)

  useGSAP(() => {
    // Step aside while reading downward, return on any upward scroll.
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const hide = self.direction === 1 && self.scroll() > window.innerHeight * 0.5
        ref.current.classList.toggle('is-hidden', hide)
      },
    })
  })

  const go = (e, target) => {
    e.preventDefault()
    scrollToTarget(target, { offset: target === 0 ? 0 : -24, duration: target === 0 ? 2.4 : 1.8 })
  }

  return (
    <header ref={ref} className="nav">
      <a className="nav__mark" href="#top" onClick={(e) => go(e, 0)}>
        The Night Archive
      </a>
      <nav className="nav__links" aria-label="Sections">
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} onClick={(e) => go(e, href)}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  )
}
