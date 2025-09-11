// src/components/hud/DayHud.tsx
import React, { useMemo } from "react";
import { useLevel } from "@/state/levelStore";

export const DayHud: React.FC = () => {
  const { dayState, rules } = useLevel();
  const pct = useMemo(() => {
    const total = rules.dayDurationMs || 1;
    const used = Math.max(0, total - dayState.remainingMs);
    return Math.min(100, Math.round((used / total) * 100));
  }, [dayState.remainingMs, rules.dayDurationMs]);

  const current = dayState.turnCounters[dayState.currentPlayerIndex];
  const name = current?.playerId ?? "—";
  return (
    <div className="fixed top-2 left-2 right-2 z-40 grid gap-2 text-xs md:text-sm">
      <div className="flex items-center justify-between">
        <span>Día {dayState.day}</span>
        <span>Jugador: <b>{name}</b></span>
      </div>
      <div className="w-full h-2 bg-black/30 rounded">
        <div className="h-2 rounded bg-white/80" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-3">
        <span>Tiempo restante: {(dayState.remainingMs/1000|0)}s</span>
        <span>Decisiones: {current?.decisionsLeft ?? 0}</span>
        <span>Combates: {current?.combatsLeft ?? 0}</span>
        <span>Exploraciones: {current?.exploresLeft ?? 0}</span>
      </div>
    </div>
  );
};
