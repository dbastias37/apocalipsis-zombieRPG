import React from 'react'
import GameRoot from './GameRoot'
import StartScreen from './screens/StartScreen'
import ManualScreen from './screens/ManualScreen'
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
    </>
  )
}
