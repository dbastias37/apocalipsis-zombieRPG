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
}));
