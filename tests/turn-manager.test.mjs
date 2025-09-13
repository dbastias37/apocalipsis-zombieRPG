import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TurnManager } from '../build/engine/turn-manager.js';
import { attack } from '../build/engine/combat.js';

function fixedRng(vals) {
  let i = 0;
  return () => vals[i++ % vals.length];
}

function baseActors() {
  return {
    a: { id:'a', name:'A', hp:10, def:10, canCounter:true },
    b: { id:'b', name:'B', hp:10, def:10, canCounter:true },
    c: { id:'c', name:'C', hp:10, def:10, canCounter:true },
  };
}

async function doAttack(tm, atkId, defId, rng) {
  const atk = tm.actors[atkId];
  const def = tm.actors[defId];
  const res = attack(atk, def, 'fists', rng);
  tm.actors[atkId] = res.attacker;
  tm.actors[defId] = res.defender;
  if (res.defender.hp > 0 && res.defender.canCounter) {
    tm.actors[defId].canCounter = false;
    tm.enqueueReaction(() => {
      const r2 = attack(tm.actors[defId], tm.actors[atkId], 'fists', rng);
      tm.actors[defId] = r2.attacker;
      tm.actors[atkId] = r2.defender;
    });
  }
}

test('avanza turno tras contraataque (hit)', async () => {
  const rng = fixedRng([0.9,0.5, 0.9,0.5]);
  const actors = baseActors();
  const tm = new TurnManager(['a','b','c'], actors);
  await tm.execute(() => doAttack(tm,'a','b',rng));
  assert.equal(tm.currentActor().id, 'b');
});

test('avanza turno tras contraataque (miss/bloqueo)', async () => {
  const rng = fixedRng([0.9,0.5, 0.1]);
  const actors = baseActors();
  const tm = new TurnManager(['a','b','c'], actors);
  await tm.execute(() => doAttack(tm,'a','b',rng));
  assert.equal(tm.currentActor().id, 'b');
});

test('no contraataca si el defensor muere', async () => {
  const rng = fixedRng([0.9,0.9]);
  const actors = baseActors();
  actors.b.hp = 3;
  const tm = new TurnManager(['a','b','c'], actors);
  await tm.execute(() => doAttack(tm,'a','b',rng));
  assert.equal(tm.currentActor().id, 'c');
});
