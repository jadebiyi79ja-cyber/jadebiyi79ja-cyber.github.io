"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { ArrowDown } from "lucide-react"

// ─────────────────────────────────────────────────────────────
// Scroll-scrub video hero (adapted from "scroll-locked-video-hero").
// While it's on screen at the top of the page, the page is pinned
// (body position:fixed — the reliable technique modal libraries use)
// and wheel, touch and keyboard input drive video.currentTime
// forwards and backwards. At the end of the video, scrolling further
// releases the page; scrolling back up to the top re-engages the scrub.
// With "reduce motion" on there's no lock: it shows the final frame.
// ─────────────────────────────────────────────────────────────

export interface ScrollLockedVideoHeroProps {
  videoSrc: string
  posterSrc?: string
  title: ReactNode
  tagline?: ReactNode
  scrollHint?: string
  /** Total input distance (px) needed to scrub the full video. */
  scrubDistance?: number
  className?: string
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

const KEY_STEPS: Record<string, number> = { ArrowDown: 120, ArrowUp: -120, PageDown: 600, PageUp: -600 }

export default function ScrollLockedVideoHero({
  videoSrc,
  posterSrc,
  title,
  tagline,
  scrollHint = "SCROLL",
  scrubDistance = 2400,
  className = "",
}: ScrollLockedVideoHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!videoRef.current || !sectionRef.current) return
    // Typed copies: TypeScript doesn't carry the null check into the helper functions below
    const video: HTMLVideoElement = videoRef.current
    const section: HTMLDivElement = sectionRef.current

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let duration = 0
    let rafId = 0
    let targetProgress = 0
    let currentProgress = 0
    let started = false
    let isSeeking = false
    let pendingTime: number | null = null
    let lastSought = -1
    let locked = false
    let lockedScrollY = 0
    let touchY = 0

    // Draw the finished state directly (used for reduced motion)
    function showEnd() {
      if (titleRef.current) titleRef.current.style.opacity = "0"
      if (hintRef.current) hintRef.current.style.opacity = "0"
      if (taglineRef.current) taglineRef.current.style.opacity = "1"
      if (progressBarRef.current) progressBarRef.current.style.transform = "scaleX(1)"
    }

    const onLoadedData = () => {
      duration = video.duration || 0
      if (reduceMotion) video.currentTime = Math.max(0, duration - 0.05)
    }
    video.addEventListener("loadeddata", onLoadedData)

    // iOS Safari may not buffer a video that is only ever seeked, never
    // played. A silent play-then-pause kicks off loading.
    video.play().then(() => video.pause()).catch(() => {})

    if (reduceMotion) {
      showEnd()
      return () => video.removeEventListener("loadeddata", onLoadedData)
    }

    // Seeks can't overlap: queue the latest target while one is in flight
    const onSeeked = () => {
      isSeeking = false
      if (pendingTime !== null) {
        const t = pendingTime
        pendingTime = null
        isSeeking = true
        video.currentTime = t
      }
    }
    video.addEventListener("seeked", onSeeked)

    function seekTo(t: number) {
      if (Math.abs(t - lastSought) < 1 / 48) return // same frame: nothing to do
      lastSought = t
      if (isSeeking) {
        pendingTime = t
        return
      }
      isSeeking = true
      video.currentTime = t
    }

    function engageLock() {
      if (locked) return
      locked = true
      lockedScrollY = window.scrollY
      const b = document.body.style
      b.position = "fixed"
      b.top = `-${lockedScrollY}px`
      b.left = "0"
      b.right = "0"
      b.width = "100%"
      b.overscrollBehavior = "none"
      section.style.touchAction = "none"
    }

    function releaseLock() {
      if (!locked) return
      locked = false
      const b = document.body.style
      b.position = b.top = b.left = b.right = b.width = b.overscrollBehavior = ""
      window.scrollTo(0, lockedScrollY)
      section.style.touchAction = "pan-y" // let phones scroll the page again
    }

    // Returns true when the input was used to scrub (so the page must not move)
    function handleDelta(deltaY: number) {
      if (!locked) {
        // Re-engage when scrolling back up while the page is at the top
        if (deltaY < 0 && window.scrollY <= 1) engageLock()
        else return false
      } else if (deltaY > 0 && targetProgress >= 1 && currentProgress > 0.98) {
        releaseLock() // at the end and still pushing forward: hand scrolling back to the page
        return false
      }
      targetProgress = clamp(targetProgress + deltaY / scrubDistance, 0, 1)
      if (targetProgress > 0.001) started = true
      return true
    }

    const onWheel = (e: WheelEvent) => {
      if (handleDelta(e.deltaY)) e.preventDefault()
    }
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY
      const deltaY = touchY - y
      touchY = y
      if (handleDelta(deltaY) && e.cancelable) e.preventDefault()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      // Leave typing alone (the target can be window/document, which have no closest())
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]")) return
      const step = e.key === " " ? (e.shiftKey ? -600 : 600) : KEY_STEPS[e.key]
      if (step !== undefined && handleDelta(step)) e.preventDefault()
    }

    if (window.scrollY <= 1) engageLock()
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("keydown", onKeyDown)

    function frame() {
      currentProgress += (targetProgress - currentProgress) * 0.18
      if (duration > 0) seekTo(currentProgress * duration)

      video.style.transform = `scale(${1 + currentProgress * 0.06})`
      if (titleRef.current) {
        const t = 1 - clamp(currentProgress / 0.35, 0, 1)
        titleRef.current.style.opacity = String(t)
        titleRef.current.style.transform = `translateY(${(1 - t) * -24}px) scale(${0.96 + t * 0.04})`
        titleRef.current.style.filter = `blur(${(1 - t) * 10}px)`
      }
      if (hintRef.current) hintRef.current.style.opacity = started ? "0" : "1"
      if (taglineRef.current) {
        // The payoff: blurs into focus as the reveal completes
        const t = clamp((currentProgress - 0.82) / 0.18, 0, 1)
        taglineRef.current.style.opacity = String(t)
        taglineRef.current.style.transform = `translateY(${(1 - t) * 20}px) scale(${0.97 + t * 0.03})`
        taglineRef.current.style.filter = `blur(${(1 - t) * 8}px)`
      }
      if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${currentProgress})`

      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)

    return () => {
      video.removeEventListener("loadeddata", onLoadedData)
      video.removeEventListener("seeked", onSeeked)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("keydown", onKeyDown)
      cancelAnimationFrame(rafId)
      releaseLock()
    }
  }, [scrubDistance])

  return (
    <div ref={sectionRef} className={`relative h-dvh w-full overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        // Always visible: the poster (the video's own first frame) shows while it loads
        className="pointer-events-none absolute inset-0 h-full w-full origin-center object-cover will-change-transform"
      />

      {/* Soft top/bottom shading so the text reads over bright frames */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.35),transparent_30%,rgb(0_0_0/0.15)_70%,rgb(0_0_0/0.55))]" />

      <div
        ref={titleRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-[6%] text-center will-change-[transform,filter,opacity]"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wide uppercase font-normal leading-none text-white text-shadow-soft">
          {title}
        </h1>
      </div>

      {tagline && (
        <div
          ref={taglineRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-[8%] text-center opacity-0"
        >
          <p className="text-2xl sm:text-4xl md:text-5xl tracking-wide uppercase font-normal leading-tight text-white text-shadow-soft">
            {tagline}
          </p>
        </div>
      )}

      <div
        ref={hintRef}
        className="pointer-events-none absolute bottom-[clamp(20px,6vh,48px)] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-pixel text-base tracking-[0.3em] text-white/70 transition-opacity duration-500"
      >
        <span>{scrollHint}</span>
        <ArrowDown size={16} aria-hidden="true" className="motion-safe:animate-bounce" />
      </div>

      {/* Thin progress line that fills as the video advances */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
        <div ref={progressBarRef} className="h-full w-full origin-left scale-x-0 bg-white/85" />
      </div>
    </div>
  )
}
