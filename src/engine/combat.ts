import { findWeaponById, rollDamage, Weapon } from "../game/items/weapons.js";

export interface Actor {
  id: string;
  name: string;
  hp: number;
  def: number;
  weaponState?: Record<string, { ammoInMag: number }>;
  inventory?: any[];
}

export interface AttackResult {
  hit: boolean;
  dmg: number;
  attacker: Actor;
  defender: Actor;
  log: string[];
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
    const table = { ...(attacker.weaponState ?? {}) };
    const cur = table[weapon.id] ?? { ammoInMag: 0 };
    cur.ammoInMag = Math.max(0, cur.ammoInMag - weapon.ammoCost);
    table[weapon.id] = cur;
    attacker = { ...attacker, weaponState: table };
    if (cur.ammoInMag === 0) logs.push(`${weapon.name} sin munición`);
  }

  logs.forEach(logFn);
  return { hit, dmg, attacker, defender, log: logs };
}
