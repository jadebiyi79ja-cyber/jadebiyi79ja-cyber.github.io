import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface LoaderIntroProps {
  /** Called as the overlay starts sliding up: mount the lanyard screen now so it hangs in as the overlay leaves. */
  onReveal: () => void
  /** Called once the overlay has left the screen. */
  onDone: () => void
}

// Full-screen loading animation shown before the lanyard intro: the cube logo drops
// in face by face, spins every 0.5s while a 0-100 counter runs, then the overlay
// slides up and the lanyard screen takes over.
export default function LoaderIntro({ onReveal, onDone }: LoaderIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hold the page still while loading, and start from the top
    const html = document.documentElement
    const previousOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const ctx = gsap.context(() => {
      const state = { n: 0 }
      const COUNT_START = 0.4
      const COUNT_LENGTH = 2

      gsap.set('.loader-logo', { transformOrigin: '50% 50%' })
      gsap.set('.loader-face', { transformOrigin: '50% 50%' })

      const tl = gsap.timeline()
      tl.from('.loader-face', {
        opacity: 0, y: -40, scale: 0.6, duration: 0.6, stagger: 0.25, ease: 'back.out(1.7)',
      })
        .to(state, {
          n: 100, duration: COUNT_LENGTH, ease: 'power1.inOut',
          onUpdate: () => {
            if (countRef.current) countRef.current.textContent = String(Math.round(state.n))
          },
        }, COUNT_START)
        .to('.loader-bar', { width: '100%', duration: COUNT_LENGTH, ease: 'power1.inOut' }, COUNT_START)

      // A full turn every 0.5s while the counter runs
      for (let t = COUNT_START; t < COUNT_START + COUNT_LENGTH; t += 0.5) {
        tl.to('.loader-logo', { rotation: '+=360', duration: 0.4, ease: 'power2.inOut' }, t)
      }

      tl.to('.loader-logo', { scale: 1.15, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' })
        .call(onReveal)
        .to(rootRef.current, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' })
        .call(onDone)
    }, rootRef)

    return () => {
      ctx.revert()
      html.style.overflow = previousOverflow
    }
  }, [onReveal, onDone])

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-black text-white"
    >
      <svg
        className="loader-logo overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        width="120"
        height="120"
        viewBox="0 0 256 256"
        fill="none"
        aria-hidden="true"
      >
        <path className="loader-face" d="M128 16 L224 72 L128 128 L32 72 Z" fill="white" />
        <path className="loader-face" d="M32 72 L128 128 L128 240 L32 184 Z" fill="white" fillOpacity="0.7" />
        <path className="loader-face" d="M128 128 L224 72 L224 184 L128 240 Z" fill="white" fillOpacity="0.45" />
      </svg>
      <div ref={countRef} className="font-pixel text-3xl tracking-[0.2em] text-white/70">0</div>
      <div className="h-1 w-60 overflow-hidden bg-white/20">
        <span className="loader-bar block h-full w-0 bg-white" />
      </div>
    </div>
  )
}
