import { create } from "zustand";

export type UIMode = "character-creation" | "running" | "paused";

export type Player = {
  id: string;
  name: string;
  profession: string;
  bio: string;
};

export type UIState = {
  mode: UIMode;
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
  setMode: (m: UIMode) => void;
  createPlayer: (p: Omit<Player, "id">) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  ui: { mode: "character-creation", paused: true },
  players: [],
  tick: (ms) => {
    const { ui } = get();
    if (ui.mode === "character-creation" || ui.paused) return;
    // advance game clock here
  },
  setMode: (m) =>
    set((state) => ({
      ui: {
        ...state.ui,
        mode: m,
        paused: m === "running" ? false : true,
      },
    })),
  createPlayer: (p) =>
    set((state) => ({
      players: [...state.players, { id: crypto.randomUUID(), ...p }],
    })),
}));
