import React from "react";
import { WEAPONS } from "../data/weapons";
import { playerOwnsWeapon } from "../systems/ammo";

type WeaponPickerProps = {
  player: any;
  onSelect: (weaponId: string) => void;
};

export default function WeaponPicker({ player, onSelect }: WeaponPickerProps) {
  const options = [WEAPONS.find(w=>w.id==='fists')!];
  if (playerOwnsWeapon(player, 'knife')) options.push(WEAPONS.find(w=>w.id==='knife')!);
  if (playerOwnsWeapon(player, 'pistol9')) options.push(WEAPONS.find(w=>w.id==='pistol9')!);

  return (
    <div className="mt-3">
      <div className="text-sm opacity-80 mb-2">Seleccionar arma</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((w) => (
          <button
            key={w.id}
            onClick={() => onSelect(w.id)}
            className="px-2 py-1 rounded border border-slate-500"
          >
            {w.name}
          </button>
        ))}
      </div>
    </div>
  );
}
