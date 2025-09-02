import { create } from "zustand";

// Global UI mode for screen routing (start screen removed)
export type UIMode = "character-creation" | "running";

interface UIState {
  mode: UIMode;
  setMode: (m: UIMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // App boots directly into running mode with a default player
  mode: "running",
  setMode: (m) => set({ mode: m }),
}));
