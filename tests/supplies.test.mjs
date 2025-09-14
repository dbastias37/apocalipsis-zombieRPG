import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeFoodFromPlayer, consumeMedicineFromPlayer, ensureRation, ensureMedkit, rationCount } from '../build/systems/supplies.js';

test('consumeFoodFromPlayer uses inventory then backpack', () => {
  const player = { inventory:[ensureRation({},2)], backpack:[ensureRation({},3)] };
  const { player: res, taken } = consumeFoodFromPlayer(player, 3);
  assert.equal(taken, 3);
  assert.equal(res.inventory.length, 0);
  assert.equal(rationCount(res.backpack[0]), 2);
});

test('consumeMedicineFromPlayer handles lack of stock', () => {
  const player = { inventory:[], backpack:[] };
  const { player: res, taken } = consumeMedicineFromPlayer(player, 2);
  assert.equal(taken, 0);
  assert.equal(res.inventory.length, 0);
});

test('consumeMedicineFromPlayer pulls from backpack', () => {
  const player = { inventory:[ensureMedkit({},1)], backpack:[ensureMedkit({},2)] };
  const { player: res, taken } = consumeMedicineFromPlayer(player, 3);
  assert.equal(taken, 3);
  assert.equal(res.inventory.length, 0);
  assert.equal(res.backpack.length, 0);
});
