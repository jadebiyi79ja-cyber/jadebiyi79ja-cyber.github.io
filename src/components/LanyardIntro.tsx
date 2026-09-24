import { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import LanyardBadge from '@/components/ui/lanyard-badge'

// Tailwind's `sm` breakpoint: narrower than this counts as a phone
const PHONE_QUERY = '(max-width: 639px)'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

// The site's palette: black page, white type, and the red of the "Get in touch" link
const STRAP_COLOR = '#161616' // near-black strap, so the red print carries it
const INK_COLOR = '#fb2c36' // Tailwind red-500
const CARD_COLOR = '#f4f4f4' // white card stock

// The Scroll hint gets its own strip at the bottom; the badge hangs above it
const HINT_STRIP = 96

// Card width that fits: 240px (180px on phones), smaller on short windows so the
// whole badge (about 1.9 card-widths tall, hanging from the top sixth of its area)
// stays inside the area above the hint strip.
function fitCardWidth() {
  const widest = window.matchMedia(PHONE_QUERY).matches ? 180 : 240
  const area = window.innerHeight - HINT_STRIP
  const fitsHeight = Math.floor((area * 0.84 - 28) / 1.9)
  return Math.max(140, Math.min(widest, fitsHeight))
}

// Full-screen intro above the landing page. Scrolling through the first screen
// height pulls the lanyard up out of frame while the card spins; scrolling back
// to the top lets it swing back in. The landing page below is untouched.
export default function LanyardIntro() {
  const introRef = useRef<HTMLDivElement>(null)
  // 0 = badge hanging, 1 = scrolled a full screen and gone. Read by the badge's
  // physics loop every step, so scrolling never re-renders React.
  const exitRef = useRef(0)
  const [cardWidth, setCardWidth] = useState(fitCardWidth)

  // Smaller card on phones and short windows
  useEffect(() => {
    const onResize = () => setCardWidth(fitCardWidth())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Scroll position drives the exit
  useEffect(() => {
    const reduce = window.matchMedia(REDUCED_MOTION)
    const update = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
      exitRef.current = progress
      // Reduce motion: no spin-out (the badge ignores exitRef), just fade the intro away
      if (introRef.current) introRef.current.style.opacity = reduce.matches ? String(1 - progress) : '1'
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    reduce.addEventListener('change', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      reduce.removeEventListener('change', update)
    }
  }, [])

  return (
    <div ref={introRef} role="region" aria-label="Intro" className="relative h-svh bg-black text-white">
      <LanyardBadge
        height={`calc(100svh - ${HINT_STRIP}px)`}
        cardWidth={cardWidth}
        flipButton={false}
        exitRef={exitRef}
        title="Joseph Adebiyi"
        subtitle="3D Design & Technology · Portfolio 2026"
        name="Joseph Adebiyi"
        role="Blender 3D Artist · Event Tech"
        strapText="joseph adebiyi"
        strapLabel="3D DESIGN & TECHNOLOGY"
        strapColor={STRAP_COLOR}
        inkColor={INK_COLOR}
        cardColor={CARD_COLOR}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-pixel text-base tracking-[0.3em] text-white/70"
      >
        <span>SCROLL</span>
        <ArrowDown size={16} aria-hidden="true" className="motion-safe:animate-bounce" />
      </div>
    </div>
  )
}
