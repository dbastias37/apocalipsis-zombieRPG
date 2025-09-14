// @ts-nocheck
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spendAmmo, reloadSelectedWeapon, getLoadedAmmo } from '../ammo';
import { getSelectedWeapon } from '../weapons';

const samplePlayer = () => ({
  ammoByWeapon: { pistol9: 3 },
  inventory: [] as any[],
  currentWeaponId: 'pistol9',
});

test('spendAmmo reduces 1 and ok=true', () => {
  const p = samplePlayer();
  const { player: res, ok } = spendAmmo(p, 'pistol9');
  assert(ok);
  assert.equal(getLoadedAmmo(res, 'pistol9'), 2);
});

test('spendAmmo without ammo returns ok=false', () => {
  const p = samplePlayer();
  p.ammoByWeapon.pistol9 = 0;
  const { player: res, ok } = spendAmmo(p, 'pistol9');
  assert(!ok);
  assert.equal(getLoadedAmmo(res, 'pistol9'), 0);
});

test('reload fills magazine using loose and then box', () => {
  const state = {
    turn: { activeIndex: 0 },
    players: [
      {
        ammoByWeapon: { pistol9: 3 },
        inventory: [
          { type: 'ammo', amount: 5 },
          { type: 'ammo', kind: 'box', amount: 30 },
        ],
        currentWeaponId: 'pistol9',
      },
    ],
  };
  const next = reloadSelectedWeapon(state);
  const p = next.players[0];
  assert.equal(getLoadedAmmo(p, 'pistol9'), 12);
  assert.equal(p.inventory.length, 1);
  assert.equal(p.inventory[0].amount, 26);
});

test('reload never exceeds magSize', () => {
  const state = {
    turn: { activeIndex: 0 },
    players: [
      {
        ammoByWeapon: { pistol9: 11 },
        inventory: [ { type: 'ammo', amount: 10 } ],
        currentWeaponId: 'pistol9',
      },
    ],
  };
  const next = reloadSelectedWeapon(state);
  const p = next.players[0];
  assert.equal(getLoadedAmmo(p, 'pistol9'), 12);
});

test('getSelectedWeapon uses currentWeaponId before selectedWeaponId', () => {
  const p1 = { currentWeaponId: 'knife', selectedWeaponId: 'pistol9' };
  const p2 = { selectedWeaponId: 'pistol9' };
  assert.equal(getSelectedWeapon(p1).id, 'knife');
  assert.equal(getSelectedWeapon(p2).id, 'pistol9');
});
