
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { LevelProvider } from '@/state/levelStore'
import { ToastContainer } from '@/components/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <LevelProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <ToastContainer />
    </LevelProvider>
  </React.StrictMode>
)
