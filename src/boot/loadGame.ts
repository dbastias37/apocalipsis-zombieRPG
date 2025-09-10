export function normalizeSave(save: any) {
  if (save?.combat?.status === 'finished' && !(save.combat?.rounds?.length)) {
    save.combat = { status: 'idle', rounds: [], log: [], result: null };
  }
  return save;
}
