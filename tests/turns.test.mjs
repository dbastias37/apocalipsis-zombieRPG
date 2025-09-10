import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  runBattleRound,
  rollEnemyTurns,
  applyPostCombat,
  runFullBattle,
  ENEMY_TURNS_ROLL_SIDES,
  POST_COMBAT_MIN_HP,
  POST_COMBAT_MIN_ENERGY,
} from '../build/engine/turns.js';

function createCtx(overrides) {
  const base = {
    allies: [],
    enemies: [],
    rng: { int: () => 0 },
    log: () => {},
    now: () => '00:00',
    allyAct: async () => {},
    enemyAct: async () => {},
  };
  return Object.assign(base, overrides);
}

test('enemy turn roll respects sides', () => {
  const ctx1 = createCtx({ rng: { int: () => 0 } });
  assert.equal(rollEnemyTurns(ctx1), 1);
  const ctx2 = createCtx({ rng: { int: () => ENEMY_TURNS_ROLL_SIDES - 1 } });
  assert.equal(rollEnemyTurns(ctx2), ENEMY_TURNS_ROLL_SIDES);
});

test('allies act in fixed order skipping dead', async () => {
  const order = [];
  const enemies = [{ id: 'e1', name: 'Z', hp: 3, maxHp: 3, baseCooldownMs: 0, actionCooldownMs: 0 }];
  const allies = [
    { id: 's', name: 'Sarah', hp: 1, maxHp: 1, baseCooldownMs: 0, actionCooldownMs: 0, energy: 1 },
    { id: 'm', name: 'Marcus', hp: 0, maxHp: 1, baseCooldownMs: 0, actionCooldownMs: 0, energy: 1 },
    { id: 'e', name: 'Elena', hp: 1, maxHp: 1, baseCooldownMs: 0, actionCooldownMs: 0, energy: 1 },
  ];
  const ctx = createCtx({ allies, enemies, allyAct: async (c, a) => { order.push(a.name); }, rng: { int: () => 0 } });
  await runBattleRound(ctx);
  assert.deepEqual(order, ['Sarah', 'Elena']);
});

test('post combat sets survivors to min values and ready', () => {
  const allies = [
    { id: 's', name: 'Sarah', hp: 5, maxHp: 5, baseCooldownMs: 0, actionCooldownMs: 0, energy: 10, status: 'down' },
    { id: 'm', name: 'Marcus', hp: 0, maxHp: 5, baseCooldownMs: 0, actionCooldownMs: 0, energy: 0, status: 'dead' },
  ];
  const ctx = createCtx({ allies });
  applyPostCombat(ctx);
  assert.equal(allies[0].status, 'ready');
  assert.equal(allies[0].hp, POST_COMBAT_MIN_HP);
  assert.equal(allies[0].energy, POST_COMBAT_MIN_ENERGY);
  assert.equal(allies[1].status, 'dead');
});

test('full battle ends when enemies dead', async () => {
  const allies = [{ id: 's', name: 'Sarah', hp: 2, maxHp: 2, baseCooldownMs: 0, actionCooldownMs: 0, energy: 2 }];
  const enemies = [{ id: 'e1', name: 'Z', hp: 1, maxHp: 1, baseCooldownMs: 0, actionCooldownMs: 0 }];
  const ctx = createCtx({ allies, enemies, allyAct: async (c, a) => { c.enemies[0].hp = 0; }, enemyAct: async () => {}, rng: { int: () => 0 } });
  await runFullBattle(ctx);
  assert.equal(enemies[0].hp, 0);
  assert.equal(allies[0].hp, POST_COMBAT_MIN_HP);
});

test('full battle ends when allies down', async () => {
  const allies = [{ id: 's', name: 'Sarah', hp: 1, maxHp: 1, baseCooldownMs: 0, actionCooldownMs: 0, energy: 1 }];
  const enemies = [{ id: 'e1', name: 'Z', hp: 3, maxHp: 3, baseCooldownMs: 0, actionCooldownMs: 0 }];
  const ctx = createCtx({ allies, enemies, allyAct: async () => {}, enemyAct: async (c, e) => { c.allies[0].hp = 0; }, rng: { int: () => 0 } });
  await runFullBattle(ctx);
  assert.equal(allies[0].hp, 0);
});
