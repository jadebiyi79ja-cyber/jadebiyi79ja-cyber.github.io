import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PricingPage from './PricingPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PricingPage />
  </StrictMode>,
)
