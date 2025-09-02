// src/data/days/dayConfigs.ts
import type { DayId, DayRules, DayDecks } from "@/types/level";

// IMPORTA mazos existentes
// Ajusta las rutas reales:
// Sustituye el mazo global por el específico del Día 1
import { day1DecisionCards } from "@/data/days/day1/decisionCards.day1";
import { combatCards } from "@/data/combatCards";

// Exploración: usa el archivo que tengas. Si no existe, crea src/data/explorationNodes.ts con export const explorationNodes = [{id:1},...]
import { explorationNodes } from "@/data/explorationNodes"; // ADAPTA si se llama distinto

const ids = <T extends { id: number }>(arr: T[]) => arr.map(a => a.id);

// Reglas por defecto (pueden cambiar por día luego)
export const defaultDayRules: DayRules = {
  decisionsPerPlayer: 2,
  combatsPerPlayer: 4,
  exploresPerPlayer: 5,
  dayDurationMs: 35 * 60 * 1000,
  timeScale: 1.0,
};

// Día 1 usa su propio mazo de decisiones
export const dayDecksById: Record<DayId, DayDecks> = {
  1: {
    decisionIds: ids(day1DecisionCards),          // ← ahora usa el mazo del Día 1
    combatIds: ids(combatCards),
    exploreIds: explorationNodes ? ids(explorationNodes as any) : [],
  },
  // Resto de días: deja arrays vacíos por ahora (se llenarán después)
  2: { decisionIds: [], combatIds: [], exploreIds: [] },
  3: { decisionIds: [], combatIds: [], exploreIds: [] },
  4: { decisionIds: [], combatIds: [], exploreIds: [] },
  5: { decisionIds: [], combatIds: [], exploreIds: [] },
  6: { decisionIds: [], combatIds: [], exploreIds: [] },
  7: { decisionIds: [], combatIds: [], exploreIds: [] },
  8: { decisionIds: [], combatIds: [], exploreIds: [] },
  9: { decisionIds: [], combatIds: [], exploreIds: [] },
  10:{ decisionIds: [], combatIds: [], exploreIds: [] },
  11:{ decisionIds: [], combatIds: [], exploreIds: [] },
  12:{ decisionIds: [], combatIds: [], exploreIds: [] },
  13:{ decisionIds: [], combatIds: [], exploreIds: [] },
  14:{ decisionIds: [], combatIds: [], exploreIds: [] },
  15:{ decisionIds: [], combatIds: [], exploreIds: [] },
  16:{ decisionIds: [], combatIds: [], exploreIds: [] },
  17:{ decisionIds: [], combatIds: [], exploreIds: [] },
  18:{ decisionIds: [], combatIds: [], exploreIds: [] },
  19:{ decisionIds: [], combatIds: [], exploreIds: [] },
  20:{ decisionIds: [], combatIds: [], exploreIds: [] },
  21:{ decisionIds: [], combatIds: [], exploreIds: [] },
  22:{ decisionIds: [], combatIds: [], exploreIds: [] },
  23:{ decisionIds: [], combatIds: [], exploreIds: [] },
  24:{ decisionIds: [], combatIds: [], exploreIds: [] },
  25:{ decisionIds: [], combatIds: [], exploreIds: [] },
  26:{ decisionIds: [], combatIds: [], exploreIds: [] },
  27:{ decisionIds: [], combatIds: [], exploreIds: [] },
  28:{ decisionIds: [], combatIds: [], exploreIds: [] },
  29:{ decisionIds: [], combatIds: [], exploreIds: [] },
  30:{ decisionIds: [], combatIds: [], exploreIds: [] },
  31:{ decisionIds: [], combatIds: [], exploreIds: [] },
};

// Reglas por día (por ahora todos = default)
export const dayRulesById: Record<DayId, DayRules> = {
  1: { ...defaultDayRules },
  2: { ...defaultDayRules },
  3: { ...defaultDayRules },
  4: { ...defaultDayRules },
  5: { ...defaultDayRules },
  6: { ...defaultDayRules },
  7: { ...defaultDayRules },
  8: { ...defaultDayRules },
  9: { ...defaultDayRules },
  10:{ ...defaultDayRules },
  11:{ ...defaultDayRules },
  12:{ ...defaultDayRules },
  13:{ ...defaultDayRules },
  14:{ ...defaultDayRules },
  15:{ ...defaultDayRules },
  16:{ ...defaultDayRules },
  17:{ ...defaultDayRules },
  18:{ ...defaultDayRules },
  19:{ ...defaultDayRules },
  20:{ ...defaultDayRules },
  21:{ ...defaultDayRules },
  22:{ ...defaultDayRules },
  23:{ ...defaultDayRules },
  24:{ ...defaultDayRules },
  25:{ ...defaultDayRules },
  26:{ ...defaultDayRules },
  27:{ ...defaultDayRules },
  28:{ ...defaultDayRules },
  29:{ ...defaultDayRules },
  30:{ ...defaultDayRules },
  31:{ ...defaultDayRules },
};
