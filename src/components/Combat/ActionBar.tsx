import React, { useMemo, useState } from "react";
import useAttackFlow from "../combat/AttackFlow";
import ChooseWeaponModal from "../combat/ChooseWeaponModal";
import { getAvailableWeapons, WeaponOpt } from "../../systems/combat/getAvailableWeapons";

type Enemy = { id: string; trait?: string };

interface Props {
  player: { isGrappled?: boolean; status?: { infected?: boolean; bleeding?: boolean } };
  resources: { ammo?: number };
  enemies: Enemy[];
  flee: () => void;
  selfHeal: () => void;
  doAttack: (weaponId: string) => void;
}

export default function ActionBar({
  player,
  resources,
  enemies,
  flee,
  selfHeal,
  doAttack,
}: Props) {
  const canFlee = useMemo(() => {
    if (player.isGrappled) return { ok: false, reason: "Estás atrapado" };
    if (enemies.some((e) => e.trait === "BloqueaHuida")) {
      return { ok: false, reason: "El enemigo te bloquea" };
    }
    return { ok: true, reason: "" };
  }, [player, enemies]);

  const [weaponChoices, setWeaponChoices] = useState<WeaponOpt[] | null>(null);
  const { startAttack } = useAttackFlow(player, resources, doAttack);

  const availableWeapons = useMemo(
    () => getAvailableWeapons(player, resources),
    [player, resources]
  );
  const canAttack = availableWeapons.some((w) => w.usable);

  const handleAttack = () => {
    const res = startAttack();
    if (!res.needChooser && res.chosen) {
      doAttack(res.chosen);
    } else if (res.needChooser) {
      setWeaponChoices(res.weapons);
    }
  };

  const hasAilment = !!(player.status?.infected || player.status?.bleeding);

  return (
    <div className="flex gap-4">
      <div>
        <button
          className="px-3 py-1 rounded bg-amber-700 text-white disabled:opacity-50"
          disabled={!canAttack || weaponChoices !== null}
          onClick={() => (canAttack ? handleAttack() : null)}
          title={!canAttack ? "No tienes armas utilizables" : undefined}
        >
          Atacar
        </button>
        {!canAttack && (
          <div className="text-xs text-amber-300 mt-1">No tienes armas utilizables</div>
        )}
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

      {weaponChoices && (
        <ChooseWeaponModal
          weapons={weaponChoices}
          onClose={() => setWeaponChoices(null)}
          doAttack={(id) => {
            doAttack(id);
            setWeaponChoices(null);
          }}
        />
      )}
    </div>
  );
}
