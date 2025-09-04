import React from "react";

export default function DayEndSummary({
  day, stats, reason, onNext,
}: {
  day: number;
  stats: {
    enemiesKilled: number; damageDealt: number; damageTaken: number;
    healsUsed: number; shotsFired: number; misses: number; escapes: number;
    decisionsTaken: number; exploresDone: number; itemsFound: number; timeSpentMs: number;
  };
  reason: "time_out" | "decks_exhausted" | "turns_exhausted" | "manual";
  onNext: () => void;
}) {
  const mins = Math.floor(stats.timeSpentMs / 60000);
  const secs = Math.floor((stats.timeSpentMs % 60000) / 1000);
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center">
      <div className="w-[min(820px,92vw)] rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Día {day} terminado</h2>
        <p className="text-sm text-neutral-400 mb-4">
          Motivo: {reason === "time_out" ? "Fin del tiempo" :
                    reason === "decks_exhausted" ? "Mazos agotados" :
                    reason === "turns_exhausted" ? "Acciones agotadas" : "Continuación"}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">🧟 Abatidos: <b>{stats.enemiesKilled}</b></div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">⚔️ Daño infligido: <b>{stats.damageDealt}</b></div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">🩸 Daño recibido: <b>{stats.damageTaken}</b></div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">💊 Curas: <b>{stats.healsUsed}</b></div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">🔫 Disparos: <b>{stats.shotsFired}</b> / ❌ Fallos: <b>{stats.misses}</b></div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">🏃‍♂️ Huidas: <b>{stats.escapes}</b></div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">📖 Decisiones: <b>{stats.decisionsTaken}</b></div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">🔎 Exploraciones: <b>{stats.exploresDone}</b></div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">🧰 Objetos hallados: <b>{stats.itemsFound}</b></div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 col-span-2">⏱️ Tiempo consumido: <b>{mins}m {secs}s</b></div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold shadow"
            onClick={onNext}
          >
            Pasar al siguiente día
          </button>
        </div>
      </div>
    </div>
  );
}

