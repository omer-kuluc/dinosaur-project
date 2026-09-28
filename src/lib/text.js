import { gsap, SplitText } from './gsap'

// Each text role gets its own motion so reveals never repeat:
//   headings  masked lines, tied to scroll on desktop, played once on mobile
//   body      lines rise out of a mask with a soft opacity lift, played once
//   labels    a short ASCII decode into their final text

export function headingLines(el, { scrub = false, trigger = el, start = 'top 82%', end = 'top 45%' } = {}) {
  return SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 112,
        duration: scrub ? 1 : 1.2,
        ease: scrub ? 'power2.out' : 'expo.out',
        stagger: scrub ? 0.18 : 0.1,
        scrollTrigger: scrub ? { trigger, start, end, scrub: 0.6 } : { trigger, start: 'top 86%', once: true },
      }),
  })
}

export function bodyLines(el, { trigger = el, start = 'top 84%', delay = 0 } = {}) {
  return SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 100,
        opacity: 0,
        duration: 1.15,
        ease: 'expo.out',
        stagger: 0.075,
        delay,
        scrollTrigger: { trigger, start, once: true },
      }),
  })
}

// Returns a cleanup that restores the original text if the context reverts.
export function scrambleIn(el, { trigger = el, start = 'top 90%', delay = 0, duration = 1.1 } = {}) {
  const text = el.textContent
  el.textContent = ' '
  gsap.to(el, {
    duration,
    delay,
    ease: 'none',
    scrambleText: { text, chars: '.:-=+*#', revealDelay: 0.3, speed: 0.5 },
    scrollTrigger: { trigger, start, once: true },
  })
  return () => {
    el.textContent = text
  }
}
