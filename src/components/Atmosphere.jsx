import { useGSAP, gsap, ScrollTrigger } from '../lib/gsap'

// Each chapter is a different room of the hall. Sections declare their room
// with data-bg (backdrop color), data-field (ASCII field opacity) and
// data-theme (light chapters flip the fixed UI to dark ink). Colors cross-fade
// under the scroll so the cut between photography and flat color is felt as
// a transition, not a hard edge. Created after the sections so pins are known.
export default function Atmosphere() {
  useGSAP(() => {
    const backdrop = document.querySelector('.backdrop')
    const field = document.querySelector('.field-wrap')
    const sections = [...document.querySelectorAll('[data-bg]')]
    if (!sections.length) return

    const bgOf = (s) => s.dataset.bg
    const fieldOf = (s) => (s.dataset.field === undefined ? 1 : Number(s.dataset.field))
    gsap.set(backdrop, { backgroundColor: bgOf(sections[0]) })
    gsap.set(field, { opacity: fieldOf(sections[0]) })

    sections.slice(1).forEach((s, i) => {
      const prev = sections[i]
      const st = { trigger: s, start: 'top 80%', end: 'top 30%', scrub: true }
      if (bgOf(prev) !== bgOf(s)) gsap.fromTo(backdrop, { backgroundColor: bgOf(prev) }, { backgroundColor: bgOf(s), ease: 'none', immediateRender: false, scrollTrigger: st })
      if (fieldOf(prev) !== fieldOf(s)) gsap.fromTo(field, { opacity: fieldOf(prev) }, { opacity: fieldOf(s), ease: 'none', immediateRender: false, scrollTrigger: { ...st } })
    })

    // Fixed UI switches to dark ink over light chapters. Each piece of UI
    // reads the chapter under its own position: the nav at the top, the
    // desktop gauge at the middle, the phone ground line at the bottom.
    const html = document.documentElement
    const zones = [
      ['is-light-top', 'top+=36'],
      ['is-light', 'center'],
      ['is-light-bottom', 'bottom-=36'],
    ]
    document.querySelectorAll('[data-theme="light"]').forEach((s) =>
      zones.forEach(([cls, at]) =>
        ScrollTrigger.create({
          trigger: s,
          start: `top ${at}`,
          end: `bottom ${at}`,
          onToggle: (self) => html.classList.toggle(cls, self.isActive),
        }),
      ),
    )
  })

  return null
}
