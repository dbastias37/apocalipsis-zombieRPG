export type TimeState = {
  day: number;
  dayClockMs: number;
  dayLengthMs: number;
  tickIntervalMs: number;
};

export const DAY_LENGTH_MINUTES = 20;
export const DEFAULT_TICK_MS = 500;

export const ACTION_TIME_COSTS = {
  explore: 30_000,
  battle: 20_000,
  decision: 10_000,
};

export function createTimeState(): TimeState {
  return {
    day: 1,
    dayClockMs: DAY_LENGTH_MINUTES * 60_000,
    dayLengthMs: DAY_LENGTH_MINUTES * 60_000,
    tickIntervalMs: DEFAULT_TICK_MS,
  };
}

export function tickTime(state: TimeState) {
  state.dayClockMs = Math.max(0, state.dayClockMs - state.tickIntervalMs);
}

export function applyTimeCost(state: TimeState, kind: keyof typeof ACTION_TIME_COSTS) {
  state.dayClockMs = Math.max(0, state.dayClockMs - ACTION_TIME_COSTS[kind]);
}

export function shouldAdvanceDay(state: TimeState) {
  return state.dayClockMs <= 0;
}

export function advanceDay(state: TimeState) {
  state.day += 1;
  state.dayClockMs = state.dayLengthMs;
}
