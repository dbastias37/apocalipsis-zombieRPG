import { Actor, Weapon } from '../types/combat.js';
import { damageRange } from '../logic/combatUtils.js';

export function weaponLabel(actor: Actor, w: Weapon) {
  const { min, max } = damageRange(w.damage);
  if (w.type === 'ranged') {
    const pool = actor.inventory.ammo[w.ammoType] ?? 0;
    const mag = w.magAmmo ?? 0;
    const cap = w.magCapacity ?? 0;
    return `${w.name} (${min}–${max}) — ${mag}/${cap} • Reserva: ${pool}${mag <= 0 && pool <= 0 ? ' (Sin munición)' : ''}`;
  }
  return `${w.name} (${min}–${max})`;
}
