import { DecisionCard } from "../decisionCards";
import { day1DecisionCards } from "./day1/decisionCards.day1";
// En el futuro: import { day2DecisionCards } from "./day2/decisionCards.day2"; ...

export function getDecisionCardsForDay(day: number): DecisionCard[] {
  switch (day) {
    case 1: return day1DecisionCards;
    // case 2: return day2DecisionCards;
    default: return day1DecisionCards;
  }
}
