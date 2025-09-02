import { create } from "zustand";

export type Player = {
  id: string;
  name: string;
  profession: string;
  bio: string;
};

export type UIState = {
  paused: boolean;
  characterInitial?: {
    id: string;
    name?: string;
    profession?: string;
    bio?: string;
  } | null;
};

export type GameState = {
  ui: UIState;
  players: Player[];
  tick: (ms: number) => void;
  setPaused: (p: boolean) => void;
  createPlayer: (p: Omit<Player, "id">) => void;
  updatePlayer: (id: string, p: Omit<Player, "id">) => void;
  removePlayer: (id: string) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  ui: { paused: true },
  players: [],
  tick: (ms) => {
    const { ui } = get();
    if (ui.paused) return;
    // advance game clock here
  },
  setPaused: (p) =>
    set((state) => ({
      ui: {
        ...state.ui,
        paused: p,
      },
    })),
  createPlayer: (p) =>
    set((state) => ({
      players: [...state.players, { id: crypto.randomUUID(), ...p }],
    })),
  // Update existing player data
  updatePlayer: (id, p) =>
    set((state) => ({
      players: state.players.map((pl) => (pl.id === id ? { ...pl, ...p } : pl)),
    })),
  // Remove player from roster
  removePlayer: (id) =>
    set((state) => ({ players: state.players.filter((pl) => pl.id !== id) })),
}));
