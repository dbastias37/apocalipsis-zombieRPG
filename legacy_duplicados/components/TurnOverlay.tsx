import React from "react";

type Props = {
  visible: boolean;
  playerName: string;
  onStart: () => void;
};

export default function TurnOverlay({ visible, playerName, onStart }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-700 rounded-2xl p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Es el turno de:</h2>
        <p className="text-3xl font-extrabold text-emerald-400 mb-6">{playerName}</p>
        <button
          onClick={onStart}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold shadow"
        >
          Comenzar turno
        </button>
      </div>
    </div>
  );
}
