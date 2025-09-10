export function advanceTurn(state: any) {
  const actors = state.actors.filter((a: any) => a.alive && a.hp > 0 && a.status !== 'down');
  if (actors.length === 0) return; // derrota
  const idx = Math.max(0, actors.findIndex((a: any) => a.id === state.activeId));
  const next = actors[(idx + 1) % actors.length];
  state.activeId = next.id;
}
