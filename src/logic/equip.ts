import { Actor, Weapon } from '../types/combat.js';

export function equipWeapon(actor: Actor, w: Weapon) {
  actor.equipped = w;
}
