import type { RootState } from '../types/combat.js';

export function advanceTurn(state: RootState) {
  const vivos = state.actors.filter(a => a.alive && a.hp > 0 && a.status !== 'down');
  if (vivos.length === 0) {
    state.combat = { status: 'finished', rounds: [], log: state.combat.log, result: { victory: false, loot: [] } };
    return;
  }
  const idx = Math.max(0, vivos.findIndex(v => v.id === state.combat.activeId));
  const next = vivos[(idx + 1) % vivos.length];
  state.combat.activeId = next.id;
}
