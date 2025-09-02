import { create } from "zustand";

// Global UI mode for screen routing
export type UIMode = "start" | "character-creation" | "running";

interface UIState {
  mode: UIMode;
  setMode: (m: UIMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mode: "start",
  setMode: (m) => set({ mode: m }),
}));
