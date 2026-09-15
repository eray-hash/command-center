import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Bittet den Browser, den Speicher dieser Seite nicht automatisch zu räumen —
// hilft, den Login-Status auf dem Homescreen (PWA) zuverlässiger zu behalten.
navigator.storage?.persist?.().catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
