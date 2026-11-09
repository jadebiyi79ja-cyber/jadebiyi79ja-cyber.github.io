"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowDown } from "lucide-react"

// ─────────────────────────────────────────────────────────────
// Scroll-scrub video hero (adapted from "scroll-locked-video-hero").
// While it's on screen at the top of the page, the page is pinned
// (body position:fixed — the reliable technique modal libraries use)
// and wheel, touch and keyboard input drive video.currentTime
// forwards and backwards. Each scroll gesture (one wheel flick, one swipe,
// one key press) jumps to the next stop, so the reveal takes 3 scrolls on
// desktop and 2 on phones. At the end of the video, scrolling further
// releases the page; scrolling back up to the top re-engages the scrub.
// With "reduce motion" on there's no lock: it shows the final frame.
// ─────────────────────────────────────────────────────────────

export interface ScrollLockedVideoHeroProps {
  videoSrc: string
  posterSrc?: string
  title: ReactNode
  tagline?: ReactNode
  scrollHint?: string
  /** Label for the button that jumps straight past the hero */
  skipLabel?: string
  /** Scroll gestures needed to play the whole video: desktop / phone. */
  steps?: { desktop: number; phone: number }
  /** On phones, start this far into the video (0–1), e.g. to skip frames too bright behind the title. */
  phoneStart?: number
  /** Poster for phones, matching the frame at phoneStart. */
  phonePosterSrc?: string
  className?: string
}

// Tailwind's `sm` breakpoint: narrower than this counts as a phone
const PHONE_QUERY = "(max-width: 639px)"

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

// A wheel flick is one gesture until the wheel has been quiet this long (ms)
const GESTURE_IDLE_MS = 180
// A swipe must travel this far (px) to count as a scroll
const SWIPE_MIN_PX = 16

export default function ScrollLockedVideoHero({
  videoSrc,
  posterSrc,
  title,
  tagline,
  scrollHint = "SCROLL",
  skipLabel = "SKIP",
  steps: stepCounts = { desktop: 3, phone: 2 },
  phoneStart = 0,
  phonePosterSrc,
  className = "",
}: ScrollLockedVideoHeroProps) {
  // Decided once on load (resizing a desktop window later doesn't switch it)
  const [isPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches)
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  // Set inside the effect below, where the lock lives; the Skip button calls it
  const skipRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!videoRef.current || !sectionRef.current) return
    // Typed copies: TypeScript doesn't carry the null check into the helper functions below
    const video: HTMLVideoElement = videoRef.current
    const section: HTMLDivElement = sectionRef.current

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let duration = 0
    let rafId = 0
    // Where the scrub begins: 0 on desktop, phoneStart on phones
    const start = isPhone ? clamp(phoneStart, 0, 0.95) : 0
    let targetProgress = start
    let currentProgress = start
    let started = false
    let isSeeking = false
    let pendingTime: number | null = null
    let lastSought = -1
    let locked = false
    let lockedScrollY = 0
    // The video plays in `steps` equal jumps; stopIndex is the stop we are heading for
    const steps = Math.max(1, isPhone ? stepCounts.phone : stepCounts.desktop)
    let stopIndex = 0
    let wheelGestureActive = false
    let wheelIdleTimer = 0
    let touchStartY = 0
    let touchCounted = false

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

    // Where the page content starts, just below the hero
    const contentTop = () => section.offsetTop + section.offsetHeight

    if (reduceMotion) {
      showEnd()
      skipRef.current = () => window.scrollTo({ top: contentTop() }) // no lock, so just jump
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

    // Skip: finish the reveal, release the page and scroll to the content
    skipRef.current = () => {
      targetProgress = currentProgress = 1
      started = true
      releaseLock()
      window.scrollTo({ top: contentTop(), behavior: "smooth" })
    }

    // One scroll gesture moves the video to the next (dir 1) or previous (dir -1) stop.
    // Returns true when the input was used to scrub (so the page must not move)
    function stepScrub(dir: number) {
      if (!locked) {
        // Re-engage when scrolling back up while the page is at the top
        if (dir < 0 && window.scrollY <= 1) engageLock()
        else return false
      } else if (dir > 0 && stopIndex >= steps && currentProgress > 0.98) {
        releaseLock() // at the end and still pushing forward: hand scrolling back to the page
        return false
      }
      stopIndex = clamp(stopIndex + dir, 0, steps)
      targetProgress = start + ((1 - start) * stopIndex) / steps
      if (stopIndex > 0) started = true
      return true
    }

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 1) return // sideways scroll
      // Only the first event of a flick counts; the rest of it (and a trackpad's
      // momentum) is swallowed while the page is pinned, so it can't skip a stop
      const first = !wheelGestureActive
      wheelGestureActive = true
      window.clearTimeout(wheelIdleTimer)
      wheelIdleTimer = window.setTimeout(() => (wheelGestureActive = false), GESTURE_IDLE_MS)
      if (first) {
        if (stepScrub(Math.sign(e.deltaY))) e.preventDefault()
      } else if (locked) {
        e.preventDefault()
      }
    }
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0
      touchCounted = false
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchStartY
      const travelled = touchStartY - y
      // One swipe = one step, as soon as it has moved a little
      if (!touchCounted && Math.abs(travelled) >= SWIPE_MIN_PX) {
        touchCounted = true
        if (stepScrub(Math.sign(travelled)) && e.cancelable) e.preventDefault()
      } else if (locked && e.cancelable) {
        e.preventDefault() // keep the pinned page still for the rest of the swipe
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      // Leave typing alone (the target can be window/document, which have no closest())
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]")) return
      if (e.repeat) return // holding a key shouldn't fly through the stops
      const dir =
        e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)
          ? 1
          : e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)
            ? -1
            : 0
      if (dir !== 0 && stepScrub(dir)) e.preventDefault()
    }

    if (window.scrollY <= 1) engageLock()
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("keydown", onKeyDown)

    function frame() {
      currentProgress += (targetProgress - currentProgress) * 0.18
      if (duration > 0) seekTo(currentProgress * duration)

      // How far through the scrub we are (0 at the start frame, 1 at the end)
      const p = (currentProgress - start) / (1 - start)
      video.style.transform = `scale(${1 + p * 0.06})`
      if (titleRef.current) {
        const t = 1 - clamp(p / 0.35, 0, 1)
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
      if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${p})`

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
      window.clearTimeout(wheelIdleTimer)
      releaseLock()
    }
  }, [stepCounts.desktop, stepCounts.phone, isPhone, phoneStart])

  return (
    <div ref={sectionRef} className={`relative h-dvh w-full overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        src={videoSrc}
        poster={isPhone && phonePosterSrc ? phonePosterSrc : posterSrc}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        // Always visible: the poster (the video's own start frame) shows while it loads
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

      {/* A real button, so mouse, touch and keyboard (Tab + Enter) can all skip the scrub */}
      <button
        type="button"
        onClick={() => skipRef.current()}
        className="absolute bottom-[clamp(20px,6vh,48px)] right-5 sm:right-6 md:right-10 lg:right-14 flex items-center gap-1.5 font-pixel text-base tracking-[0.2em] text-white/70 hover:text-white transition-colors text-shadow-soft"
      >
        {skipLabel}
        <ArrowDown size={14} aria-hidden="true" />
      </button>

      {/* Thin progress line that fills as the video advances */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
        <div ref={progressBarRef} className="h-full w-full origin-left scale-x-0 bg-white/85" />
      </div>
    </div>
  )
}
