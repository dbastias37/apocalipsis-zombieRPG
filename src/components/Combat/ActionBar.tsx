import React, { useMemo } from "react";

type Enemy = { id: string; trait?: string };

interface Props {
  player: { isGrappled?: boolean };
  enemies: Enemy[];
  flee: () => void;
}

export default function ActionBar({ player, enemies, flee }: Props) {
  const canFlee = useMemo(() => {
    if (player.isGrappled) return { ok: false, reason: "Estás atrapado" };
    if (enemies.some(e => e.trait === "BloqueaHuida")) {
      return { ok: false, reason: "El enemigo te bloquea" };
    }
    return { ok: true, reason: "" };
  }, [player, enemies]);

  return (
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
  );
}

