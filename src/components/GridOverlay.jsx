import { useEffect, useState } from 'react'

// Press G to compare the layout against the design file. Columns, gutters and
// margins come from the same CSS variables the sections use, so the overlay
// can never disagree with the real grid.
export default function GridOverlay() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'g' && e.key !== 'G') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      setOn((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!on) return null
  return (
    <div className="grid-overlay" aria-hidden="true">
      <div className="grid grid-overlay__cols">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <p className="grid-overlay__label" />
    </div>
  )
}
