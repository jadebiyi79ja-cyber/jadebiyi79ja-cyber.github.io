/*
 * Cube intro: the logo cube flies from the header to the middle of the screen, grows until it
 * fills most of the page and spins fast (tumbling, with motion trails) while the page loads,
 * then spins down, flies back and shrinks to land exactly on the header logo.
 *
 * Everything is a pure function of time (ms since start) and the time the page finished loading
 * (loadedAt, or null while loading), so it can be stepped frame by frame for a preview video.
 */
(function (root) {
  var TAU = Math.PI * 2
  var TILT = Math.atan(1 / Math.SQRT2) // 35.264 degrees: the isometric elevation
  var REST_YAW = -Math.PI / 4 // the yaw that matches the logo (and every 90 degrees from it)

  var TIMING = {
    fly: 900, // header -> centre, growing
    rampSpin: 650, // spin speed ramps up over this long
    minShow: 1600, // always show the loading cube for at least this long
    settle: 1300, // spin down + fly back + shrink
    fade: 380, // overlay fades out once the cube has landed
    turnMs: 480, // one full turn takes this long at full speed
    fill: 0.84, // at the centre the cube is this fraction of the screen height (or of its width, on narrow screens)
    tumbleP: 0.62, // tumble: pitch swing (radians) and how long one swing takes
    tumbleR: 0.44,
    pitchMs: 760,
    rollMs: 1130,
    ghosts: 6, // motion-trail copies
    ghostMs: 18, // time between trail copies
    ghostAlpha: 0.26,
  }

  var clamp01 = function (x) { return Math.min(1, Math.max(0, x)) }
  var ease = function (x) {
    x = clamp01(x)
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
  }
  var smooth = function (x) {
    x = clamp01(x)
    return x * x * (3 - 2 * x)
  }

  // ----- geometry: a unit cube (half-edge 1), orthographic isometric view -----
  var VERTS = []
  for (var i = 0; i < 8; i++) VERTS.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1])
  var FACES = [
    { n: [0, 1, 0], v: [2, 3, 7, 6] },
    { n: [0, -1, 0], v: [0, 1, 5, 4] },
    { n: [1, 0, 0], v: [1, 3, 7, 5] },
    { n: [-1, 0, 0], v: [0, 2, 6, 4] },
    { n: [0, 0, 1], v: [4, 5, 7, 6] },
    { n: [0, 0, -1], v: [0, 1, 3, 2] },
  ]

  // orientation: roll (about z), then pitch (about x), then yaw (about y), then the fixed isometric tilt
  function rot(p, yaw, pitch, roll) {
    var x = p[0], y = p[1], z = p[2], c, s, t
    if (roll) { c = Math.cos(roll); s = Math.sin(roll); t = x * c - y * s; y = x * s + y * c; x = t }
    if (pitch) { c = Math.cos(pitch); s = Math.sin(pitch); t = y * c - z * s; z = y * s + z * c; y = t }
    c = Math.cos(yaw); s = Math.sin(yaw)
    var x1 = x * c + z * s, z1 = -x * s + z * c, y1 = y
    var ct = Math.cos(TILT), st = Math.sin(TILT)
    return [x1, y1 * ct - z1 * st, y1 * st + z1 * ct] // x, y (up), z (towards viewer)
  }

  // Shading: brightness = n . L, with L solved so the three faces seen at rest get the logo's own
  // opacities (top 1, left 0.7, right 0.45). Faces turned away from that light get dimmer.
  var LIGHT = (function () {
    var seen = FACES.map(function (f) {
      var n = rot(f.n, REST_YAW)
      var cx = 0
      f.v.forEach(function (vi) { cx += rot(VERTS[vi], REST_YAW)[0] })
      return { n: n, cx: cx / 4 }
    }).filter(function (f) { return f.n[2] > 0.01 })
    var top = seen.filter(function (f) { return f.n[1] > 0.5 })[0]
    var sides = seen.filter(function (f) { return f !== top }).sort(function (a, b) { return a.cx - b.cx })
    var rows = [top.n, sides[0].n, sides[1].n], o = [1, 0.7, 0.45]
    var det = function (m) {
      return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    }
    var d = det(rows), L = []
    for (var k = 0; k < 3; k++) {
      var m = rows.map(function (r, ri) { var c = r.slice(); c[k] = o[ri]; return c })
      L.push(det(m) / d)
    }
    return L
  })()

  // Draw the cube centred at (cx, cy); `size` is the logo box size in px (hexagon radius = size * 112 / 256).
  // ghostAlpha == null: solid faces (opaque greys on the black overlay, edges overdrawn so no seams show);
  // a number: translucent white, used for the motion trail.
  function drawCube(ctx, cx, cy, size, yaw, pitch, roll, ghostAlpha) {
    var R = (size * 112) / 256
    var scale = R / Math.sqrt(8 / 3) // hexagon circumradius of a half-edge-1 cube is sqrt(8/3)
    var pts = VERTS.map(function (p) { return rot(p, yaw, pitch, roll) })
    var solid = ghostAlpha == null
    ctx.lineJoin = 'round'
    ctx.lineWidth = Math.max(0.25, size * 0.0012)
    FACES.forEach(function (f) {
      var n = rot(f.n, yaw, pitch, roll)
      if (n[2] <= 0.0001) return
      var o = Math.min(1, Math.max(0.16, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]))
      ctx.beginPath()
      f.v.forEach(function (vi, idx) {
        var p = pts[vi], x = cx + p[0] * scale, y = cy - p[1] * scale
        idx ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      })
      ctx.closePath()
      if (solid) {
        var g = Math.round(o * 255), col = 'rgb(' + g + ',' + g + ',' + g + ')'
        ctx.fillStyle = col; ctx.strokeStyle = col
        ctx.fill(); ctx.stroke()
      } else {
        ctx.globalAlpha = o * ghostAlpha
        ctx.fillStyle = '#fff'
        ctx.fill()
      }
    })
    ctx.globalAlpha = 1
  }

  // ----- timeline -----
  var OMEGA = TAU / TIMING.turnMs // full spin speed, rad/ms
  function yawBefore(t) {
    // integral of OMEGA * smooth(t / rampSpin), in 4 ms steps
    var steps = Math.max(1, Math.ceil(t / 4)), dt = t / steps, a = 0
    for (var i = 0; i < steps; i++) a += OMEGA * smooth((i * dt + dt / 2) / TIMING.rampSpin) * dt
    return REST_YAW + a
  }

  // state at time t. from = {x, y, size} (the header logo's centre and size); centre = {x, y, size} (where it grows to).
  // loadedAt = ms when the page finished loading (null/undefined while still loading).
  function stateAt(t, from, centre, loadedAt) {
    var settleStart = Math.max(TIMING.minShow, loadedAt == null ? Infinity : loadedAt)
    var s = { x: from.x, y: from.y, size: from.size, yaw: REST_YAW, pitch: 0, roll: 0, done: false, fade: 0 }
    var wob = function (env) {
      s.pitch = TIMING.tumbleP * env * Math.sin((TAU * t) / TIMING.pitchMs)
      s.roll = TIMING.tumbleR * env * Math.sin((TAU * t) / TIMING.rollMs + 1.3)
    }
    if (t <= settleStart) {
      var out = ease(t / TIMING.fly)
      s.x = from.x + (centre.x - from.x) * out
      s.y = from.y + (centre.y - from.y) * out
      s.size = from.size + (centre.size - from.size) * out
      s.yaw = yawBefore(t)
      wob(smooth(t / TIMING.rampSpin))
      return s
    }
    var u = (t - settleStart) / TIMING.settle, uu = Math.min(1, u)
    var yawS = yawBefore(settleStart)
    var m0 = OMEGA * smooth(settleStart / TIMING.rampSpin) * TIMING.settle // initial speed, as a distance
    var target = REST_YAW + Math.ceil((yawS - REST_YAW + m0 / 3) / TAU) * TAU
    if (target - yawS < m0 / 3) target += TAU
    var h10 = uu * uu * uu - 2 * uu * uu + uu, h01 = -2 * uu * uu * uu + 3 * uu * uu
    s.yaw = yawS + h10 * m0 + h01 * (target - yawS)
    var k = ease(1 - uu) * ease(Math.min(settleStart, TIMING.fly) / TIMING.fly) // 1 at the centre, 0 back at the logo
    s.x = from.x + (centre.x - from.x) * k
    s.y = from.y + (centre.y - from.y) * k
    s.size = from.size + (centre.size - from.size) * k
    wob(1 - smooth(uu))
    if (u >= 1) {
      s.yaw = target; s.pitch = 0; s.roll = 0
      s.fade = Math.min(1, (t - settleStart - TIMING.settle) / TIMING.fade)
      s.done = s.fade >= 1
    }
    return s
  }

  // Size of the cube at the centre of a screen of the given size, in logo-box px.
  function centreSize(w, h) {
    var hexH = Math.min(h * TIMING.fill, (w * TIMING.fill) / 0.866) // hexagon height: 224 of the 256 logo box
    return (hexH * 256) / 224
  }

  // Draws one frame (clearing the canvas first) and returns the state. w, h = canvas size in CSS px.
  function renderFrame(ctx, t, from, w, h, loadedAt) {
    var centre = { x: w / 2, y: h / 2, size: centreSize(w, h) }
    var s = stateAt(t, from, centre, loadedAt)
    ctx.clearRect(0, 0, w, h)
    var prev = stateAt(Math.max(0, t - TIMING.ghostMs), from, centre, loadedAt)
    var speed = clamp01((s.yaw - prev.yaw) / (OMEGA * TIMING.ghostMs)) // 0 at rest, 1 at full spin
    if (speed > 0.02) {
      for (var i = TIMING.ghosts; i >= 1; i--) {
        var gt = t - i * TIMING.ghostMs
        if (gt < 0) continue
        var g = stateAt(gt, from, centre, loadedAt)
        var a = TIMING.ghostAlpha * speed * (1 - (i - 1) / TIMING.ghosts)
        drawCube(ctx, g.x, g.y, g.size, g.yaw, g.pitch, g.roll, a)
      }
    }
    drawCube(ctx, s.x, s.y, s.size, s.yaw, s.pitch, s.roll, null)
    return s
  }

  root.CubeIntro = { TIMING: TIMING, REST_YAW: REST_YAW, drawCube: drawCube, stateAt: stateAt, renderFrame: renderFrame, centreSize: centreSize }
})(typeof window !== 'undefined' ? window : this)

/*
 * Runtime: plays the intro on every page load. Loaded synchronously in <head> so the black
 * overlay is up before the first paint. If anything goes wrong the overlay is removed.
 */
;(function () {
  var CI = window.CubeIntro
  if (!CI || window.__cubeIntroStarted) return
  window.__cubeIntroStarted = true
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return

  var MAX_WAIT = 10000 // never hold the page longer than this
  var LOGO = '[aria-label="Joseph Adebiyi"]'
  var doc = document.documentElement
  var t0 = performance.now()

  var style = document.createElement('style')
  style.textContent =
    'html.ci-lock{overflow:hidden}' +
    'html.ci-hide ' + LOGO + '{visibility:hidden}' +
    '#cube-intro{position:fixed;inset:0;z-index:2147483000;background:#000}' +
    '#cube-intro canvas{position:absolute;inset:0;width:100%;height:100%;display:block}'
  var overlay = document.createElement('div')
  overlay.id = 'cube-intro'
  overlay.setAttribute('aria-hidden', 'true')
  var canvas = document.createElement('canvas')
  overlay.appendChild(canvas)
  ;(document.head || doc).appendChild(style)
  doc.appendChild(overlay)
  doc.classList.add('ci-lock', 'ci-hide')

  var ctx = canvas.getContext('2d'), raf = 0, finished = false
  var loaded = false, loadedAt = null, frozen = false, hideCleared = false

  function gutter() {
    var w = window.innerWidth
    return w >= 1024 ? 56 : w >= 768 ? 40 : w >= 640 ? 24 : 20
  }
  // Where the logo sits on every page: left gutter, 24px below the top, 28px square.
  var from = { x: gutter() + 14, y: 38, size: 28 }
  function readLogo() {
    var el = document.querySelector('header ' + LOGO)
    if (!el) return
    var r = el.getBoundingClientRect()
    if (r.width > 0 && r.top >= -1 && r.bottom <= window.innerHeight + 1) from = { x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width }
    else from = { x: gutter() + 14, y: 38, size: 28 }
  }

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  size()
  window.addEventListener('resize', size)

  function cleanup() {
    finished = true
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', size)
    overlay.remove()
    style.remove()
    doc.classList.remove('ci-lock', 'ci-hide')
  }

  function checkReady() {
    if (loaded) return
    var root = document.getElementById('root')
    var mounted = !root || root.childElementCount > 0
    if (document.readyState === 'complete' && mounted) {
      loaded = true
      var fontsDone = function () { if (loadedAt == null) loadedAt = performance.now() - t0 }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fontsDone, fontsDone)
      else fontsDone()
    }
  }

  function frame(now) {
    if (finished) return
    try {
      var t = now - t0
      checkReady()
      if (loadedAt == null && t > MAX_WAIT) loadedAt = t
      var settleAt = loadedAt == null ? Infinity : Math.max(CI.TIMING.minShow, loadedAt)
      if (!frozen) {
        if (t > CI.TIMING.fly + 50) readLogo()
        if (t >= settleAt) frozen = true // from here the return path is fixed
      }
      var s = CI.renderFrame(ctx, t, from, window.innerWidth, window.innerHeight, loadedAt)
      if (s.fade > 0) {
        if (!hideCleared) { hideCleared = true; doc.classList.remove('ci-hide', 'ci-lock') } // real logo shows beneath the fading overlay
        overlay.style.opacity = String(1 - s.fade)
        overlay.style.pointerEvents = 'none'
      }
      if (s.done) return cleanup()
      raf = requestAnimationFrame(frame)
    } catch (e) {
      cleanup()
    }
  }
  try { frame(t0); } catch (e) { cleanup() }
  if (!finished) raf = requestAnimationFrame(frame)
})()
