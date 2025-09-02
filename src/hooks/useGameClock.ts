import { useEffect } from 'react'
import { useGameState } from '@/state/gameState'

export function useGameClock() {
  const phase = useGameState((s) => s.phase)

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => {
      // game tick placeholder
    }, 1000)
    return () => clearInterval(id)
  }, [phase])
}
