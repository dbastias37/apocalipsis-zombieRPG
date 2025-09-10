import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  lines: string[];            // una línea por ítem
  onFinish: () => void;       // llamado al cerrar
  autoCloseMs?: number;       // default 4000
};

export default function CombatEndSummary({ open, lines, onFinish, autoCloseMs = 4000 }: Props) {
  const [idx, setIdx] = useState(0);      // índice de línea actual
  const [typed, setTyped] = useState(""); // texto tipeado de la línea actual
  const [typing, setTyping] = useState(false);

  const typeTimer = useRef<number | null>(null);
  const finishTimer = useRef<number | null>(null);

  // Sanea entradas: quita falsys/undefined/strings vacías
  const safeLines = useMemo(
    () => (Array.isArray(lines) ? lines.filter((s): s is string => typeof s === "string" && s.trim().length > 0) : []),
    [lines]
  );
  const current = safeLines[idx] ?? "";
  const finished = !typing && idx >= safeLines.length - 1;

  // Reset al abrir
  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setTyped("");
    setTyping(false);
  }, [open]);

  // Tipeo de la línea actual (máquina de escribir)
  useEffect(() => {
    if (!open || !current) return;
    setTyping(true);
    setTyped("");
    let i = 0;
    if (typeTimer.current) window.clearInterval(typeTimer.current);
    typeTimer.current = window.setInterval(() => {
      i++;
      setTyped(current.slice(0, i));
      if (i >= current.length) {
        setTyping(false);
        if (typeTimer.current) window.clearInterval(typeTimer.current);
      }
    }, 18) as unknown as number; // velocidad del tipeo
    return () => { if (typeTimer.current) window.clearInterval(typeTimer.current); };
  }, [open, current]);

  // Enter/Space: avanzar línea o finalizar
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (typing) {
          // fast-forward de la línea actual
          setTyped(current);
          setTyping(false);
          return;
        }
        if (finished) onFinish();
        else setIdx(i => Math.min(i + 1, safeLines.length - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, typing, finished, current, safeLines.length, onFinish]);

  // Autocierre tras X ms cuando ya terminó de mostrarse todo
  useEffect(() => {
    if (!open) return;
    if (finished) {
      if (finishTimer.current) window.clearTimeout(finishTimer.current);
      finishTimer.current = window.setTimeout(() => onFinish(), autoCloseMs) as unknown as number;
      return () => { if (finishTimer.current) window.clearTimeout(finishTimer.current); };
    }
  }, [open, finished, onFinish, autoCloseMs]);

  // Cuerpo a mostrar = líneas completas previas + línea tipeándose
  const body = useMemo(() => {
    const prev = safeLines.slice(0, idx).join("\n");
    return prev + (prev ? "\n" : "") + typed;
  }, [safeLines, idx, typed]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-enter-scope="summary">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xl mx-4 rounded-2xl p-6 bg-zinc-900/95 border border-white/10 shadow-xl">
        <h2 className="text-lg font-bold text-emerald-400 mb-3">Fin del enfrentamiento</h2>

        <div className="text-sm whitespace-pre-wrap font-mono bg-black/30 rounded-lg p-3 min-h-[140px] border border-white/5">
          {body}
        </div>

        <div className="mt-2 text-xs opacity-70">Presiona Enter para continuar</div>

        {finished && (
          <div className="mt-4 flex justify-end">
            <button className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500" onClick={onFinish}>
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

