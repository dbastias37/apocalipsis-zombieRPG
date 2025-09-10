import { Actor, Weapon } from '../types/combat.js';
import { ensureLoaded, consumeShot } from './combatUtils.js';

export function performAttack(actor: Actor, target: Actor, weapon: Weapon) {
  if (weapon.type === 'ranged') {
    if ((weapon.magAmmo ?? 0) <= 0) {
      ensureLoaded(actor, weapon);
    }
    if ((weapon.magAmmo ?? 0) <= 0) {
      return { ok: false, reason: 'Sin munición' } as const;
    }
    consumeShot(actor, weapon);
    // resolver hit/daño etc
  } else {
    // melee logic
  }
  return { ok: true } as const;
}
