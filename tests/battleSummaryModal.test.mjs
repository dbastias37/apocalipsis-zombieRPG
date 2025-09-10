import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldShow } from '../build/ui/BattleSummaryModal.js';

test('shouldShow false when not finished', () => {
  const state = { combat: { status: 'idle', rounds: [], result: null } };
  assert.equal(shouldShow(state), false);
});

test('shouldShow true when finished with rounds and result', () => {
  const state = { combat: { status: 'finished', rounds: [1], result: { winner: 'a' } } };
  assert.equal(shouldShow(state), true);
});

