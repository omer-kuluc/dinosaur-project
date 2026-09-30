import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin, ScrambleTextPlugin, useGSAP)

// Mobile browsers resize the viewport when the URL bar collapses; refreshing on
// every one of those would make pinned and scrubbed sections jump.
ScrollTrigger.config({ ignoreMobileResize: true })

export const BREAKPOINT = 1024

// One set of conditions shared by every component so desktop, mobile and
// reduced-motion branches always agree.
export const MQ = {
  desktop: `(min-width: ${BREAKPOINT}px) and (prefers-reduced-motion: no-preference)`,
  mobile: `(max-width: ${BREAKPOINT - 1}px) and (prefers-reduced-motion: no-preference)`,
  reduce: '(prefers-reduced-motion: reduce)',
}

export const prefersReducedMotion = () => window.matchMedia(MQ.reduce).matches

export { gsap, ScrollTrigger, SplitText, MotionPathPlugin, useGSAP }
