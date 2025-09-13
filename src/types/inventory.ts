export type BaseItem = {
  id: string;
  name: string;
  type: 'ammo' | 'food' | 'med' | 'misc';
  [key: string]: any;
};

export type AmmoItem = BaseItem & {
  type: 'ammo';
  kind: 'box' | 'loose';
  amount: number;
};

export type FoodItem = BaseItem & {
  type: 'food';
  energy: number;
};

export type MedItem = BaseItem & {
  type: 'med';
  heal: number;
  kind?: string;
};

export type InventoryItem = AmmoItem | FoodItem | MedItem | BaseItem;

export type Stash = InventoryItem[];

export type CampState = {
  stash: Stash;
  resources: {
    food: number;
    water: number;
    medicine: number;
    fuel: number;
    ammo: number;
    materials: number;
    [key: string]: any;
  };
};
