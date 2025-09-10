import { Actor, Weapon } from '../types/combat.js';
import { ensureLoaded } from './combatUtils.js';

export function equipWeapon(actor: Actor, w: Weapon) {
  actor.equipped = w;
  ensureLoaded(actor, w);
}
