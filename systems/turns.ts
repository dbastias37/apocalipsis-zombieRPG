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
  phase: 'player' | 'enemy';
  overlay: boolean; // usado solo para efectos visuales, no bloquea interacción
};

export function createTurnState(): TurnState {
  return { activeIndex: 0, turnNumber: 1, overlay: false, phase: 'player' };
}

/**
 * Avanza el turno por fases:
 * - player: recorre jugadores; al terminar → enemy (activeIndex=0)
 * - enemy:  recorre enemigos; al terminar → player (activeIndex=0, turnNumber++)
 */
export function nextTurn(turn: TurnState, playersLen: number, enemiesLen: number) {
  // Guardas por si se pasa 0 o negativos
  const pLen = Math.max(0, playersLen|0);
  const eLen = Math.max(0, enemiesLen|0);

  if (turn.phase === 'player') {
    // Si no hay jugadores, salta directo a enemigos
    if (pLen === 0) {
      turn.phase = 'enemy';
      turn.activeIndex = 0;
      return;
    }
    turn.activeIndex++;
    if (turn.activeIndex >= pLen) {
      turn.phase = 'enemy';
      turn.activeIndex = 0;
    }
    return;
  }

  // Fase 'enemy'
  if (eLen === 0) {
    // Si no hay enemigos, vuelve a jugadores nueva ronda
    turn.phase = 'player';
    turn.activeIndex = 0;
    turn.turnNumber += 1;
    return;
  }

  turn.activeIndex++;
  if (turn.activeIndex >= eLen) {
    turn.phase = 'player';
    turn.activeIndex = 0;
    turn.turnNumber += 1;
  }
}

/** Opcional: wrapper deprecado para compatibilidad; usar nextTurn en adelante */
export function nextPlayer(turn: TurnState, playersLen: number) {
  if (process && typeof console !== 'undefined') {
    console.warn('[DEPRECATION] nextPlayer() -> usa nextTurn(turn, playersLen, enemiesLen).');
  }
  // Comportamiento mínimo: avanza jugadores; si termina, pasa a fase enemigos.
  turn.activeIndex = (turn.activeIndex + 1) % Math.max(1, playersLen|0);
  if (turn.activeIndex === 0) {
    turn.phase = 'enemy';
  }
}

export function resetCupos(): PlayerCupos {
  return { ...DEFAULT_CUPOS };
}

