import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import LanyardIntro from './components/LanyardIntro'

// Landing page only: the lanyard intro sits before the page, which is otherwise unchanged
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanyardIntro />
    <App />
  </StrictMode>,
)
