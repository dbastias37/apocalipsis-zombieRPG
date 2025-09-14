export * from './ammo.js';
export * from './medicine.js';
export * from './food.js';

export type BackpackItem =
  | string
  | import('./ammo.js').AmmoItem
  | import('./medicine.js').MedkitItem
  | import('./food.js').FoodItem;
