import React from "react";

export function ContinueHint({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        className="px-3 py-1 rounded bg-emerald-600 text-white"
        onClick={onContinue}
      >
        Continuar
      </button>
      <span className="text-xs opacity-70">o presiona Enter</span>
    </div>
  );
}
