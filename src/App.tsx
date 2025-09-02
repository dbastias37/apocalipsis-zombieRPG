import React, { useEffect } from "react";
import { useUIStore } from "@/state/ui";
import CharacterCreationPanel from "@/ui/CharacterCreationPanel";
import GameRoot from "./GameRoot";
import { useGameStore } from "@/state/gameStore";

export default function App() {
  const mode = useUIStore((s) => s.mode);
  const setMode = useUIStore((s) => s.setMode);
  const players = useGameStore((s) => s.players);

  useEffect(() => {
    console.log("[UI] mode:", mode);
  }, [mode]);

  // Start screen removed; app boots directly into character creation
  if (mode === "character-creation") return <CharacterCreationPanel />;
  if (mode === "running") {
    if (!players || players.length === 0) {
      setMode("character-creation");
      return null;
    }
    return <GameRoot />;
  }
  return null;
}
