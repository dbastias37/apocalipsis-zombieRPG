export function ensureCombatState(state: any) {
  if (!state.combat) {
    state.combat = { status: 'idle', rounds: [], log: [], result: null };
  }
  if (state.combat.status === 'finished' && (!state.combat.rounds?.length || !state.combat.result)) {
    state.combat = { status: 'idle', rounds: [], log: [], result: null };
  }
}

export function resetCombat(state: any) {
  state.combat = { status: 'idle', rounds: [], log: [], result: null };
}

export const closeSummary = resetCombat;
