import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { sound } from './audio/sound'
import { requestPersistentStorage } from './db/db'
import './index.css'

// Updates install silently and apply on the next launch, never mid-game.
registerSW({ immediate: true })
void requestPersistentStorage()

// iOS Safari ignores user-scalable=no; block pinch-zoom and double-tap zoom explicitly.
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(type, (e) => e.preventDefault(), { passive: false })
}
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false })
document.addEventListener('contextmenu', (e) => e.preventDefault())

// Audio stays locked until the first touch; unlock it on whatever the child touches first.
document.addEventListener('pointerdown', () => sound.unlock(), { once: true, capture: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
