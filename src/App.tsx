import React, { useEffect, useState } from "react";
import StartScreen from "@/ui/StartScreen";
import CharacterSetupPanel from "@/ui/CharacterSetupPanel";
import DevStatusBadge from "@/components/DevStatusBadge";
import GameRoot from "@/GameRoot";
import { campaignStore, useCampaign } from "@/state/campaign";

export default function App() {
  const state = useCampaign((s) => s.state);
  const day = useCampaign((s) => s.day);
  const roster = useCampaign((s) => s.roster);
  const tickEnabled = useCampaign((s) => s.tickEnabled);
  const [showStart, setShowStart] = useState(true);

  useEffect(() => {
    campaignStore.setTickEnabled(state === "playing");
  }, [state]);

  useEffect(() => {
    if (state !== "playing") return;
    const id = setInterval(() => {
      // placeholder tick
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  if (showStart)
    return <StartScreen onStart={() => { setShowStart(false); campaignStore.setState("setup"); }} />;
  if (state === "setup") return <CharacterSetupPanel />;

  return (
    <>
      <GameRoot />
      <DevStatusBadge
        state={state}
        showStart={showStart}
        playersLen={roster.length}
        turnIndex={0}
        day={day}
        timers={{ clock: tickEnabled, event: false }}
      />
    </>
  );
}
