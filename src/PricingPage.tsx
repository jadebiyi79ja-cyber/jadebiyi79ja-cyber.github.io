import { ArrowUpRight } from 'lucide-react'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { FACTS, HOME_URL, QUOTE_URL, SERVICES, STEPS, WORK_URL, type PriceGroup, type Service } from './content'

// Same class lists as the other pages, so the pages match
const PIXEL_WORD = 'font-pixel font-normal text-[1.25em] inline-block leading-none align-baseline'
const LABEL = 'text-base tracking-widest text-white/50 uppercase mb-3 font-pixel'
const LINK = 'inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity'
const TITLE =
  'text-3xl sm:text-4xl md:text-5xl tracking-wide uppercase font-normal leading-tight'

// A titled list of prices: one row per option, label left, price right in the pixel font
function PriceList({ group }: { group: PriceGroup }) {
  return (
    <div className="mt-6">
      <h4 className={`${LABEL} mb-1`}>{group.title}</h4>
      {group.note && <p className="mb-2 text-xs text-white/60">{group.note}</p>}
      <ul className="border-b border-white/30">
        {group.rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between gap-4 border-t border-white/30 py-3"
          >
            <span className="text-sm text-white/90">{row.label}</span>
            <span className="font-pixel text-2xl uppercase">{row.price}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// One service: number, title, price and timing on the left; what it is and what's in it on the right
function ServiceRow({ service, index }: { service: Service; index: number }) {
  return (
    <article className="border-t border-white/30 pt-6 md:pt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
      <div>
        <p className="font-pixel text-base tracking-widest text-white/50">
          {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="text-lg md:text-xl tracking-wide uppercase">{service.title}</h3>
        <p className="mt-3 font-pixel text-2xl md:text-3xl uppercase">{service.price}</p>
        {service.priceNote && (
          <p className="mt-1 font-pixel text-base text-white/50">{service.priceNote}</p>
        )}
        {service.turnaround && (
          <p className="mt-1 font-pixel text-base text-white/50">{service.turnaround}</p>
        )}
      </div>

      <div className="max-w-prose text-sm text-white/80 leading-relaxed">
        <p>{service.description}</p>

        {service.priceGroups?.map((group) => (
          <PriceList key={group.title} group={group} />
        ))}

        <h4 className={`${LABEL} mt-6`}>Includes</h4>
        <ul className="text-white/90 space-y-0.5">
          {service.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <p className="mt-4 font-pixel text-base text-white/50">{service.tools}</p>
        {service.example && (
          <p className="mt-3">
            <a href={service.example.href} className={LINK}>
              {service.example.label} <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </p>
        )}
      </div>
    </article>
  )
}

export default function PricingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-black text-white px-5 sm:px-6 md:px-10 lg:px-14">
      <SiteHeader logoHref={HOME_URL} current="PRICING" />

      <main className="flex-1 pb-12">
        <h1 className={`mt-4 max-w-4xl ${TITLE}`}>
          Simple prices for{' '}
          <span className="whitespace-nowrap">
            <span className={PIXEL_WORD}>3D</span>,
          </span>{' '}
          animation and{' '}
          <span className={PIXEL_WORD}>websites</span>
        </h1>

        <div className="mt-10 md:mt-16 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <p className="max-w-prose text-base md:text-lg text-white/85 leading-relaxed">
              I&apos;m a Year 13 student, so my prices start low and projects fit around school. Websites
              have set prices, listed below. For 3D work the prices are starting points:
              tell me what you need and I&apos;ll send a fixed quote.
            </p>

            <ul className="mt-8 flex flex-wrap items-stretch gap-2 sm:gap-3 text-sm text-white/80">
              {FACTS.map((fact) => (
                <li
                  key={fact.title}
                  className="bg-[#0B0B0B] px-3 sm:px-4 py-2 flex items-center gap-2"
                >
                  <span className="font-bold text-sm sm:text-base tracking-tight">{fact.title}</span>
                  <span className="text-white/50 text-xs">{fact.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:justify-self-end">
            <a
              href={QUOTE_URL}
              className="inline-flex items-center gap-3 border border-white/30 px-6 py-3 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowUpRight size={14} aria-hidden="true" />
              <span className="text-sm tracking-wider">GET A QUOTE</span>
            </a>
          </div>
        </div>

        <ol className="mt-16 md:mt-24 space-y-12 md:space-y-16">
          {SERVICES.map((service, i) => (
            <li key={service.title}>
              <ServiceRow service={service} index={i} />
            </li>
          ))}
        </ol>

        <section aria-labelledby="how" className="mt-16 md:mt-24">
          <h2 id="how" className={LABEL}>
            How it works
          </h2>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <p className="font-pixel text-base tracking-widest text-white/50">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="text-lg md:text-xl tracking-wide uppercase">{step.title}</h3>
                <p className="mt-2 max-w-[260px] text-sm text-white/90 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="start" className="mt-16 md:mt-24 border-t border-white/30 pt-8">
          <h2 id="start" className={TITLE}>
            Got a <span className={PIXEL_WORD}>project</span>?
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <a
              href={QUOTE_URL}
              className="inline-flex items-center gap-3 border border-white/30 px-6 py-3 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowUpRight size={14} aria-hidden="true" />
              <span className="text-sm tracking-wider">GET A QUOTE</span>
            </a>
            <a href={WORK_URL} className={LINK}>
              See my work <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <div className="pb-4">
        <SiteFooter />
      </div>
    </div>
  )
}
