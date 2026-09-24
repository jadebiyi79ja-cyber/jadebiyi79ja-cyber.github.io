import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu } from 'lucide-react'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import { NAV_LINKS } from '../content'

type SiteHeaderProps = {
  logoHref?: string // inner pages link the logo back home; the home page shows just the mark
  current?: string // label of the nav link for the page you're on
}

// Logo, desktop nav and the phone menu, shared by every page
export default function SiteHeader({ logoHref, current }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // useCallback keeps this the same function between renders, so the menu's
  // Escape-key listener isn't removed and re-added every time
  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    menuButtonRef.current?.focus() // hand keyboard focus back to the hamburger
  }, [])

  return (
    <header className="flex items-center justify-between py-6">
      {logoHref ? (
        <a href={logoHref} aria-label="Home" className="hover:opacity-70 transition-opacity">
          <Logo />
        </a>
      ) : (
        <Logo />
      )}

      <nav className="hidden md:flex gap-8 text-sm tracking-wide">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.newTab ? '_blank' : undefined}
            rel={link.newTab ? 'noopener' : undefined}
            aria-current={link.label === current ? 'page' : undefined}
            className="hover:opacity-70 transition-opacity aria-[current=page]:underline underline-offset-4"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <button
        ref={menuButtonRef}
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        className="md:hidden p-2 hover:opacity-70"
      >
        <Menu size={24} aria-hidden="true" />
      </button>

      {/* Portal: rendered into <body> so it covers the whole page and inherits no page styles */}
      {createPortal(<MobileMenu open={menuOpen} onClose={closeMenu} />, document.body)}
    </header>
  )
}
