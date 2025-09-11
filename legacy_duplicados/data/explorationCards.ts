export type ExplorationCard = {
  id: number;
  title: string;
  text: string;
  loot?: Partial<{ food: number; water: number; medicine: number; fuel: number; ammo: number; materials: number }>;
  threat?: number;
  zombies?: number;
  advanceMs: number;
};

export const explorationCards: ExplorationCard[] = [];
