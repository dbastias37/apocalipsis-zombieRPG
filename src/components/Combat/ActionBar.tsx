import React, { useMemo } from "react";
import { getAvailableWeapons } from "../../systems/combat/getAvailableWeapons";

type Enemy = { id: string; trait?: string };

interface Props {
  player: { isGrappled?: boolean; status?: { infected?: boolean; bleeding?: boolean } };
  enemies: Enemy[];
  flee: () => void;
  selfHeal: () => void;
  doAttack: (weaponId: string) => void;
  reload: () => void;
}

export default function ActionBar({
  player,
  enemies,
  flee,
  selfHeal,
  doAttack,
  reload,
}: Props) {
  const canFlee = useMemo(() => {
    if (player.isGrappled) return { ok: false, reason: "Estás atrapado" };
    if (enemies.some((e) => e.trait === "BloqueaHuida")) {
      return { ok: false, reason: "El enemigo te bloquea" };
    }
    return { ok: true, reason: "" };
  }, [player, enemies]);

  const availableWeapons = useMemo(() => getAvailableWeapons(player), [player]);
  const selected = player.selectedWeaponId ?? "fists";

  const hasAilment = !!(player.status?.infected || player.status?.bleeding);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col">
        <select
          className="mb-1 px-2 py-1 rounded bg-neutral-800 text-white"
          value={selected}
          onChange={(e) => (player.selectedWeaponId = e.target.value)}
        >
          {availableWeapons.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
        <button
          className="px-3 py-1 rounded bg-amber-700 text-white"
          onClick={() => doAttack(selected)}
        >
          Atacar
        </button>
        <button
          className="mt-1 px-3 py-1 rounded bg-neutral-700 text-white"
          onClick={() => reload()}
        >
          Recargar
        </button>
      </div>

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
          title={!hasAilment ? "No tienes afecciones que curar" : undefined}
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
