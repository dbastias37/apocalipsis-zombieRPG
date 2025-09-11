import React, { useMemo } from "react";
import { getSelectedWeapon, getAmmoFor, isRangedWeapon } from "../../systems/weapons";

export default function ActionBar({ player, enemies, flee, selfHeal, doAttack, reload }: any){
  const selected = useMemo(()=>getSelectedWeapon(player), [player]);
  const isRanged = isRangedWeapon(selected);
  const ammo = isRanged ? getAmmoFor(player, selected.id) : Infinity;
  const noAmmo = isRanged && ammo <= 0;

  return (
    <div className="flex gap-2">
      <button
        className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50"
        disabled={enemies.length===0 || noAmmo}
        onClick={()=>doAttack(selected.id)}
        title={noAmmo ? "No hay munición." : "Atacar"}
      >
        Atacar
      </button>

      <button
        className="px-3 py-1 rounded bg-neutral-700 text-white"
        onClick={reload}
        title="Recargar arma seleccionada"
      >
        Recargar
      </button>

      <button className="px-3 py-1 rounded bg-slate-700 text-white" onClick={selfHeal}>
        Curarse
      </button>
      <button className="px-3 py-1 rounded bg-amber-700 text-white" onClick={flee}>
        Huir
      </button>
    </div>
  );
}
