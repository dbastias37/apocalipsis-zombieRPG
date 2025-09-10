export function resetCombat(state: any) {
  state.combat = { status: 'idle', rounds: [], log: [], result: null };
}
