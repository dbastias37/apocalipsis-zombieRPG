import React from 'react';
import { Actor, Weapon, RootState } from '../types/combat';
import { damageRange } from '../logic/combatUtils';
import { getLoadedAmmo, totalAmmoInInventory } from '../systems/ammo';

export function weaponLabel(actor: Actor, w: Weapon) {
  const { min, max } = damageRange(w.damage);
  if (w.type === 'ranged') {
    const pool = totalAmmoInInventory(actor.inventory);
    const mag = getLoadedAmmo(actor, w.id);
    const cap = w.magSize ?? 0;
    return `${w.name} (${min}–${max}) — Munición: ${mag}/${cap} • Reserva: ${pool}${mag <= 0 && pool <= 0 ? ' (Sin munición)' : ''}`;
  }
  return `${w.name} (${min}–${max})`;
}

export default function WeaponSelect({ state, onSelect, disabled }: { state: RootState; onSelect: (id: string) => void; disabled?: boolean }) {
  const actor = state.actors.find(a => a.id === state.combat.activeId);
  const weapons = actor?.inventory.weapons ?? [];
  const current = actor?.equipped?.id;
  return (
    <div className="flex flex-col gap-2">
      {weapons.map(w => (
        <button
          key={w.id}
          disabled={disabled}
          onClick={() => onSelect(w.id)}
          className={`px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800 ${current === w.id ? 'bg-neutral-800' : ''}`}
        >
          {actor ? weaponLabel(actor, w) : w.name}
        </button>
      ))}
    </div>
  );
}
