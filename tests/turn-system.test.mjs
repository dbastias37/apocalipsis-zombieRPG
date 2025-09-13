import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TurnSystem } from '../build/engine/turn-system.js';
import { attack } from '../build/engine/combat.js';

function fixedRng(vals) {
  let i = 0;
  return () => vals[i++ % vals.length];
}

function baseActors() {
  return {
    a: { id:'a', name:'A', hp:10, def:10, canCounter:true, status:'alive' },
    b: { id:'b', name:'B', hp:10, def:10, canCounter:true, status:'alive' },
    c: { id:'c', name:'C', hp:10, def:10, canCounter:true, status:'alive' },
  };
}

async function doAttack(ts, atkId, defId, rng) {
  await ts.execute(() => {
    const atk = ts.actors[atkId];
    const def = ts.actors[defId];
    const res = attack(atk, def, 'fists', rng);
    ts.actors[atkId] = res.attacker;
    ts.actors[defId] = res.defender;
    if (res.defender.hp > 0 && ts.actors[defId].canCounter) {
      ts.enqueueReaction(() => {
        const r2 = attack(ts.actors[defId], ts.actors[atkId], 'fists', rng);
        ts.actors[defId] = r2.attacker;
        ts.actors[atkId] = r2.defender;
      });
      ts.registerCounterAttack(defId);
    }
  });
}

test('A ataca a B sin contraataque → próximo es B', async () => {
  const rng = fixedRng([0.9,0.5]);
  const actors = baseActors();
  actors.b.canCounter = false;
  const ts = new TurnSystem(['a','b','c'], actors);
  ts.startTurn();
  await doAttack(ts,'a','b',rng);
  ts.endTurn();
  assert.equal(ts.currentActor().id, 'b');
});

test('contraataque consume turno del defensor', async () => {
  const rng = fixedRng([0.9,0.5, 0.9,0.5]);
  const actors = baseActors();
  const ts = new TurnSystem(['a','b','c'], actors);
  ts.startTurn();
  await doAttack(ts,'a','b',rng);
  ts.endTurn();
  assert.equal(ts.currentActor().id, 'c');
});

test('sin contraataque porque B muere', async () => {
  const rng = fixedRng([0.9,0.9]);
  const actors = baseActors();
  actors.b.hp = 3;
  const ts = new TurnSystem(['a','b','c'], actors);
  ts.startTurn();
  await doAttack(ts,'a','b',rng);
  ts.endTurn();
  assert.equal(ts.currentActor().id, 'c');
});

test('beginCombat y tryFlee', () => {
  const actors = baseActors();
  const ts = new TurnSystem(['a','b'], actors);
  ts.beginCombat({ enemies: [], active: true });
  assert.equal(ts.phase, 'combat');
  const orig = Math.random;
  Math.random = () => 0; // fuerza éxito
  const fled = ts.tryFlee();
  Math.random = orig;
  assert.equal(fled, true);
  assert.equal(ts.phase, 'world');
});
