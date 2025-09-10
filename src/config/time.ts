/**
 * Global time configuration for the 24h coherence patch.
 * All durations are expressed in seconds unless stated otherwise.
 */
export const COHERENCE_PATCH_2025_09 = true;

export const HOURS_PER_DAY = 24;
export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE; // 86400
export const DAY_LENGTH_MS = SECONDS_PER_DAY * 1000;

// Default tick interval for timers that operate in real time
export const DEFAULT_TICK_MS = 1000; // 1 second per tick for clarity

// Action time costs in seconds
export const ACTION_TIME_COSTS = {
  explore: 60 * 60,      // 1 hour
  battle: 60,            // 1 minute per combat action
  decision: 5 * 60,      // 5 minutes per decision
  heal: 10 * 60,         // 10 minutes to heal
  defend: 60,            // 1 minute to defend
  flee: 45 * 60,         // 45 minutes to flee combat
} as const;

// Helper converting action costs to milliseconds
export const ACTION_TIME_COSTS_MS: Record<keyof typeof ACTION_TIME_COSTS, number> = Object.fromEntries(
  Object.entries(ACTION_TIME_COSTS).map(([k,v]) => [k, v * 1000])
) as any;
