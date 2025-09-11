// src/data/decisionCards.ts
export type DecisionChoice = {
  text: string;
  effect: Record<string, any>;
};

export type DecisionCard = {
  id: number;
  title: string;
  text: string;
  choices: DecisionChoice[];
};

// Mantén un array vacío para que no se inyecten cartas antiguas si se importa accidentalmente.
export const decisionCards: DecisionCard[] = [];

