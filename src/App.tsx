import React from 'react'
import GameRoot from './GameRoot'
import StartScreen from './screens/StartScreen'
import ManualScreen from './screens/ManualScreen'
import CharacterCreationPanel from './ui/CharacterCreationPanel'
import WelcomeToast from './components/WelcomeToast'
import { useGameState } from './state/gameState'

export default function App() {
  const phase = useGameState((s) => s.phase)
  const setPhase = useGameState((s) => s.setPhase)

  if (phase === 'intro') return <StartScreen />
  if (phase === 'manual') return <ManualScreen />

  return (
    <>
      <GameRoot />
      <button
        className="fixed top-2 right-2 px-3 py-1 bg-neutral-800 rounded z-50"
        onClick={() => setPhase(phase === 'running' ? 'paused' : 'running')}
      >
        {phase === 'running' ? '⏸' : '▶︎'}
      </button>
      {phase === 'paused' && (
        <>
          <div className="fixed top-2 left-1/2 -translate-x-1/2 bg-neutral-800 text-white px-4 py-2 rounded z-40">
            Juego en PAUSA — Crea/ajusta tus personajes antes de comenzar.
          </div>
          <div className="fixed inset-0 overflow-y-auto p-4 z-30">
            <CharacterCreationPanel />
          </div>
          <WelcomeToast />
        </>
      )}
    </>
  )
}
