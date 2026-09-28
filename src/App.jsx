import { useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { initScroll } from './lib/scroll'
import { EXHIBITS } from './data/content'
import AsciiField from './components/AsciiField'
import Nav from './components/Nav'
import DepthMeter from './components/DepthMeter'
import Trail from './components/Trail'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Exhibit from './components/Exhibit'
import Measures from './components/Measures'
import Closing from './components/Closing'

export default function App() {
  useEffect(() => {
    const stop = initScroll()
    // Every component has registered its triggers by now; measure once more
    // after webfonts settle line heights.
    ScrollTrigger.refresh()
    document.fonts.ready.then(() => ScrollTrigger.refresh())
    return stop
  }, [])

  return (
    <>
      <AsciiField />
      <Nav />
      <DepthMeter />
      <main className="page" id="top">
        <Trail />
        <Hero />
        <Intro />
        <Exhibit data={EXHIBITS[0]} index={0} mya={66} />
        <Exhibit data={EXHIBITS[1]} index={1} />
        <Measures />
        <Exhibit data={EXHIBITS[2]} index={2} />
        <Exhibit data={EXHIBITS[3]} index={3} myaOut={68} />
        <Closing />
        <footer className="footer">
          <p className="footer__mark">The Night Archive</p>
          <p className="footer__note">A design study. Illustrations are artistic reconstructions, not scientific renderings.</p>
        </footer>
      </main>
    </>
  )
}
