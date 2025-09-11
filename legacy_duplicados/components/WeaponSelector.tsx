import React from "react";
import { Weapon } from "../data/weapons";

export default function WeaponSelector({
  weapons, value, onChange, disabled
}: { weapons: Weapon[]; value?: string; onChange:(id:string)=>void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {weapons.map(w => (
        <button
          key={w.id}
          disabled={disabled}
          onClick={()=>onChange(w.id)}
          className={`px-3 py-1 rounded-lg border text-sm ${value===w.id ? "border-emerald-500 bg-emerald-500/10" : "border-neutral-700 hover:bg-neutral-800/60"}`}
          title={`${w.name} • +${w.hitBonus} golpe • ${w.damage.times}d${w.damage.faces}${w.damage.mod>=0?`+${w.damage.mod}`:w.damage.mod}`}
        >
          {w.name}
        </button>
      ))}
    </div>
  );
}
