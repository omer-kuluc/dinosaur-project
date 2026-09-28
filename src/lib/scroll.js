import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis = null

// Lenis drives the scroll position from GSAP's ticker so smooth scrolling and
// every ScrollTrigger read the same frame. Touch keeps native momentum
// (syncTouch: false) because emulated inertia feels worse on phones.
export function initScroll() {
  if (prefersReducedMotion()) return () => {}

  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    lenis.destroy()
    lenis = null
  }
}

export function scrollToTarget(target, { offset = 0, duration = 1.8 } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration, easing: (t) => 1 - Math.pow(1 - t, 4) })
    return
  }
  const y = typeof target === 'number' ? target : document.querySelector(target).getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
