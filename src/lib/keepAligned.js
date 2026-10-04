import { ScrollTrigger } from './gsap'

// Keeps one section's ScrollTriggers matched to the live layout.
//
// On phones, text above the section can grow after ScrollTrigger has measured
// the page (a line that decodes onto a second line), which leaves the
// section's pin engaging and releasing a few pixels off: a visible jump at both
// ends. When the section's position changes, only its own triggers are
// re-measured, so nothing else on the page is touched.
export function keepAligned(section) {
  const page = section.closest('main') || document.body
  const anchor = () => {
    const spacer = section.parentElement
    const el = spacer && spacer.classList.contains('pin-spacer') ? spacer : section
    return el.getBoundingClientRect().top + window.scrollY
  }
  let measured = null
  let raf = 0

  const record = () => {
    measured = anchor()
  }
  const check = () => {
    raf = 0
    if (measured === null) return
    const now = anchor()
    if (Math.abs(now - measured) < 0.5) return
    measured = now
    ScrollTrigger.getAll()
      .filter((st) => st.trigger && section.contains(st.trigger))
      .sort((a, b) => a.start - b.start)
      .forEach((st) => st.refresh())
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(check)
  }

  ScrollTrigger.addEventListener('refresh', record)
  const ro = new ResizeObserver(schedule)
  ro.observe(page)
  record()

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    ScrollTrigger.removeEventListener('refresh', record)
  }
}
