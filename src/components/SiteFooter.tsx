import { EMAIL, PIECE_COUNT } from '../content'

// The footer strip, shared by every page
export default function SiteFooter() {
  return (
    <footer className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-4">
      <p className="text-xs text-white/60">
        Open to 2027 degree apprenticeships.{' '}
        <a href={`mailto:${EMAIL}`} className="text-red-500 hover:text-red-400 transition-colors">
          Get in touch
        </a>
      </p>
      <p className="text-xs text-white/60 sm:text-right">
        {PIECE_COUNT} 3D pieces • Live-event tech since Jan 2024 • Year 13
      </p>
    </footer>
  )
}
