import { useEffect } from "react";
import { useGameStore } from "@/state/gameStore";

export function useGameClock() {
  const paused = useGameStore((s) => s.ui.paused);
  const mode = useGameStore((s) => s.ui.mode);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    if (paused || mode === "character-creation") return;

    const id = setInterval(() => {
      tick(1000);
    }, 1000);

    return () => clearInterval(id);
  }, [paused, mode, tick]);
}
