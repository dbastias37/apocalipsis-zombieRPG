import React, { useEffect, useRef } from "react";

export default function CombatLogPanel({
  text,
  typing,
  onEnter,
  currentActor, // nombre del actor en turno (jugador o enemigo)
  onTypingChange,
}: {
  text: string;
  typing: boolean;
  onEnter: () => void;
  currentActor?: string;
  onTypingChange?: (typing: boolean) => void;
}) {
  useEffect(() => {
    onTypingChange?.(typing);
  }, [typing, onTypingChange]);

  // Auto-scroll al final cuando el texto cambia
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [text]);

  return (
    <div
      className="my-3 rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 shadow-inner"
      onClick={() => onEnter()}
    >
      <div className="flex items-center gap-3">
        {currentActor && (
          <div className="text-xs px-2 py-1 rounded bg-emerald-700/30 border border-emerald-600/40 whitespace-nowrap">
            Turno: <span className="font-semibold">{currentActor}</span>
          </div>
        )}

        {/* Mensaje completo, sin recortar palabras */}
        <div
          ref={boxRef}
          className="flex-1 text-sm leading-snug whitespace-normal break-words max-h-40 overflow-auto"
        >
          {text}
        </div>
      </div>
    </div>
  );
}
