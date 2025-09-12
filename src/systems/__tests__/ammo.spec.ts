// @ts-nocheck
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spendAmmo, reloadSelectedWeapon, getLoadedAmmo } from '../ammo.js';
import { getSelectedWeapon } from '../weapons.js';

const samplePlayer = () => ({
  ammoByWeapon: { pistol: 3 },
  inventory: [] as any[],
  currentWeaponId: 'pistol',
});

test('spendAmmo reduces 1 and ok=true', () => {
  const p = samplePlayer();
  const { player: res, ok } = spendAmmo(p, 'pistol');
  assert(ok);
  assert.equal(getLoadedAmmo(res, 'pistol'), 2);
});

test('spendAmmo without ammo returns ok=false', () => {
  const p = samplePlayer();
  p.ammoByWeapon.pistol = 0;
  const { player: res, ok } = spendAmmo(p, 'pistol');
  assert(!ok);
  assert.equal(getLoadedAmmo(res, 'pistol'), 0);
});

test('reload fills magazine using loose and then box', () => {
  const state = {
    turn: { activeIndex: 0 },
    players: [
      {
        ammoByWeapon: { rifle: 3 },
        inventory: [
          { type: 'ammo', amount: 5 },
          { type: 'ammo', kind: 'box', amount: 30 },
        ],
        currentWeaponId: 'rifle',
      },
    ],
  };
  const next = reloadSelectedWeapon(state);
  const p = next.players[0];
  assert.equal(getLoadedAmmo(p, 'rifle'), 10);
  assert.equal(p.inventory.length, 1);
  assert.equal(p.inventory[0].amount, 28);
});

test('reload never exceeds magSize', () => {
  const state = {
    turn: { activeIndex: 0 },
    players: [
      {
        ammoByWeapon: { rifle: 9 },
        inventory: [ { type: 'ammo', amount: 10 } ],
        currentWeaponId: 'rifle',
      },
    ],
  };
  const next = reloadSelectedWeapon(state);
  const p = next.players[0];
  assert.equal(getLoadedAmmo(p, 'rifle'), 10);
});

test('getSelectedWeapon uses currentWeaponId before selectedWeaponId', () => {
  const p1 = { currentWeaponId: 'rifle', selectedWeaponId: 'pistol' };
  const p2 = { selectedWeaponId: 'pistol' };
  assert.equal(getSelectedWeapon(p1).id, 'rifle');
  assert.equal(getSelectedWeapon(p2).id, 'pistol');
});
