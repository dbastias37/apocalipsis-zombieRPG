import React from "react";
import { findWeaponById } from "../data/weapons";
import { getSelectedWeapon, getAmmoFor, isRangedWeapon } from "../systems/weapons";

type WeaponPickerProps = {
  player: any;
  backpack: { id: string; name: string; type: "melee" | "ranged"; damage?: any }[];
  onSelect: (weaponId: string) => void;
};

export default function WeaponPicker({ player, backpack, onSelect }: WeaponPickerProps){
  const weapons = [
    { id: "fists", name: "Puños", type: "melee" as const, damage: { min: 1, max: 2 } },
    ...backpack.filter(it => it.type === "melee" || it.type === "ranged"),
  ].map(it => {
    const w = it.id === "fists" ? it : (findWeaponById(it.id) || it);
    const dmg = w.damage || it.damage;
    let min = dmg?.min;
    let max = dmg?.max;
    if (min == null && max == null && dmg) {
      const times = dmg.times ?? 0;
      const faces = dmg.faces ?? 0;
      const mod = dmg.mod ?? 0;
      min = times + mod;
      max = times * faces + mod;
    }
    return { ...w, name: w.name || it.name, type: w.type || it.type, damage: { min, max } };
  });

  const sel = getSelectedWeapon(player).id;

  return (
    <div className="mt-3">
      <div className="text-sm opacity-80 mb-2">Seleccionar arma</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {weapons.map(w => {
          const selected = sel === w.id;
          const ranged = isRangedWeapon(w);
          const ammo = ranged ? getAmmoFor(player, w.id) : null;
          const disabled = ranged && (ammo ?? 0) <= 0;
          return (
            <button
              key={w.id}
              onClick={() => !disabled && onSelect(w.id)}
              className={[
                "text-left p-2 rounded-xl border transition",
                selected ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 hover:border-white/20",
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              ].join(" ")}
            >
              <div className="font-medium">{w.name}</div>
              <div className="text-xs opacity-80">
                Daño: {w?.damage ? `${w.damage.min ?? "?"}–${w.damage.max ?? "?"}` : "?"}
              </div>
              <div className="text-xs opacity-80">
                Munición: {ranged ? (ammo ?? 0) : "--"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
