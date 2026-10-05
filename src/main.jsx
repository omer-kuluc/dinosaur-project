import { createRoot } from 'react-dom/client'
import '@fontsource/bebas-neue/400.css'
import '@fontsource/ibm-plex-sans/300.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-mono/400.css'
import 'lenis/dist/lenis.css'
import './styles/global.css'
import './styles/sections.css'
import { ScrollTrigger } from './lib/gsap'
import App from './App.jsx'

// A reload always starts from the hero. ScrollTrigger re-applies its own copy
// of history.scrollRestoration after every refresh, so it has to be told
// "manual" itself; the page is also returned to the top as it unloads.
ScrollTrigger.clearScrollMemory('manual')
window.scrollTo(0, 0)
window.addEventListener('beforeunload', () => window.scrollTo(0, 0))

createRoot(document.getElementById('root')).render(<App />)
