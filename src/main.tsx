
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { LevelProvider } from '@/state/levelStore'
import { ToastContainer } from '@/components/Toast'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <LevelProvider>
      <App />
      <ToastContainer />
    </LevelProvider>
  </React.StrictMode>
)
