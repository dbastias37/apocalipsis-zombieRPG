import React, { useEffect } from "react";

export default function CombatLogPanel({
  text, typing, onEnter,
  currentActor, // nombre del que actúa (jugador o enemigo)
}: {
  text: string;
  typing: boolean;
  onEnter: () => void;
  currentActor?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") onEnter();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnter]);

  return (
    <div className="my-3 rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 shadow-inner">
      <div className="flex items-center gap-3">
        {currentActor && (
          <div className="text-xs px-2 py-1 rounded bg-emerald-700/30 border border-emerald-600/40">
            Turno: <span className="font-semibold">{currentActor}</span>
          </div>
        )}
        <div className="text-sm text-neutral-200 flex-1 whitespace-pre-wrap">
          {text}{!typing && text ? `\n\nPresiona Enter para continuar` : ""}
        </div>
      </div>
    </div>
  );
}
