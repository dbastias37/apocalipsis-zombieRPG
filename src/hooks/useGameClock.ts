import { useEffect } from "react";
import { useGameStore } from "@/state/gameStore";
import { useCampaign } from "@/state/campaign";

export function useGameClock() {
  const paused = useGameStore((s) => s.ui.paused);
  const mode = useGameStore((s) => s.ui.mode);
  const tick = useGameStore((s) => s.tick);
  const state = useCampaign((s) => s.state);

  useEffect(() => {
    if (state !== "playing" || paused || mode === "character-creation") return;

    const id = setInterval(() => {
      tick(1000);
    }, 1000);

    return () => clearInterval(id);
  }, [state, paused, mode, tick]);
}
