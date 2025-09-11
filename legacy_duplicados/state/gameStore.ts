import { create } from "zustand";

export interface Card { id: string; [key: string]: any }

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
  awaitingContinue?: boolean;
  currentCard?: Card | null;
  queuedCard?: Card | null;
};

export type GameState = {
  ui: UIState;
  players: Player[];
  tick: (ms: number) => void;
  setMode: (m: UIMode) => void;
  createPlayer: (p: Omit<Player, "id">) => void;
  openDecisionCard: (card: Card) => void;
  proceed: () => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  ui: { mode: "character-creation", paused: true, awaitingContinue: false, currentCard: null, queuedCard: null },
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
  openDecisionCard: (card) =>
    set((state) => {
      if (state.ui.awaitingContinue) {
        return { ui: { ...state.ui, queuedCard: card } };
      }
      return { ui: { ...state.ui, currentCard: card } };
    }),
  proceed: () =>
    set((state) => {
      const ui: UIState = { ...state.ui, awaitingContinue: false };
      if (state.ui.queuedCard) {
        ui.currentCard = state.ui.queuedCard;
        ui.queuedCard = null;
      }
      return { ui };
    }),
}));
