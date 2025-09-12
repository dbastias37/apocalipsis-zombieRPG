import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAvailableWeapons } from '../build/systems/combat/getAvailableWeapons.js';
import { attack } from '../build/engine/combat.js';
import { advanceTurn } from '../build/engine/turn-manager.js';
import { Log } from '../build/ui/log.js';

function fixedRng(vals) {
  let i = 0;
  return () => vals[i++ % vals.length];
}

// 1. Damage ranges in UI

test('Daños correctos en UI', () => {
  const player = { inventory: ['pistol','rifle'], ammoByWeapon: { pistol:10, rifle:5 } };
  const opts = getAvailableWeapons(player);
  const fists = opts.find(o=>o.id==='fists');
  const pistol = opts.find(o=>o.id==='pistol');
  const rifle = opts.find(o=>o.id==='rifle');
  assert.equal(fists.label, 'Puños (1-4)');
  assert.equal(pistol.label, 'Pistola (5-10) — Munición: 10/15');
  assert.equal(rifle.label, 'Rifle (5-12) — Munición: 5/10');
});

// 2. Attack applies damage

test('Ataque aplica daño', () => {
  const atk = { id:'a', name:'Heroe', hp:10, def:10 };
  const def = { id:'z', name:'Zombi', hp:10, def:10 };
  const rngHit = fixedRng([0.9, 0.5]);
  const resHit = attack(atk, def, 'fists', rngHit);
  assert(resHit.hit);
  assert(resHit.defender.hp < 10);
  const dmg = 10 - resHit.defender.hp;
  assert(dmg >=1 && dmg <=4);
  const rngMiss = fixedRng([0.1]);
  const def2 = { id:'z2', name:'Zombi', hp:10, def:10 };
  const resMiss = attack(atk, def2, 'fists', rngMiss);
  assert(!resMiss.hit);
  assert.equal(resMiss.defender.hp, 10);
});

// 3. Ammo consumption

test('Munición se consume y deshabilita arma', () => {
  let atk = { id:'a', name:'Heroe', hp:10, def:10, ammoByWeapon:{ pistol:3 }, inventory:['pistol'] };
  let def = { id:'z', name:'Zombi', hp:10, def:10 };
  const rng = fixedRng([0.9,0.5]);
  let res = attack(atk, def, 'pistol', rng);
  assert.equal(res.attacker.ammoByWeapon.pistol,2);
  res = attack(res.attacker, res.defender, 'pistol', fixedRng([0.9,0.5]));
  res = attack(res.attacker, res.defender, 'pistol', fixedRng([0.9,0.5]));
  assert.equal(res.attacker.ammoByWeapon.pistol,0);
  const opts = getAvailableWeapons(res.attacker);
  const pistolOpt = opts.find(o=>o.id==='pistol');
  assert(pistolOpt.label.includes('(Sin munición)'));
  assert.equal(pistolOpt.usable, false);
});

// 4. Turn advance without Enter

test('Avanza turno sin Enter y salta muertos', () => {
  const actors = { a:{hp:5}, b:{hp:0}, c:{hp:3} };
  const order = ['a','b','c'];
  const next = advanceTurn(order, actors, 0);
  assert.equal(next,2);
});

// 5. Log non-blocking

test('Log push no bloquea', () => {
  const log = new Log();
  log.push('hola');
  log.push('auto', {autoAdvanceMs:100});
  assert.equal(log.entries.length,2);
  assert.equal(log.entries[1].autoAdvanceMs,100);
});
