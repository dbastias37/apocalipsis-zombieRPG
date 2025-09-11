export type TurnState = {
  activeIndex: number;
  turnNumber: number;
  phase: 'player' | 'enemy';
};

export function initTurns(): TurnState {
  return { activeIndex: 0, turnNumber: 1, phase: 'player' };
}

export function nextTurn(turn: TurnState, playersLen: number, enemiesLen: number) {
  if (turn.phase === 'player') {
    turn.activeIndex++;
    if (turn.activeIndex >= Math.max(1, playersLen|0)) {
      turn.phase = 'enemy';
      turn.activeIndex = 0;
    }
    return;
  }
  // fase enemigos
  turn.activeIndex++;
  if (turn.activeIndex >= Math.max(1, enemiesLen|0)) {
    turn.phase = 'player';
    turn.activeIndex = 0;
    turn.turnNumber += 1;
  }
}
