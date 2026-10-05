import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { scrollToTarget, lockScroll } from '../lib/scroll'

const LINKS = [
  ['#discovery', 'Exhibits'],
  ['#measures', 'Sue'],
  ['#relatives', 'Relatives'],
]
const NUMERALS = ['I', 'II', 'III']

export default function Nav() {
  const ref = useRef(null)
  const menu = useRef(null)
  const tl = useRef(null)
  const [open, setOpen] = useState(false)

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

    // Phone menu: the panel opens from the top, the links rise out of their
    // masks one after another and the two bars turn into a cross. Closing
    // plays the same timeline in reverse.
    const q = gsap.utils.selector(menu)
    const bars = gsap.utils.toArray('.nav__bar', ref.current)
    tl.current = gsap
      .timeline({ paused: true, defaults: { ease: 'power3.inOut' } })
      .set(menu.current, { visibility: 'visible' })
      .fromTo(menu.current, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 }, 0)
      .to(bars[0], { y: 4, rotation: 45, duration: 0.45 }, 0)
      .to(bars[1], { y: -4, rotation: -45, duration: 0.45 }, 0)
      .fromTo(q('.menu__label'), { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 }, 0.3)
      .fromTo(q('.menu__num'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out', stagger: 0.07 }, 0.4)
  })

  const setMenu = (next, after) => {
    const t = tl.current
    if (!t) return
    setOpen(next)
    if (next) {
      lockScroll(true)
      ref.current.classList.remove('is-hidden')
      if (prefersReducedMotion()) t.progress(1)
      else t.timeScale(1).play()
      return
    }
    const done = () => {
      lockScroll(false)
      gsap.set(menu.current, { visibility: 'hidden' })
      after?.()
    }
    if (prefersReducedMotion()) {
      t.progress(0)
      done()
    } else {
      t.eventCallback('onReverseComplete', () => {
        t.eventCallback('onReverseComplete', null)
        done()
      })
      t.timeScale(1.4).reverse()
    }
  }

  // Escape closes the menu; growing past phone size closes it too.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setMenu(false)
    const mq = window.matchMedia('(width >= 600px)')
    const onWide = () => mq.matches && setMenu(false)
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onWide)
    return () => {
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onWide)
    }
  }, [open])

  const go = (e, target) => {
    e.preventDefault()
    scrollToTarget(target, { offset: target === 0 ? 0 : -24, duration: target === 0 ? 2.4 : 1.8 })
  }

  // A link in the phone menu closes the menu first, then scrolls.
  const goFromMenu = (e, target) => {
    e.preventDefault()
    setMenu(false, () => scrollToTarget(target, { offset: target === 0 ? 0 : -24, duration: target === 0 ? 2.4 : 1.8 }))
  }

  return (
    <>
      <header ref={ref} className="nav">
        <a className="nav__mark" href="#top" onClick={(e) => (open ? goFromMenu(e, 0) : go(e, 0))}>
          Tyrant Lizard King
        </a>
        <nav className="nav__links" aria-label="Sections">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={(e) => go(e, href)}>
              {label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setMenu(!open)}
        >
          <span className="nav__bar" />
          <span className="nav__bar" />
        </button>
      </header>

      <div ref={menu} id="site-menu" className="menu" aria-hidden={!open}>
        <nav aria-label="Sections">
          <ul className="menu__list">
            {LINKS.map(([href, label], i) => (
              <li key={href}>
                <a className="menu__link" href={href} tabIndex={open ? 0 : -1} onClick={(e) => goFromMenu(e, href)}>
                  <span className="numeral menu__num">{NUMERALS[i]}</span>
                  <span className="menu__mask">
                    <span className="menu__label">{label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
