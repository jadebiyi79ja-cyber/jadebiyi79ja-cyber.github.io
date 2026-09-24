# Joseph Adebiyi — 3D Design & Technology

A single-screen portfolio landing page: a looping Blender render fills the
background, with the page content laid over it in white.

**Live:** https://jadebiyi79ja-cyber.github.io

Built with React 19, TypeScript, Tailwind CSS 4 and Vite 8. Deployed to
GitHub Pages by GitHub Actions.

## Run it locally

Needs [Node.js](https://nodejs.org) 20.19 or newer.

```bash
npm install      # download the libraries (first time only)
npm run dev      # live-reloading dev server at http://localhost:5173
npm run build    # type-check, then build the site into dist/
npm run preview  # serve the built dist/ folder to check it
```

## The background video

`public/hero.mp4` is built from the 160 rendered frames of my donut animation,
played as a seamless 10-second loop. It starts on the wide shot (frame 160),
pushes in, eases to a stop at frame 40, then pulls back out. It stops short of
the extreme close-up so the white text stays readable, and the eased turnaround
blends neighbouring frames so the camera never jolts.

It is H.264, 1920×1080, 24 fps, no audio, 7.9 MB, with the file's index moved to
the front so browsers can start playing before it has fully downloaded.
`public/hero-poster.jpg` is frame 160, shown while the video loads.

To use a different render, replace those two files (H.264 MP4, no audio, under
10 MB). In Blender: **Output Properties → File Format: FFmpeg Video**, Container
**MPEG-4**, Video Codec **H.264**, Audio Codec **No Audio**. If the video is
missing, the page falls back to plain black.

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the
site and publishes it. One-time setup:

1. Create a **public** GitHub repo named exactly `jadebiyi79ja-cyber.github.io`.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push this project to the repo's `main` branch.

## How it's organised

| File | What it does |
| --- | --- |
| `index.html` | The landing page's HTML shell: page title, meta description, Google Fonts, and the `#root` div React renders into |
| `work/index.html` | The Work page's HTML shell. As a real file it's served at `/work/`, so no router is needed |
| `src/main.tsx` | Landing page entry point: loads the CSS and mounts `<App />` |
| `src/work.tsx` | Work page entry point: loads the CSS and mounts `<WorkPage />` |
| `src/App.tsx` | The landing page layout: meta grid, headline, button, fact chips, over the background video |
| `src/WorkPage.tsx` | The Work page: the three pieces with their images and captions |
| `src/content.ts` | Editable content in one place: email, links, skills, facts, piece count, and the Work page pieces and captions |
| `src/components/SiteHeader.tsx` | Logo, nav and hamburger shared by both pages. The phone menu is rendered into `<body>` with a React portal |
| `src/components/SiteFooter.tsx` | The footer strip shared by both pages |
| `src/components/BackgroundVideo.tsx` | Background video. Respects "reduce motion" and falls back to black if the file is missing |
| `src/components/MobileMenu.tsx` | Full-screen phone menu with the staggered link animation, Escape to close, and focus handling |
| `src/components/Logo.tsx` | The isometric cube mark, used in the navbar and the mobile menu |
| `src/index.css` | Tailwind import, theme tokens (the `font-pixel` VT323 font and the `text-shadow-soft` shadow that keeps white text readable over the video), and base body styles |
| `vite.config.ts` | Build config: React and Tailwind plugins, `base: '/'` for a GitHub Pages user site, and the two pages to build |
| `tsconfig.json` | TypeScript settings (strict mode) |
| `.github/workflows/deploy.yml` | GitHub Actions: install, build, and publish to Pages on every push |
| `public/` | Files served as-is: favicon, the background video `hero.mp4` and its poster `hero-poster.jpg`, and the Work page images in `images/` |
