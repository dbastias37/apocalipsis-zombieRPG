import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './compat/legacy-globals' // <-- añadir ANTES de render
import './styles.css'
import SafeBoundary from './components/util/SafeBoundary'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <SafeBoundary>
      <App />
    </SafeBoundary>
  </React.StrictMode>
)
