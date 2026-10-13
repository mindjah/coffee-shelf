import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { GOOGLE_CLIENT_ID } from './config'
import { handleRedirect, startAutoBackup } from './gdrive'
import './styles.css'

registerSW({ immediate: true })

if (GOOGLE_CLIENT_ID) {
  // Finishes a Google sign-in if we're coming back from it, then backs up as the shelf changes.
  handleRedirect()
  startAutoBackup()
}

// iOS Safari ignores user-scalable=no; its own gesture events are the reliable way to stop pinch zoom.
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(type, (e) => e.preventDefault(), { passive: false })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
