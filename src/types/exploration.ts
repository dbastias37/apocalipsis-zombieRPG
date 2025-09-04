export type ContainerRarity = 'common' | 'rare' | 'military';

export interface ExplorationContainer {
  id: string;               // único por día
  kind: 'container';
  name: string;             // "Caja reforzada", "Almacén", etc
  place: string;            // "Depósito del barrio", "Taller", etc
  description?: string;
  rarity: ContainerRarity;  // afecta rango de loot
  ammoMin: number;          // munición mínima al abrir
  ammoMax: number;          // munición máxima al abrir
}
