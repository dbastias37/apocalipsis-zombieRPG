import { CombatActor, isAlive } from "../systems/combat";
import { ACTION_TIME_COSTS } from "../config/time";

export interface RNG {
  int: (max: number) => number; // 0..max-1
}

export interface Ally extends CombatActor {
  status?: string;
  energy: number;
}

export type Enemy = CombatActor;

export interface CombatContext {
  allies: Ally[];
  enemies: Enemy[];
  rng: RNG;
  log: (msg: string) => void;
  now: () => string;
  allyAct: (ctx: CombatContext, ally: Ally) => Promise<void> | void;
  enemyAct: (ctx: CombatContext, enemy: Enemy) => Promise<void> | void;
  applyTimeCost?: (seconds: number) => void;
}

export const ENEMY_TURNS_ROLL_SIDES = 2;
export const POST_COMBAT_MIN_HP = 1;
export const POST_COMBAT_MIN_ENERGY = 1;

export async function runBattleRound(ctx: CombatContext) {
  await runAlliesPhase(ctx);
  if (allEnemiesDead(ctx) || allAlliesDown(ctx)) return;
  ctx.log(`[${ctx.now()}] Terminan los turnos de tu equipo: Sarah → Marcus → Elena. Ahora atacan los enemigos…`);
  const nEnemyTurns = rollEnemyTurns(ctx);
  await runEnemiesPhase(ctx, nEnemyTurns);
  ctx.applyTimeCost?.(ACTION_TIME_COSTS.battle);
  ctx.log(`[${ctx.now()}] Fin de ronda.`);
}

export async function runFullBattle(ctx: CombatContext) {
  ctx.log(`[${ctx.now()}] Comienza el turno de tu equipo…`);
  while (!allEnemiesDead(ctx) && !allAlliesDown(ctx)) {
    await runBattleRound(ctx);
    if (allEnemiesDead(ctx) || allAlliesDown(ctx)) break;
    ctx.log(`[${ctx.now()}] Comienza el turno de tu equipo…`);
  }
  showBattleSummary(ctx);
  applyPostCombat(ctx);
}

async function runAlliesPhase(ctx: CombatContext) {
  const order = ["Sarah", "Marcus", "Elena"];
  for (const name of order) {
    const ally = findAliveAlly(ctx, name);
    if (!ally) continue;
    await ctx.allyAct(ctx, ally);
    if (allEnemiesDead(ctx)) break;
  }
}

export function rollEnemyTurns(ctx: CombatContext): number {
  return 1 + ctx.rng.int(ENEMY_TURNS_ROLL_SIDES);
}

async function runEnemiesPhase(ctx: CombatContext, n: number) {
  for (let i = 0; i < n; i++) {
    ctx.log(`[${ctx.now()}] Turno enemigo ${i + 1}/${n}.`);
    for (const enemy of getAliveEnemies(ctx)) {
      await ctx.enemyAct(ctx, enemy);
      if (allAlliesDown(ctx)) break;
    }
    if (allAlliesDown(ctx) || allEnemiesDead(ctx)) break;
  }
}

function getAliveEnemies(ctx: CombatContext) {
  return ctx.enemies.filter(isAlive);
}

function findAliveAlly(ctx: CombatContext, name: string) {
  return ctx.allies.find(a => a.name === name && isAlive(a));
}

function allEnemiesDead(ctx: CombatContext) {
  return ctx.enemies.every(e => !isAlive(e));
}

function allAlliesDown(ctx: CombatContext) {
  return ctx.allies.every(a => !isAlive(a));
}

function showBattleSummary(ctx: CombatContext) {
  ctx.log(`[${ctx.now()}] Fin del combate.`);
}

export function applyPostCombat(ctx: CombatContext) {
  for (const a of ctx.allies) {
    if (a.hp > 0) {
      a.status = "ready";
      a.hp = POST_COMBAT_MIN_HP;
      a.energy = POST_COMBAT_MIN_ENERGY;
    }
  }
}
