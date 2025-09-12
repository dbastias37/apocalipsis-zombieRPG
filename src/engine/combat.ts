import { findWeaponById, Weapon } from "../data/weapons.js";
import { spendAmmo, getLoadedAmmo } from "../systems/ammo.js";

export interface Actor {
  id: string;
  name: string;
  hp: number;
  def: number;
  ammoByWeapon?: Record<string, number>;
  inventory?: any[];
}

export interface AttackResult {
  hit: boolean;
  dmg: number;
  attacker: Actor;
  defender: Actor;
  log: string[];
}

function rollDamage(d: { times: number; faces: number; mod: number }, rng: () => number = Math.random): number {
  let total = 0;
  for (let i = 0; i < d.times; i++) {
    total += Math.floor(rng() * d.faces) + 1;
  }
  return total + (d.mod ?? 0);
}

export function attack(attacker: Actor, defender: Actor, weaponId: string, rng: () => number = Math.random, logFn: (m:string)=>void = () => {}): AttackResult {
  const weapon = findWeaponById(weaponId);
  if (!weapon) throw new Error("Unknown weapon");

  const logs: string[] = [];
  const roll = Math.floor(rng() * 20) + 1; // d20
  const total = roll + weapon.hitBonus;
  let hit = false;
  let dmg = 0;
  if (total >= defender.def) {
    hit = true;
    dmg = rollDamage(weapon.damage, rng);
    defender = { ...defender, hp: Math.max(0, defender.hp - dmg) };
    logs.push(`${attacker.name} acierta con ${weapon.name} (${dmg})`);
    if (defender.hp === 0) logs.push(`${defender.name} cae`);
  } else {
    logs.push(`${attacker.name} falla con ${weapon.name}`);
  }

  if (weapon.type === 'ranged' && weapon.ammoCost) {
    const res = spendAmmo(attacker, weapon.id, weapon.ammoCost);
    attacker = res.player;
    if (getLoadedAmmo(attacker, weapon.id) === 0) logs.push(`${weapon.name} sin munición`);
  }

  logs.forEach(logFn);
  return { hit, dmg, attacker, defender, log: logs };
}
