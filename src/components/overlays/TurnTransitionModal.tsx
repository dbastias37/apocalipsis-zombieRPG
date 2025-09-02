// src/components/overlays/TurnTransitionModal.tsx
import React from "react";
import { useLevel } from "@/state/levelStore";

export const TurnTransitionModal: React.FC = () => {
  const { dayState, startTurn } = useLevel();
  if (!dayState.isTurnGateOpen) return null;
  const player = dayState.turnCounters[dayState.currentPlayerIndex];
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-[#111] text-white p-6 rounded-xl max-w-md w-full text-center space-y-4">
        <h2 className="text-xl font-bold">Es el turno de:</h2>
        <div className="text-2xl">{player?.playerId ?? "Jugador"}</div>
        <button
          className="px-4 py-2 bg-white text-black rounded-lg"
          onClick={() => startTurn()}
        >
          Comenzar turno
        </button>
      </div>
    </div>
  );
};
