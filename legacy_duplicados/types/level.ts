export type DayId = 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31;

export type DeckId = "decision" | "combat" | "explore";

export type DayRules = {
  // límites por jugador dentro del día
  decisionsPerPlayer: number; // p.ej. 2
  combatsPerPlayer: number;   // p.ej. 4
  exploresPerPlayer: number;  // p.ej. 5

  // duración del día (ms)
  dayDurationMs: number;      // ej 35 min => 35*60*1000 configurable

  // velocidad del reloj HUD (factor)
  timeScale?: number;         // multiplicador para animación/hud
};

export type DayDecks = {
  decisionIds: number[];  // IDs válidos del día (se barajan)
  combatIds: number[];
  exploreIds: number[];
};

export type PlayerTurnCounters = {
  playerId: string; // o nombre
  decisionsLeft: number;
  combatsLeft: number;
  exploresLeft: number;
};

export type DayState = {
  day: DayId;
  startedAt: number | null;     // epoch ms
  endsAt: number | null;        // epoch ms
  remainingMs: number;          // ms restantes (recalcula en tick)
  activeDecks: {
    decision: number[];         // barajado
    combat: number[];
    explore: number[];
  };
  usedDecks: {
    decision: number[];
    combat: number[];
    explore: number[];
  };
  currentPlayerIndex: number;
  turnCounters: PlayerTurnCounters[];
  isTurnGateOpen: boolean;      // muestra modal "Es el turno de: ..."
  activeExploreInstance?: { id: number; startedAt: number } | null; // para bloquear doble click en explorar
};

export type NarrativeFlags = Record<string, any>; // persistente entre días, p.ej. rutas, llaves, karma-rutas, etc.

export type LevelEndReason = "turns_exhausted" | "decks_exhausted" | "time_out";

export type LevelEvents =
  | { type: "DAY_STARTED"; day: DayId }
  | { type: "TURN_ENDED"; nextPlayerName: string }
  | { type: "DAY_ENDED"; day: DayId; reason: LevelEndReason };

export type LevelContextAPI = {
  // lectura
  dayState: DayState;
  flags: NarrativeFlags;
  rules: DayRules;

  // acciones
  initDay: (day: DayId, players: string[]) => void;
  drawCard: (deck: DeckId) => number | null; // retorna cardId o null si vacío
  markCardUsed: (deck: DeckId, cardId: number) => void;

  // contadores por acción
  spendDecision: (playerId: string) => void;
  spendCombat: (playerId: string) => void;
  spendExplore: (playerId: string) => void;
  startExploreInstance: (instanceId: number) => void;
  resolveExploreInstance: (instanceId: number) => void;

  // turnos
  openTurnGate: (playerIndex: number) => void;
  startTurn: () => void; // cierra gate
  endTurn: () => void;   // rota jugador y verifica fin de día

  // tiempo
  tick: (nowMs: number) => void; // reduce remainingMs y verifica fin de día

  // fin de día
  checkEndConditions: () => LevelEndReason | null;
  advanceToNextDay: (nextDay: DayId) => void;

  // flags narrativos
  setFlag: (key: string, value: any) => void;

  // eventos (para log)
  onEvent?: (evt: LevelEvents) => void;
};
