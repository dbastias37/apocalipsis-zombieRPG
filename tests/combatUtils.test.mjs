import { test } from 'node:test';
import assert from 'node:assert/strict';
import { damageRange } from '../build/logic/combatUtils.js';

// legacy helpers no longer needed

test('damageRange computes min and max', () => {
  const { min, max } = damageRange({ times:1, faces:6, mod:4 });
  assert.equal(min, 5);
  assert.equal(max, 10);
});

