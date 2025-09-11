export type DiceSpec = { times: number; faces: number; mod?: number };

export type RangedWeapon = {
  id: string;
  name: string;
  type: 'ranged';
  damage: DiceSpec;
  ammoType: string;
  magSize: number;
  magAmmo?: number;
  ammoCost?: number;
  hitBonus?: number;
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
  maxHp: number;
  alive: boolean;
  status?: 'ok' | 'infected' | 'down';
  inventory: {
    ammo: Record<string, number>;
    weapons: Weapon[];
  };
  equipped?: Weapon;
};

export type CombatState = {
  status: 'idle' | 'ongoing' | 'finished';
  activeId?: string;
  rounds: any[];
  log: string[];
  result: null | { victory: boolean; loot: any[] };
};

export type RootState = {
  actors: Actor[];
  combat: CombatState;
};
