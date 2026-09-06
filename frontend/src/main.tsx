import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerServiceWorker } from './utils/registerServiceWorker'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register lightweight offline Service Worker
registerServiceWorker()

// Expose deterministic frontend release identity (Wave D1.2 Phase 6)
declare global {
  interface Window {
    __OTRAVELZ_BUILD__?: {
      git_sha: string;
      built_at: string;
      version: string;
    };
  }
}

window.__OTRAVELZ_BUILD__ = {
  git_sha: (import.meta as any).env.VITE_BUILD_SHA || '593d20263bc3b2442fe3f9ef12dffaefde17b74b',
  built_at: (import.meta as any).env.VITE_BUILD_TIME || new Date().toISOString(),
  version: '4.0.0',
};

