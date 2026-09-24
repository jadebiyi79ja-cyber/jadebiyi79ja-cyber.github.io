import { ArrowUpRight } from 'lucide-react'
import BackgroundVideo from './components/BackgroundVideo'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { FACTS, SKILLS, WORK_URL } from './content'

// Class lists the design repeats, kept in one place so the copies can't drift apart
const COLUMN_TITLE = 'text-lg md:text-xl tracking-wide leading-tight'
const PIXEL_LINE = 'block font-pixel text-2xl md:text-3xl'
const LABEL = 'text-base tracking-widest text-white/50 uppercase mb-3 font-pixel'
const PIXEL_WORD = 'font-pixel font-normal text-[1.25em] inline-block leading-none align-baseline'

export default function App() {
  return (
    // At least one screen tall (svh = the visible height, even with phone browser
    // toolbars showing). Where the content fits, it's one locked screen; where it
    // doesn't (phones, short laptop windows), the page grows and scrolls instead of
    // cutting the footer off.
    <div className="relative flex min-h-svh w-full flex-col overflow-hidden bg-black text-white">
      <BackgroundVideo />

      {/* All UI sits above the video; flex-1 stretches it to fill the screen.
          text-shadow is inherited, so every piece of text inside gets the soft shadow */}
      <div className="relative z-10 flex flex-1 flex-col px-5 sm:px-6 md:px-10 lg:px-14 text-shadow-soft">
        {/* 1. Navbar (shared with the Work page) */}
        <SiteHeader />

        <main className="flex flex-1 flex-col">
          {/* 2. Four-column meta grid (two columns below lg) */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div>
              <h2 className={COLUMN_TITLE}>
                <span className="block font-normal">JOSEPH</span>
                <span className={PIXEL_LINE}>ADEBIYI</span>
              </h2>
              <p aria-hidden="true" className="text-[10px] text-white/50 mt-3">
                *
              </p>
              <p className="font-pixel mt-1 text-xs text-white/60 leading-relaxed">
                Self-taught in Blender
                <br />
                from online tutorials.
                <br />
                Year 13 student in
                <br />
                Gravesend, Kent
              </p>
            </div>

            <div className="text-right lg:text-left">
              <h2 className={COLUMN_TITLE}>
                <span className="block font-normal">3D DESIGN &amp;</span>
                <span className={PIXEL_LINE}>TECHNOLOGY</span>
              </h2>
            </div>

            <div>
              <h3 className={LABEL}>What I Do</h3>
              <p className="text-sm text-white/90 leading-relaxed max-w-[220px]">
                I build 3D models in Blender and run cameras, livestream and lighting for live
                events
              </p>
            </div>

            <div className="text-right lg:text-left">
              <h3 className={LABEL}>Skills</h3>
              <ul className="text-sm text-white/90 leading-relaxed space-y-0.5">
                {SKILLS.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Spacer: pushes the bottom block down to the foot of the screen */}
          <div className="flex-1" />

          {/* 4. Bottom section */}
          <div className="pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-end">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] tracking-wide uppercase font-normal"
                style={{ lineHeight: 0.72 }}
              >
                I BUILD IN
                <br />
                <span className={PIXEL_WORD}>BLENDER</span> AND RUN
                <br />
                THE TECH BEHIND
                <br />
                <span className={PIXEL_WORD}>LIVE</span> EVENTS
              </h1>

              <div className="flex flex-col gap-4 sm:gap-6 justify-end">
                {/* Becomes PLAY SHOWREEL (lucide Play icon) once there's a showreel */}
                <a
                  href={WORK_URL}
                  className="self-start flex items-center gap-3 border border-white/30 px-6 py-3 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ArrowUpRight size={14} aria-hidden="true" />
                  <span className="text-sm tracking-wider">VIEW MY WORK</span>
                </a>

                <ul className="self-start lg:self-end flex flex-wrap items-stretch gap-2 sm:gap-3 text-sm text-white/80">
                  {FACTS.map((fact) => (
                    <li
                      key={fact.title}
                      className="bg-[#0B0B0B] px-3 sm:px-4 py-2 flex items-center gap-2"
                    >
                      <span className="font-bold text-sm sm:text-base tracking-tight">
                        {fact.title}
                      </span>
                      <span className="text-white/50 text-xs">{fact.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <SiteFooter />
          </div>
        </main>
      </div>
    </div>
  )
}
