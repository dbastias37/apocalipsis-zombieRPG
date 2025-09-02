
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { LevelProvider } from '@/state/levelStore'
import { ErrorBoundary } from '@/ui/ErrorBoundary'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LevelProvider>
        <App />
      </LevelProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
