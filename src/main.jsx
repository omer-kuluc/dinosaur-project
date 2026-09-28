import { createRoot } from 'react-dom/client'
import '@fontsource/bebas-neue/400.css'
import '@fontsource/ibm-plex-sans/300.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-mono/400.css'
import 'lenis/dist/lenis.css'
import './styles/global.css'
import './styles/hero.css'
import './styles/sections.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
