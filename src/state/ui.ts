import { create } from "zustand";

// Global UI mode for screen routing (start screen removed)
export type UIMode = "character-creation" | "running";

interface UIState {
  mode: UIMode;
  setMode: (m: UIMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // App now boots directly into character creation
  mode: "character-creation",
  setMode: (m) => set({ mode: m }),
}));
