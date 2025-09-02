import React from 'react'
import { useGameState } from '@/state/gameState'

export default function StartScreen() {
  const setPhase = useGameState((s) => s.setPhase)
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="card card-red p-8 text-center space-y-6">
        <h1 className="text-3xl font-black">APOCALIPSIS ZOMBIE RPG</h1>
        <button
          className="btn btn-red text-white px-6 py-3 rounded-lg"
          onClick={() => setPhase('manual')}
        >
          Comenzar
        </button>
      </div>
    </div>
  )
}
