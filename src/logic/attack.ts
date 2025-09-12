import { RootState, Actor, Weapon } from '../types/combat.js';
import { damageRange } from './combatUtils.js';
import { advanceTurn } from './turns.js';
import { spendAmmo } from '../systems/ammo.js';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function performAttack(state: RootState, attackerId: string, targetId: string) {
  const a = state.actors.find(x => x.id === attackerId)!;
  const t = state.actors.find(x => x.id === targetId)!;
  const w = (a.equipped ?? a.inventory.weapons[0]) as Weapon;

  if (!a.alive || !t.alive) {
    pushLog(state, 'Objetivo inválido');
    return;
  }

  if (w.type === 'ranged') {
    const res = spendAmmo(a, w.id, w.ammoCost ?? 1);
    if (!res.ok) {
      pushLog(state, 'Sin munición');
      advanceTurn(state);
      return;
    }
    Object.assign(a, res.player);
    const { min, max } = damageRange(w.damage);
    const dmg = rand(min, max);
    t.hp = Math.max(0, t.hp - dmg);
    if (t.hp === 0) t.alive = false;
    pushLog(state, `${a.name} dispara ${w.name} e inflige ${dmg}`);
  } else {
    const { min, max } = damageRange(w.damage);
    const dmg = rand(min, max);
    t.hp = Math.max(0, t.hp - dmg);
    if (t.hp === 0) t.alive = false;
    pushLog(state, `${a.name} golpea con ${w.name} e inflige ${dmg}`);
  }

  checkEndOfCombat(state);
  advanceTurn(state);
}

export function performDefend(state: RootState, actorId: string) {
  pushLog(state, 'Defiende: +DEF este turno');
  advanceTurn(state);
}

export function performHeal(state: RootState, actorId: string) {
  const a = state.actors.find(x => x.id === actorId)!;
  const heal = 3;
  a.hp = Math.min(a.maxHp, a.hp + heal);
  pushLog(state, `${a.name} se cura ${heal}`);
  advanceTurn(state);
}

export function performFlee(state: RootState) {
  pushLog(state, 'El grupo huye del enfrentamiento');
  state.combat = { status: 'idle', rounds: [], log: [], result: null };
}

function pushLog(state: RootState, msg: string) {
  state.combat.log.push(msg);
}

function checkEndOfCombat(state: RootState) {
  const enemiesAlive = getEncounterEnemies(state).some(e => e.hp > 0 && e.alive);
  if (!enemiesAlive) {
    state.combat.status = 'finished';
    state.combat.result = { victory: true, loot: calcLoot(state) };
  }
}

function getEncounterEnemies(state: RootState): Actor[] {
  return state.actors.filter(a => (a as any).enemy);
}

function calcLoot(state: RootState) {
  return [] as any[];
}
