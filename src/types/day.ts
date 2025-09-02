export type RiskLevel = "bajo" | "medio" | "alto";
export interface NextDayModifiers {
  hordeIntensity?: number;               // delta acumulativo (+/-)
  safehouseRevealed?: boolean;           // merge boolean (OR)
  eventUnlocks?: string[];               // union de ids
  shopPricesMultiplier?: number;         // multiplicador aplicado al día siguiente (default 1)
}
export interface DecisionOptionOutcome {
  effects: { morale?: number; supplies?: number; injuries?: number; risk?: RiskLevel };
  log?: string;
  flagsSet?: string[];
  flagsUnset?: string[];
  nextDayModifiers?: NextDayModifiers;   // aplicado al preparar el día siguiente
}
export interface DecisionOption {
  id: string;
  label: string;
  outcome: DecisionOptionOutcome;
}
export interface DayDecision {
  id: string;
  day: number;
  title: string;
  text: string;
  options: DecisionOption[];
  tags?: string[];
}
export interface DayBattle {
  id: string;
  day: number;
  title: string;
  enemies: { type: string; count: number }[];
  difficulty: "fácil" | "media" | "difícil";
  rewards: { supplies?: number; ammo?: number };
  penalties?: { injuries?: number; morale?: number };
  unique?: boolean;
  tags?: string[];
}
export interface DayExploration {
  id: string;
  day: number;
  location: string;
  description: string;
  risk: RiskLevel;
  timeCostMin: number;
  lootTable: { item: string; qty: number; chance: number }[];
  onSuccessFlagsSet?: string[];
  tags?: string[];
}
export interface DayContent {
  decisions: DayDecision[];
  battles: DayBattle[];
  exploration: DayExploration[];
}
