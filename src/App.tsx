import React, { useEffect } from "react";
import { useUIStore } from "@/state/ui";
import CharacterCreationPanel from "@/ui/CharacterCreationPanel";
import GameRoot from "./GameRoot";
import { useGameStore } from "@/state/gameStore";

export default function App() {
  const mode = useUIStore((s) => s.mode);
  const setMode = useUIStore((s) => s.setMode);
  const players = useGameStore((s) => s.players);
  const createPlayer = useGameStore((s) => s.createPlayer);

  useEffect(() => {
    console.log("[UI] mode:", mode);
  }, [mode]);

  // Ensure a default player exists when running
  useEffect(() => {
    if (mode === "running" && players.length === 0) {
      createPlayer({ name: "Jugador 1", profession: "Médico/a", bio: "" });
    }
  }, [mode, players.length, createPlayer]);


  // Start screen removed; app boots directly into character creation
  // character creation removed
  if (mode === "running") {
    return <GameRoot />;
  }
  return null;
}
