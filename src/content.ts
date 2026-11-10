// Everything likely to change lives here, so updates don't mean
// digging through the layout code.

export const EMAIL = 'jadebiyi79.ja@gmail.com'
export const PIECE_COUNT = 3

// Site paths. BASE_URL is Vite's `base` ("/" here), so these survive a move to a sub-folder.
export const HOME_URL = import.meta.env.BASE_URL
// WORK (nav) and VIEW MY WORK (button) both open the Work page
export const WORK_URL = `${HOME_URL}work/`
export const ABOUT_URL = `${HOME_URL}about/`
export const DESIGN_URL = `${HOME_URL}design/`
export const PRICING_URL = `${HOME_URL}pricing/`
export const LINKEDIN_URL = 'https://www.linkedin.com/in/joseph-adebiyi-a55baa362'

export type NavLink = {
  label: string
  href: string
  newTab?: boolean
}

export const NAV_LINKS: NavLink[] = [
  { label: 'WORK', href: WORK_URL },
  { label: 'ABOUT', href: ABOUT_URL },
  { label: 'DESIGN', href: DESIGN_URL },
  { label: 'PRICING', href: PRICING_URL },
  { label: 'LINKEDIN', href: LINKEDIN_URL, newTab: true },
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

// About page. Only facts Joseph has given; edit freely.
export const ABOUT = {
  intro: [
    "I'm Joseph Adebiyi, a Year 13 student in Gravesend, Kent.",
    'I taught myself Blender from online tutorials, building everything from a photoreal plate of donuts to a pair of isometric shops.',
    "Since January 2024 I've volunteered on the tech side of live events: running cameras, the livestream and the lighting.",
    "Alongside school I'm a team leader at Subway.",
  ],
  now: 'Applying for technology degree apprenticeships starting in 2027.',
}

export type WorkImage ={ src: string; alt: string; width: number; height: number }

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

export type PriceRow = { label: string; price: string }
export type PriceGroup = { title: string; note?: string; rows: PriceRow[] }

export type Service = {
  title: string
  description: string
  price: string // shown in the pixel font, e.g. "From £60"
  priceNote?: string // one short line under the price
  turnaround?: string
  priceGroups?: PriceGroup[] // a priced breakdown, for services that have one
  includes: string[]
  tools: string
  example?: { label: string; href: string }
}

// The Pricing page. The website prices (design references and website creation) are
// the owner's own figures. DRAFT: the 3D render, 3D animation and live-event prices,
// the turnaround times and the include-lists are placeholders written to be edited.
// Replace them with your own before this goes live.
export const SERVICES: Service[] = [
  {
    title: 'Websites',
    description:
      'I build your website from design references you choose. The references are bought online: pick a pack or a 3-month subscription, then I create the site from them. This portfolio is the example: a landing page, a Work page, an About page and a Design page with two WebGL scenes.',
    price: '£20 a month',
    priceNote: 'Website creation',
    priceGroups: [
      {
        title: 'Choose your design references',
        note: 'I buy these online for your site. Pick a pack, or a 3-month subscription. Pack prices are in US dollars.',
        rows: [
          { label: '2 references', price: '$49' },
          { label: '5 references', price: '$99' },
          { label: '10 references', price: '$149' },
          { label: '3-month subscription', price: '£120' },
        ],
      },
      {
        title: 'I build your website',
        note: 'Created from the references you chose.',
        rows: [{ label: 'Website creation', price: '£20 a month' }],
      },
    ],
    includes: [
      'Layouts for phones and desktops',
      'One set of design rules across every page',
      'Keyboard use and reduced-motion settings respected',
      'Published for you on GitHub Pages',
    ],
    tools: 'React · TypeScript · Tailwind · AI-assisted',
    example: { label: 'This site', href: HOME_URL },
  },
  {
    title: '3D renders',
    description:
      'A still image of a scene or product, modelled in Blender and rendered in Cycles. I have built an isometric donut shop and coffee shop at dusk, and a photoreal plate of iced donuts.',
    price: 'From £60',
    turnaround: 'Usually about 1 week',
    includes: [
      'Modelling, lighting and camera',
      'Rendered at 1920 x 1080 (Full HD)',
      'Delivered as a JPG or PNG',
    ],
    tools: 'Blender · Cycles',
    example: { label: 'See the renders', href: WORK_URL },
  },
  {
    title: '3D animation',
    description:
      'A short camera move or seamless loop, rendered frame by frame. My donut scene is 160 frames: a push-in that eases to a stop and pulls back out, looped as a website background.',
    price: 'From £120',
    turnaround: 'Usually 1 to 2 weeks',
    includes: [
      'Camera move planned with you',
      'Rendered at 24 fps as an H.264 MP4',
      'Seamless loop for websites on request',
    ],
    tools: 'Blender · Cycles · MP4',
    example: { label: 'See the animation', href: WORK_URL },
  },
  {
    title: 'Live event tech',
    description:
      'Cameras, livestream, stage lighting and presentation screens. I have run these for services with audiences of several hundred people since January 2024, and I fix problems while the event keeps running.',
    price: 'Quote on request',
    turnaround: 'Around school and my volunteer team',
    includes: ['Camera operation and livestream', 'Stage lighting', 'Screens and presentation software'],
    tools: 'Live events · since 2024',
  },
]

export const QUOTE_URL = `mailto:${EMAIL}?subject=${encodeURIComponent('Quote request')}`

export const STEPS = [
  { title: 'Tell me', text: 'Email me what you want made, what it is for, and when you need it.' },
  { title: 'I quote', text: 'For 3D and live work I send a fixed price based on the starting prices above. Websites use the prices listed.' },
  { title: 'I make it', text: 'I share progress, you review it, and I fix what is wrong before I hand it over.' },
]
