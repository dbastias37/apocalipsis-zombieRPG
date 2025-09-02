import React, { useEffect, useState } from "react";
import StartScreen from "@/ui/StartScreen";
import CharacterSetupPanel from "@/ui/CharacterSetupPanel";
import DevStatusBadge from "@/components/DevStatusBadge";
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
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-4">
      <h1 className="text-xl font-bold">Día {day}</h1>
      <p>Jugadores: {roster.length}</p>
      <DevStatusBadge state={state} showStart={showStart} playersLen={roster.length} turnIndex={0} day={day} timers={{ clock: tickEnabled, event: false }} />
    </div>
  );
}
