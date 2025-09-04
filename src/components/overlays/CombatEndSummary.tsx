import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  lines: string[];
  onFinish: () => void;
};

export default function CombatEndSummary({ open, lines, onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [typing, setTyping] = useState(false);
  const [shown, setShown] = useState("");

  const current = lines[idx] ?? "";

  useEffect(() => {
    if (!open) return;
    setShown("");
    setTyping(true);
    let i = 0;
    const step = () => {
      if (i >= current.length) { setTyping(false); return; }
      setShown(prev => prev + current[i]);
      i++;
      setTimeout(step, 12);
    };
    step();
  }, [open, idx, current]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (typing) {
        setTyping(false);
        setShown(current);
      } else {
        if (idx < lines.length - 1) {
          setIdx(x => x + 1);
        } else {
          onFinish();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, typing, idx, lines.length, current, onFinish]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xl mx-4 rounded-2xl p-6 bg-zinc-900/95 border border-white/10 shadow-xl">
        <h2 className="text-lg font-bold text-emerald-400 mb-3">Fin del enfrentamiento</h2>
        <div className="text-sm whitespace-pre-wrap font-mono bg-black/30 rounded-lg p-3 min-h-[120px] border border-white/5">
          {shown}
        </div>
        <div className="mt-3 text-xs text-center opacity-80 animate-pulse-slow">
          Presiona Enter para continuar
        </div>
      </div>
    </div>
  );
}
