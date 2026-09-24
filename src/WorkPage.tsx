import ScrollLockedVideoHero from '@/components/ui/scroll-locked-video-hero'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { HOME_URL, WORKS, type Work } from './content'

const PIXEL_WORD = 'font-pixel font-normal text-[1.25em] inline-block leading-none align-baseline'

// One piece: its image(s) and caption. A single portrait image sits beside
// its caption on wider screens instead of stretching into a very tall image.
function Piece({ work, index }: { work: Work; index: number }) {
  const portrait = work.images.length === 1 && work.images[0].height > work.images[0].width

  return (
    <article className={portrait ? 'md:grid md:grid-cols-2 md:items-end md:gap-10' : undefined}>
      <div className={work.images.length > 1 ? 'grid gap-3 sm:gap-4 md:grid-cols-2' : undefined}>
        {work.images.map((img) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={portrait ? 'h-auto w-full md:max-h-[85svh] md:w-auto md:max-w-full' : 'h-auto w-full'}
          />
        ))}
      </div>

      <div
        className={
          portrait
            ? 'mt-4 md:mt-0'
            : 'mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10'
        }
      >
        <div>
          <p className="font-pixel text-base tracking-widest text-white/50">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="text-lg md:text-xl tracking-wide uppercase">{work.title}</h3>
        </div>
        <div className="mt-2 md:mt-0 max-w-prose text-sm text-white/80 leading-relaxed">
          <p>{work.description}</p>
          <p className="mt-2 font-pixel text-base text-white/50">{work.tools}</p>
          {work.credit && <p className="mt-1 text-xs text-white/50">{work.credit}</p>}
        </div>
      </div>
    </article>
  )
}

export default function WorkPage() {
  return (
    <div className="bg-black text-white">
      {/* Scroll scrubs the donut animation, then releases into the page below */}
      <ScrollLockedVideoHero
        videoSrc={`${HOME_URL}scrub.mp4`}
        posterSrc={`${HOME_URL}images/donut-closeup.jpg`}
        title={
          <>
            Joseph <span className={PIXEL_WORD}>Adebiyi</span>
          </>
        }
        tagline={
          <>
            I build in <span className={PIXEL_WORD}>Blender</span> and run the tech behind{' '}
            <span className={PIXEL_WORD}>live</span> events
          </>
        }
      />

      <div className="min-h-svh px-5 sm:px-6 md:px-10 lg:px-14">
      <SiteHeader logoHref={HOME_URL} current="WORK" />

      <main className="pb-12">
        <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl tracking-wide uppercase font-normal leading-tight">
          {WORKS.length} pieces made in <span className={PIXEL_WORD}>Blender</span>
        </h2>

        <ol className="mt-10 md:mt-16 space-y-16 md:space-y-24">
          {WORKS.map((work, i) => (
            <li key={work.title}>
              <Piece work={work} index={i} />
            </li>
          ))}
        </ol>
      </main>

      <div className="pb-4">
        <SiteFooter />
      </div>
      </div>
    </div>
  )
}
