export type TimeState = {
  day: number;
  dayClockMs: number;
  dayLengthMs: number;
  tickIntervalMs: number;
};

import { DAY_LENGTH_MS, DEFAULT_TICK_MS, ACTION_TIME_COSTS_MS } from "../config/time";

export function createTimeState(): TimeState {
  return {
    day: 1,
    dayClockMs: DAY_LENGTH_MS,
    dayLengthMs: DAY_LENGTH_MS,
    tickIntervalMs: DEFAULT_TICK_MS,
  };
}

export function tickTime(state: TimeState) {
  state.dayClockMs = Math.max(0, state.dayClockMs - state.tickIntervalMs);
}

export function applyTimeCost(state: TimeState, kind: keyof typeof ACTION_TIME_COSTS_MS) {
  state.dayClockMs = Math.max(0, state.dayClockMs - ACTION_TIME_COSTS_MS[kind]);
}

export function shouldAdvanceDay(state: TimeState) {
  return state.dayClockMs <= 0;
}

export function advanceDay(state: TimeState) {
  state.day += 1;
  state.dayClockMs = state.dayLengthMs;
}
