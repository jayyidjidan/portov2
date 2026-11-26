import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]')

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Reveal elements that are intersecting, OR already above the viewport
          // (e.g. the hero after a hash-jump reload) so they are never left invisible.
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target) // one-time reveal — does not replay on scroll back
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
