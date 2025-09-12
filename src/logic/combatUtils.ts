import { DiceSpec } from '../types/combat.js';

export function damageRange(d: DiceSpec) {
  const times = d.times ?? 1;
  const faces = d.faces ?? 6;
  const mod = d.mod ?? 0;
  return {
    min: times * 1 + mod,
    max: times * faces + mod,
  };
}

