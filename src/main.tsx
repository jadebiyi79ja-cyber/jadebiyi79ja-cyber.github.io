import { StrictMode, useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import LanyardIntro from './components/LanyardIntro'
import LoaderIntro from './components/LoaderIntro'

// Landing page only: a loading animation plays first, then slides up to reveal the
// lanyard intro that sits before the page, which is otherwise unchanged
function Root() {
  // Visitors who ask for reduced motion skip the loader and go straight to the lanyard
  const [skipLoader] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [showLanyard, setShowLanyard] = useState(skipLoader)
  const [loading, setLoading] = useState(!skipLoader)

  const reveal = useCallback(() => setShowLanyard(true), [])
  const done = useCallback(() => setLoading(false), [])

  return (
    <>
      {showLanyard && <LanyardIntro />}
      <App />
      {loading && <LoaderIntro onReveal={reveal} onDone={done} />}
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
