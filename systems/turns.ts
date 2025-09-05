export type PlayerCupos = {
  decisionsLeft: number;
  battlesLeft: number;
  explorationsLeft: number;
};

export const DEFAULT_CUPOS: PlayerCupos = {
  decisionsLeft: 2,
  battlesLeft: 4,
  explorationsLeft: 5,
};

export type TurnState = {
  activeIndex: number;
  turnNumber: number;
  overlay: boolean;
};

export function createTurnState(): TurnState {
  return { activeIndex: 0, turnNumber: 1, overlay: true };
}

export function resetCupos(): PlayerCupos {
  return { ...DEFAULT_CUPOS };
}

export function nextPlayer(turn: TurnState, playersLen: number) {
  turn.activeIndex = (turn.activeIndex + 1) % playersLen;
  if (turn.activeIndex === 0) turn.turnNumber += 1;
  turn.overlay = true;
}
