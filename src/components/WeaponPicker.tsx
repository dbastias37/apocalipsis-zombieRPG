import React, { useMemo } from "react";
import { getAvailableWeapons, WeaponOpt } from "../systems/combat/getAvailableWeapons";

type WeaponPickerProps = {
  player: any;
  resources: { ammo?: number };
  onSelect: (weaponId: string) => void;
};

export default function WeaponPicker({ player, resources, onSelect }: WeaponPickerProps) {
  const weapons = useMemo<WeaponOpt[]>(
    () => getAvailableWeapons(player, resources),
    [player, resources]
  );

  return (
    <div className="mt-3">
      <div className="text-sm opacity-80 mb-2">Seleccionar arma</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {weapons.map((w) => (
          <button
            key={w.id}
            disabled={!w.usable}
            title={!w.usable ? w.reason : undefined}
            onClick={() => w.usable && onSelect(w.id)}
            className={`px-2 py-1 rounded border ${w.usable ? "border-slate-500" : "border-slate-700 opacity-50"}`}
          >
            {w.label}
          </button>
        ))}
      </div>
    </div>
  );
}

