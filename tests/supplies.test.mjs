import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeFoodFromPlayer, consumeMedicineFromPlayer } from '../build/systems/supplies.js';

test('consumeFoodFromPlayer uses inventory then backpack', () => {
  const player = { inventory:[{ type:'ration', food:2 }], backpack:[{ type:'ration', food:3 }] };
  const { player: res, taken } = consumeFoodFromPlayer(player, 3);
  assert.equal(taken, 3);
  assert.equal(res.inventory.length, 0);
  assert.equal(res.backpack[0].food, 2);
});

test('consumeMedicineFromPlayer handles lack of stock', () => {
  const player = { inventory:[], backpack:[] };
  const { player: res, taken } = consumeMedicineFromPlayer(player, 2);
  assert.equal(taken, 0);
  assert.equal(res.inventory.length, 0);
});

test('consumeMedicineFromPlayer pulls from backpack', () => {
  const player = { inventory:[{ type:'medkit', medicines:1 }], backpack:[{ type:'medkit', medicines:2 }] };
  const { player: res, taken } = consumeMedicineFromPlayer(player, 3);
  assert.equal(taken, 3);
  assert.equal(res.inventory.length, 0);
  assert.equal(res.backpack.length, 0);
});
