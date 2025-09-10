import { test } from 'node:test';
import assert from 'node:assert/strict';
import { damageRange, ensureLoaded, consumeShot } from '../build/logic/combatUtils.js';

const sampleActor = () => ({
  id: 'a',
  name: 'Actor',
  hp: 10,
  maxHp: 10,
  alive: true,
  inventory: { ammo: { '9mm': 10 }, weapons: [] }
});

const sampleWeapon = () => ({
  id: 'p',
  name: 'Pistol',
  type: 'ranged',
  damage: { times:1, faces:6, mod:4 },
  ammoType: '9mm',
  magCapacity: 15,
  magAmmo: 0,
});

test('damageRange computes min and max', () => {
  const { min, max } = damageRange({ times:1, faces:6, mod:4 });
  assert.equal(min, 5);
  assert.equal(max, 10);
});

test('ensureLoaded moves ammo from pool to magazine', () => {
  const actor = sampleActor();
  const weapon = sampleWeapon();
  ensureLoaded(actor, weapon);
  assert.equal(weapon.magAmmo, 10);
  assert.equal(actor.inventory.ammo['9mm'], 0);
});

test('consumeShot reduces magazine only', () => {
  const actor = sampleActor();
  const weapon = sampleWeapon();
  weapon.magAmmo = 3;
  consumeShot(weapon);
  assert.equal(weapon.magAmmo, 2);
  assert.equal(actor.inventory.ammo['9mm'], 10);
});
