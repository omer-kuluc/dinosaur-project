import { useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { initScroll } from './lib/scroll'
import { preloadAhead } from './lib/preload'
import AsciiField from './components/AsciiField'
import Loader from './components/Loader'
import Nav from './components/Nav'
import DepthMeter from './components/DepthMeter'
import Trail from './components/Trail'
import Hero from './components/Hero'
import Statement from './components/Statement'
import Discovery from './components/Discovery'
import Senses from './components/Senses'
import Bite from './components/Bite'
import Measures from './components/Measures'
import Anatomy from './components/Anatomy'
import Closing from './components/Closing'
import Finale from './components/Finale'
import Atmosphere from './components/Atmosphere'
import GridOverlay from './components/GridOverlay'

export default function App() {
  useEffect(() => {
    const stop = initScroll()
    const stopPreload = preloadAhead()
    // Every component has registered its triggers by now; measure once more
    // after webfonts settle line heights.
    ScrollTrigger.refresh()
    document.fonts.ready.then(() => ScrollTrigger.refresh())
    return () => {
      stop()
      stopPreload()
    }
  }, [])

  return (
    <>
      <AsciiField />
      <Nav />
      <DepthMeter />
      <main className="page" id="top">
        <Trail />
        <Hero />
        <Statement />
        <Discovery />
        <Senses />
        <Bite />
        <Measures />
        <Anatomy />
        <Closing />
        <Finale />
      </main>
      <Atmosphere />
      <Loader />
      <GridOverlay />
    </>
  )
}
