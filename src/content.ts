// Everything likely to change lives here, so updates don't mean
// digging through the layout code.

export const EMAIL = 'jadebiyi79.ja@gmail.com'
export const PIECE_COUNT = 3

// Site paths. BASE_URL is Vite's `base` ("/" here), so these survive a move to a sub-folder.
export const HOME_URL = import.meta.env.BASE_URL
// WORK (nav) and VIEW MY WORK (button) both open the Work page
export const WORK_URL = `${HOME_URL}work/`

export type NavLink = {
  label: string
  href: string
  newTab?: boolean
}

export const NAV_LINKS: NavLink[] = [
  { label: 'WORK', href: WORK_URL },
  { label: 'ABOUT', href: '#' },
  {
    label: 'LINKEDIN',
    href: 'https://www.linkedin.com/in/joseph-adebiyi-a55baa362',
    newTab: true,
  },
  { label: 'CONTACT', href: `mailto:${EMAIL}` },
]

export const SKILLS = [
  'Blender 3D modelling',
  'Camera operation & livestreaming',
  'Stage lighting',
  'Presentation software',
  'Team leadership',
  'Customer service',
]

// The three dark chips under the VIEW MY WORK button
export const FACTS = [
  { title: 'BLENDER', detail: 'self-taught' },
  { title: 'LIVE TECH', detail: 'since 2024' },
  { title: 'TEAM LEADER', detail: 'Subway' },
]

export type WorkImage = { src: string; alt: string; width: number; height: number }

export type Work = {
  title: string
  description: string
  tools: string
  credit?: string
  images: WorkImage[]
}

const image = (file: string) => `${HOME_URL}images/${file}`

// The pieces on the Work page, in order. Captions are drafts: edit freely.
export const WORKS: Work[] = [
  {
    title: 'Donut shop',
    description:
      'An isometric donut shop at dusk, with iced, sprinkled donuts on the roof. Built by reworking my coffee shop model.',
    tools: 'Blender · Cycles · 2025',
    images: [
      {
        src: image('donut-shop.jpg'),
        alt: 'Isometric 3D render of a small donut shop at dusk, with two iced donuts on the roof, a DONUTS sign, glowing windows, a street lamp and a fence',
        width: 1920,
        height: 1080,
      },
    ],
  },
  {
    title: 'Coffee shop',
    description: 'An isometric coffee shop with a giant cup of coffee on the roof, lit for dusk.',
    tools: 'Blender · Cycles · 2025',
    images: [
      {
        src: image('coffee-shop.jpg'),
        alt: 'Isometric 3D render of a small coffee shop at dusk, with a giant lavender coffee cup on the roof, a COFFEE sign, glowing windows, a street lamp and a fence',
        width: 1080,
        height: 1350,
      },
    ],
  },
  {
    title: 'Donut scene',
    description:
      'Stills from a 160-frame camera move over a plate of iced donuts. The animation plays behind the home page and at the top of this page.',
    tools: 'Blender · Cycles · 2025',
    credit: "Made following Blender Guru's donut tutorial. Plant and utensil jar models from Poliigon.",
    images: [
      {
        src: `${HOME_URL}hero-poster.jpg`,
        alt: 'Photoreal 3D render of stacked iced donuts with sprinkles on a plate in warm sunlight, with a plant and a jar of wooden utensils behind',
        width: 1920,
        height: 1080,
      },
      {
        src: image('donut-closeup.jpg'),
        alt: 'Close-up 3D render looking down on iced donuts covered in colourful sprinkles',
        width: 1920,
        height: 1080,
      },
    ],
  },
]
