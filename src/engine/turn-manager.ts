export interface TurnActor { id: string; hp: number; status?: string };

export function advanceTurn(order: string[], actors: Record<string, TurnActor>, current: number): number {
  let idx = current;
  const len = order.length;
  for (let i = 0; i < len; i++) {
    idx = (idx + 1) % len;
    const act = actors[order[idx]];
    if (act && act.hp > 0 && act.status !== 'dead' && act.status !== 'out') {
      return idx;
    }
  }
  return current;
}
