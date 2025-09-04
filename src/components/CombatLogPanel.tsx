import React, { useEffect, useMemo } from "react";

export default function CombatLogPanel({
  text,
  typing,
  onEnter,
  currentActor, // nombre del actor en turno (jugador o enemigo)
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

  // Normaliza a UNA sola línea: quita saltos y espacios múltiples
  const oneLine = useMemo(() => {
    return (text ?? "")
      .replace(/\s*\n+\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }, [text]);

  return (
    <div className="my-3 rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 shadow-inner">
      {/* Efecto 'breath' definido localmente */}
      <style>{`
        @keyframes breath {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        .breath {
          animation: breath 1.8s ease-in-out infinite;
        }
      `}</style>

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

      {/* Aviso inferior con parpadeo lento (breath) */}
      <div className="mt-1 text-center text-xs text-neutral-400 breath select-none">
        Presiona Enter para continuar
      </div>
    </div>
  );
}
