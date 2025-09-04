import "./global/installWorldVar";
import './global/dayShim'

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import SafeBoundary from './components/util/SafeBoundary'

if (import.meta.env.DEV) {
  import('./global/worldPolyfill.dev');
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <SafeBoundary>
      <App />
    </SafeBoundary>
  </React.StrictMode>
)
