import { ArrowUpRight } from 'lucide-react'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { ABOUT, EMAIL, FACTS, HOME_URL, LINKEDIN_URL, SKILLS, WORK_URL } from './content'

// Same class lists as the landing page, so the pages match
const PIXEL_WORD = 'font-pixel font-normal text-[1.25em] inline-block leading-none align-baseline'
const LABEL = 'text-base tracking-widest text-white/50 uppercase mb-3 font-pixel'
const LINK = 'inline-flex items-center gap-2 hover:opacity-70 transition-opacity'

export default function AboutPage() {
  return (
    <div className="flex min-h-svh flex-col bg-black text-white px-5 sm:px-6 md:px-10 lg:px-14">
      <SiteHeader logoHref={HOME_URL} current="ABOUT" />

      <main className="flex-1 pb-12">
        <h1 className="mt-4 max-w-4xl text-3xl sm:text-4xl md:text-5xl tracking-wide uppercase font-normal leading-tight">
          Self-taught in <span className={PIXEL_WORD}>Blender</span>, behind the tech at{' '}
          <span className={PIXEL_WORD}>live</span> events
        </h1>

        <div className="mt-10 md:mt-16 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <section aria-labelledby="about-me">
            <h2 id="about-me" className={LABEL}>
              About me
            </h2>
            <div className="max-w-prose space-y-4 text-base md:text-lg text-white/85 leading-relaxed">
              {ABOUT.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <ul className="mt-8 flex flex-wrap items-stretch gap-2 sm:gap-3 text-sm text-white/80">
              {FACTS.map((fact) => (
                <li key={fact.title} className="bg-[#0B0B0B] px-3 sm:px-4 py-2 flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base tracking-tight">{fact.title}</span>
                  <span className="text-white/50 text-xs">{fact.detail}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid content-start gap-10 sm:grid-cols-2 lg:grid-cols-1">
            <section aria-labelledby="skills">
              <h2 id="skills" className={LABEL}>
                Skills
              </h2>
              <ul className="text-sm text-white/90 leading-relaxed space-y-0.5">
                {SKILLS.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="now">
              <h2 id="now" className={LABEL}>
                Right now
              </h2>
              <p className="text-sm text-white/90 leading-relaxed max-w-[260px]">{ABOUT.now}</p>
            </section>

            <section aria-labelledby="contact">
              <h2 id="contact" className={LABEL}>
                Contact
              </h2>
              <ul className="text-sm text-white/90 leading-relaxed space-y-1">
                <li>
                  <a href={`mailto:${EMAIL}`} className={LINK}>
                    {EMAIL}
                  </a>
                </li>
                <li>
                  <a href={LINKEDIN_URL} target="_blank" rel="noopener" className={LINK}>
                    LinkedIn <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href={WORK_URL} className={LINK}>
                    See my work <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <div className="pb-4">
        <SiteFooter />
      </div>
    </div>
  )
}
