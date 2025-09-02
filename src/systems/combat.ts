export type CombatActor = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  baseCooldownMs: number;
  actionCooldownMs: number;
  isDefending?: boolean;
};

export const ENEMY_CRIT_RATE_ON_PLAYER_PASSIVE = 0.5;
export const CRIT_MULTIPLIER = 1.5;
export const DEFEND_REDUCTION = 0.35;

export function isAlive(a: CombatActor) {
  return a.hp > 0;
}

export function setCooldown(a: CombatActor) {
  a.actionCooldownMs = a.baseCooldownMs;
}

export function tickCooldown(a: CombatActor, deltaMs: number) {
  a.actionCooldownMs = Math.max(0, a.actionCooldownMs - deltaMs);
}

export function dealDamage(target: CombatActor, base: number, crit = false, defending = false) {
  let dmg = crit ? Math.round(base * CRIT_MULTIPLIER) : base;
  if (defending) dmg = Math.max(0, Math.round(dmg * (1 - DEFEND_REDUCTION)));
  target.hp = Math.max(0, target.hp - dmg);
  return dmg;
}

export function enemyImmediateStrike(enemy: CombatActor, player: CombatActor, baseDamage: number) {
  const crit = Math.random() < ENEMY_CRIT_RATE_ON_PLAYER_PASSIVE;
  const dmg = dealDamage(player, baseDamage, crit, !!player.isDefending);
  return { crit, dmg };
}
