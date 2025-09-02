
import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { LevelProvider } from '@/state/levelStore'
import { ToastContainer } from '@/components/Toast'
import { ErrorBoundary } from '@/ui/ErrorBoundary'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div />}>
        <LevelProvider>
          <App />
          <ToastContainer />
        </LevelProvider>
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
)
