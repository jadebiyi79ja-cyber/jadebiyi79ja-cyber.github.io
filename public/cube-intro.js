/*
 * Cube intro: the logo cube flies from the header to the centre of the screen, grows and spins
 * while the page loads, then spins down, flies back and shrinks to land exactly on the header logo.
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
    rampSpin: 1100, // spin speed ramps up over this long
    minShow: 2000, // always show the loading cube for at least this long
    settle: 1100, // spin down + fly back + shrink
    fade: 380, // overlay fades out once the cube has landed
    turnMs: 1050, // one full turn takes this long at full speed
    bigScale: 2, // size at the centre, relative to the logo
  }

  var ease = function (x) {
    x = Math.min(1, Math.max(0, x))
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
  }
  var smooth = function (x) {
    x = Math.min(1, Math.max(0, x))
    return x * x * (3 - 2 * x)
  }

  // ----- geometry: a unit cube (half-edge 1), orthographic isometric view -----
  var VERTS = []
  for (var i = 0; i < 8; i++) VERTS.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1])
  // faces as vertex indices, with outward normals
  var FACES = [
    { n: [0, 1, 0], v: [2, 3, 7, 6] },
    { n: [0, -1, 0], v: [0, 1, 5, 4] },
    { n: [1, 0, 0], v: [1, 3, 7, 5] },
    { n: [-1, 0, 0], v: [0, 2, 6, 4] },
    { n: [0, 0, 1], v: [4, 5, 7, 6] },
    { n: [0, 0, -1], v: [0, 1, 3, 2] },
  ]

  function rot(p, yaw) {
    var c = Math.cos(yaw), s = Math.sin(yaw)
    var x1 = p[0] * c + p[2] * s, z1 = -p[0] * s + p[2] * c, y1 = p[1]
    var ct = Math.cos(TILT), st = Math.sin(TILT)
    return [x1, y1 * ct - z1 * st, y1 * st + z1 * ct] // x, y (up), z (towards viewer)
  }

  // Shading: opacity = n . L, with L solved so the three faces seen at rest get the logo's own
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
    // solve rows * L = o (3x3, Cramer)
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
  function drawCube(ctx, cx, cy, size, yaw) {
    var R = (size * 112) / 256
    var scale = R / Math.sqrt(8 / 3) // hexagon circumradius of a half-edge-1 cube is sqrt(8/3)
    var pts = VERTS.map(function (p) { return rot(p, yaw) })
    FACES.forEach(function (f) {
      var n = rot(f.n, yaw)
      if (n[2] <= 0.0001) return
      var o = Math.min(1, Math.max(0.16, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]))
      ctx.beginPath()
      f.v.forEach(function (vi, idx) {
        var p = pts[vi], x = cx + p[0] * scale, y = cy - p[1] * scale
        idx ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      })
      ctx.closePath()
      ctx.globalAlpha = o
      ctx.fillStyle = '#fff'
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  // ----- timeline -----
  // spin speed (rad/ms) before the settle: ramps up, then constant
  var OMEGA = TAU / TIMING.turnMs
  function yawBefore(t) {
    // integral of OMEGA * smooth(t / rampSpin)
    var steps = Math.max(1, Math.round(t)), dt = t / steps, a = 0
    for (var i = 0; i < steps; i++) a += OMEGA * smooth((i * dt + dt / 2) / TIMING.rampSpin) * dt
    return REST_YAW + a
  }

  // state at time t. `from` = {x, y, size} (the header logo's centre and size), `centre` = {x, y}.
  // loadedAt = ms when the page finished loading (null/undefined while still loading).
  function stateAt(t, from, centre, loadedAt) {
    var settleStart = Math.max(TIMING.minShow, loadedAt == null ? Infinity : loadedAt)
    var big = from.size * TIMING.bigScale
    var s = { x: from.x, y: from.y, size: from.size, yaw: REST_YAW, done: false, fade: 0 }
    var tt = Math.min(t, settleStart)
    var out = ease(tt / TIMING.fly)
    if (t <= settleStart) {
      s.x = from.x + (centre.x - from.x) * out
      s.y = from.y + (centre.y - from.y) * out
      s.size = from.size + (big - from.size) * out
      s.yaw = yawBefore(t)
      return s
    }
    var u = (t - settleStart) / TIMING.settle
    var yawS = yawBefore(settleStart)
    var m0 = OMEGA * smooth(settleStart / TIMING.rampSpin) * TIMING.settle // initial speed, as a distance
    var target = REST_YAW + Math.ceil((yawS - REST_YAW + m0 / 3) / TAU) * TAU
    if (target - yawS < m0 / 3) target += TAU
    var uu = Math.min(1, u), h10 = uu * uu * uu - 2 * uu * uu + uu, h01 = -2 * uu * uu * uu + 3 * uu * uu
    s.yaw = yawS + h10 * m0 + h01 * (target - yawS)
    var back = ease(1 - uu)
    var endOut = ease(Math.min(settleStart, TIMING.fly) / TIMING.fly) // where the cube was when the settle began
    var k = back * endOut
    s.x = from.x + (centre.x - from.x) * k
    s.y = from.y + (centre.y - from.y) * k
    s.size = from.size + (big - from.size) * k
    if (u >= 1) {
      s.yaw = target
      s.fade = Math.min(1, (t - settleStart - TIMING.settle) / TIMING.fade)
      s.done = s.fade >= 1
    }
    return s
  }

  root.CubeIntro = { TIMING: TIMING, REST_YAW: REST_YAW, drawCube: drawCube, stateAt: stateAt }
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

  CI.TIMING.minShow = 1600 // keep the loading cube up for at least this long
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
  // Where the logo sits on every page: left gutter, 28px square, in a 24px-padded header that is
  // 40px tall on phones (hamburger) and 28px tall from the md breakpoint up.
  function home() { return { x: gutter() + 14, y: window.innerWidth >= 768 ? 38 : 44, size: 28 } }
  var from = home()
  function readLogo() {
    var el = document.querySelector('header ' + LOGO)
    if (!el) return
    var r = el.getBoundingClientRect()
    if (r.width > 0 && r.top >= -1 && r.bottom <= window.innerHeight + 1) from = { x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width }
    else from = home()
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
      var s = CI.stateAt(t, from, { x: window.innerWidth / 2, y: window.innerHeight / 2 }, loadedAt)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      CI.drawCube(ctx, s.x, s.y, s.size, s.yaw)
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
  frame(t0) // first frame now (it schedules the rest), so the overlay never shows an empty cube-less frame
})()
