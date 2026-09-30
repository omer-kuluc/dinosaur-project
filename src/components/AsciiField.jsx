import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { createField, registerField } from '../lib/field'

// The wrapper's opacity belongs to the chapters (flat color rooms hide the
// field); the canvas's own opacity belongs to the exhibit spotlight.
export default function AsciiField() {
  const ref = useRef(null)

  useEffect(() => {
    const api = createField(ref.current)
    registerField(api)
    const onRefresh = () => api.refresh()
    ScrollTrigger.addEventListener('refresh', onRefresh)
    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      registerField(null)
      api.destroy()
    }
  }, [])

  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <div className="field-wrap" aria-hidden="true">
        <canvas ref={ref} className="field" />
      </div>
    </>
  )
}
