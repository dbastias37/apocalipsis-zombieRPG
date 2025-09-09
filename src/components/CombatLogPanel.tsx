import React, { useEffect, useMemo } from "react";
import { ContinueHint } from "./Combat/ContinueHint";

export default function CombatLogPanel({
  text,
  typing,
  onEnter,
  currentActor, // nombre del actor en turno (jugador o enemigo)
  onTypingChange,
  onContinue,
}: {
  text: string;
  typing: boolean;
  onEnter: () => void;
  currentActor?: string;
  onTypingChange?: (typing: boolean) => void;
  onContinue?: () => void;
}) {
  function handleContinue() {
    if (typing) {
      onEnter();
    } else {
      onEnter();
      onContinue?.();
    }
  }

  useEffect(() => {
    onTypingChange?.(typing);
  }, [typing, onTypingChange]);

  // Normaliza a UNA sola línea: quita saltos y espacios múltiples
  const oneLine = useMemo(() => {
    return (text ?? "")
      .replace(/\s*\n+\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }, [text]);

  return (
    <div className="my-3 rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 shadow-inner" onClick={handleContinue}>
      <div className="flex items-center gap-3">
        {currentActor && (
          <div className="text-xs px-2 py-1 rounded bg-emerald-700/30 border border-emerald-600/40 whitespace-nowrap">
            Turno: <span className="font-semibold">{currentActor}</span>
          </div>
        )}

        {/* Mensaje en UNA sola línea, sin wraps */}
        <div
          className="flex-1 text-sm text-neutral-200 whitespace-nowrap overflow-hidden"
          title={oneLine} // tooltip por si se corta
        >
          {oneLine}
        </div>
      </div>

      {!typing && <ContinueHint onContinue={handleContinue} />}
    </div>
  );
}
