// Native lazy loading waits until an image is almost on screen, which on a
// phone means the reveal starts before the photo exists. This starts each
// download roughly one and a half screens early instead.
export function preloadAhead() {
  const imgs = [...document.querySelectorAll('img[loading="lazy"]')]
  if (!('IntersectionObserver' in window)) {
    imgs.forEach((i) => (i.loading = 'eager'))
    return () => {}
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.loading = 'eager'
        io.unobserve(e.target)
      }
    },
    { rootMargin: '150% 0px' },
  )
  imgs.forEach((i) => io.observe(i))
  return () => io.disconnect()
}
