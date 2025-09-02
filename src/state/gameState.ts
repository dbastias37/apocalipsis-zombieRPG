import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GamePhase = 'intro' | 'manual' | 'paused' | 'running'

export interface Personaje {
  id: string
  name: string
  profession: string
  bio: string
  stats?: Record<string, number>
}

interface GameState {
  phase: GamePhase
  setPhase: (p: GamePhase) => void
  hasSeenManual: boolean
  setHasSeenManual: (v: boolean) => void
  showWelcome: boolean
  setShowWelcome: (v: boolean) => void
  roster: Personaje[]
  addPersonaje: (p: Personaje) => void
  upsertPersonaje: (p: Personaje) => void
  removePersonaje: (id: string) => void
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'intro',
      setPhase: (p) => set({ phase: p }),
      hasSeenManual: false,
      setHasSeenManual: (v) => set({ hasSeenManual: v }),
      showWelcome: true,
      setShowWelcome: (v) => set({ showWelcome: v }),
      roster: [],
      addPersonaje: (p) => set((s) => ({ roster: [...s.roster, p] })),
      upsertPersonaje: (p) =>
        set((s) => ({
          roster: s.roster.some((r) => r.id === p.id)
            ? s.roster.map((r) => (r.id === p.id ? { ...r, ...p } : r))
            : [...s.roster, p],
        })),
      removePersonaje: (id) =>
        set((s) => ({ roster: s.roster.filter((r) => r.id !== id) })),
    }),
    { name: 'az-game-state' }
  )
)
