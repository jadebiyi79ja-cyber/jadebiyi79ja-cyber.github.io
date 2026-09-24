import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Logo from './Logo'
import { NAV_LINKS } from '../content'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

// Shared by the overlay fade and the link slide-up; off for reduced motion
const TRANSITION =
  'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none'

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // While open: move keyboard focus into the menu and let Escape close it
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      // Closed = invisible, so also unreachable by keyboard and screen readers
      inert={!open}
      // text-white: the menu is portalled into <body>, outside the page's white-text wrapper
      className={`fixed inset-0 z-50 bg-black/95 text-white backdrop-blur-md flex flex-col ${TRANSITION} ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-6">
        <Logo />
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="p-2 hover:opacity-70"
        >
          <X size={24} aria-hidden="true" />
        </button>
      </div>

      <nav className="flex flex-col items-center justify-center flex-1 gap-8">
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            target={link.newTab ? '_blank' : undefined}
            rel={link.newTab ? 'noopener' : undefined}
            onClick={onClose}
            className={`text-2xl tracking-widest ${TRANSITION} ${
              open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            // Stagger on open (100, 160, 220, 280ms); all together on close
            style={{ transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
