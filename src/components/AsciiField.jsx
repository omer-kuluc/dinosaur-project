import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { createField, registerField } from '../lib/field'

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

  return <canvas ref={ref} className="field" aria-hidden="true" />
}
