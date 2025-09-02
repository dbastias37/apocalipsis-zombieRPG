import { useEffect } from "react";
import { useGameStore } from "@/state/gameStore";
import { useUIStore } from "@/state/ui";

export function useGameClock() {
  const paused = useGameStore((s) => s.ui.paused);
  const mode = useUIStore((s) => s.mode);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    if (paused || mode === "character-creation") return;

    const id = setInterval(() => {
      tick(1000);
    }, 1000);

    return () => clearInterval(id);
  }, [paused, mode, tick]);
}
