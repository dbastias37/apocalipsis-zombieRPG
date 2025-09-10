import React, { useMemo } from "react";

type Enemy = { id: string; trait?: string };

interface Props {
  player: { isGrappled?: boolean; status?: { infected?: boolean; bleeding?: boolean } };
  enemies: Enemy[];
  flee: () => void;
  selfHeal: () => void;
}

export default function ActionBar({ player, enemies, flee, selfHeal }: Props) {
  const canFlee = useMemo(() => {
    if (player.isGrappled) return { ok: false, reason: "Estás atrapado" };
    if (enemies.some(e => e.trait === "BloqueaHuida")) {
      return { ok: false, reason: "El enemigo te bloquea" };
    }
    return { ok: true, reason: "" };
  }, [player, enemies]);

  const hasAilment = !!(player.status?.infected || player.status?.bleeding);

  return (
    <div className="flex gap-4">
      <div>
        <button
          className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
          disabled={!canFlee.ok}
          onClick={() => (canFlee.ok ? flee() : null)}
          title={!canFlee.ok ? canFlee.reason : undefined}
        >
          Huir
        </button>
        {!canFlee.ok && (
          <div className="text-xs text-red-300 mt-1">{canFlee.reason}</div>
        )}
      </div>

      <div>
        <button
          disabled={!hasAilment}
          title={!hasAilment ? 'No tienes afecciones que curar' : undefined}
          onClick={() => hasAilment && selfHeal()}
          className="px-3 py-1 rounded bg-sky-700 text-white disabled:opacity-50"
        >
          Curarse
        </button>
        {!hasAilment && (
          <div className="text-xs text-sky-300 mt-1">Nada que curar</div>
        )}
      </div>
    </div>
  );
}

