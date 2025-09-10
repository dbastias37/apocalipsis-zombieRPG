export type DiceSpec = { times: number; faces: number; mod?: number };

export type RangedWeapon = {
  id: string;
  name: string;
  type: 'ranged';
  damage: DiceSpec;
  hitBonus?: number;
  ammoType: '9mm' | 'rifle' | 'shell' | string;
  ammoCost?: number;
  magCapacity: number;
  magAmmo?: number;
};

export type MeleeWeapon = {
  id: string;
  name: string;
  type: 'melee';
  damage: DiceSpec;
  hitBonus?: number;
};

export type Weapon = RangedWeapon | MeleeWeapon;

export type Actor = {
  id: string;
  name: string;
  hp: number;
  alive: boolean;
  status?: 'ok' | 'infected' | 'down';
  inventory: {
    ammo: Record<string, number>;
    items: string[];
  };
  equipped?: Weapon;
};
