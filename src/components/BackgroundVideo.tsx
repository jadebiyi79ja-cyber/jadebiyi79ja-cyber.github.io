import { useEffect, useRef, useState } from 'react'

// Files in /public are served from the site root. BASE_URL is Vite's `base`
// ("/" here), so these paths stay correct if the site ever moves to a sub-folder.
const VIDEO_SRC = `${import.meta.env.BASE_URL}hero.mp4`
const POSTER_SRC = `${import.meta.env.BASE_URL}hero-poster.jpg`

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia(REDUCED_MOTION).matches,
  )

  // Follow the "reduce motion" setting, even if it changes while the page is open
  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION)
    const onChange = () => setReduceMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Loop normally; hold still when reduced motion is on
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (reduceMotion) {
      video.pause()
    } else {
      // Browsers can refuse autoplay (e.g. battery saver); the poster then stays up
      video.play().catch(() => {})
    }
  }, [reduceMotion])

  // No hero.mp4 yet, or it can't play? Drop the element and sit on plain black.
  if (failed) return null

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      poster={POSTER_SRC}
      autoPlay={!reduceMotion}
      muted
      loop
      playsInline
      aria-hidden="true"
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover lg:scale-[1.2]"
    />
  )
}
