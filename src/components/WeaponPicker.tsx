import React, { useMemo } from "react";
import { getAvailableWeapons, WeaponOpt } from "../systems/combat/getAvailableWeapons";
import { findWeaponById } from "../data/weapons";
import { getAmmoFor, isRangedWeapon } from "../systems/weapons";

type WeaponPickerProps = {
  player: any;
  onSelect: (weaponId: string) => void;
};

export default function WeaponPicker({ player, onSelect }: WeaponPickerProps) {
  const weapons = useMemo<WeaponOpt[]>(() => getAvailableWeapons(player), [player]);

  return (
    <div className="mt-3">
      <div className="text-sm opacity-80 mb-2">Seleccionar arma</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {weapons.map((w) => {
          const wObj = findWeaponById(w.id);
          const ranged = isRangedWeapon(wObj);
          const ammo = ranged ? getAmmoFor(player, w.id) : null;
          const noAmmo = ranged && (ammo ?? 0) <= 0;
          return (
            <button
              key={w.id}
              disabled={!w.usable}
              title={noAmmo ? "No hay munición." : undefined}
              onClick={() => w.usable && onSelect(w.id)}
              className={`px-2 py-1 rounded border ${w.usable ? "border-slate-500" : "border-slate-700 opacity-50"}`}
            >
              {w.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
