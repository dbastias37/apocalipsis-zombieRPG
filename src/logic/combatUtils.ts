import { Actor, RangedWeapon, Weapon, DiceSpec } from '../types/combat.js';

export function damageRange(d: DiceSpec) {
  const times = d.times ?? 1;
  const faces = d.faces ?? 6;
  const mod = d.mod ?? 0;
  return {
    min: times * 1 + mod,
    max: times * faces + mod,
  };
}

export function ensureLoaded(actor: Actor, w: Weapon) {
  if (w.type !== 'ranged') return;
  const cost = w.ammoCost ?? 1;
  const mag = w.magAmmo ?? 0;
  const need = Math.max(0, (w.magCapacity ?? 0) - mag);
  const pool = actor.inventory.ammo[w.ammoType] ?? 0;
  const take = Math.min(need, pool);
  if (take > 0) {
    w.magAmmo = mag + take;
    actor.inventory.ammo[w.ammoType] = pool - take;
  }
}

export function consumeShot(actor: Actor, w: RangedWeapon) {
  const cost = w.ammoCost ?? 1;
  w.magAmmo = Math.max(0, (w.magAmmo ?? 0) - cost);
}
