// src/data/weapons.ts
// Repositorio canónico de armas: melee y a distancia.
// Mantiene compatibilidad con tu esquema de daño DiceSpec y cargadores.

export type DiceSpec = { times: number; faces: number; mod?: number };

export type MeleeWeapon = {
  id: string;
  name: string;
  type: "melee";
  damage: DiceSpec;
  hitBonus?: number;
  usesAttr?: "Fuerza" | "Destreza";
};

export type RangedWeapon = {
  id: string;
  name: string;
  type: "ranged";
  damage: DiceSpec;
  magSize: number;     // capacidad del cargador (cuántas balas/flechas “resiste”)
  ammoCost?: number;   // balas por disparo (normalmente 1)
  hitBonus?: number;
  usesAttr?: "Fuerza" | "Destreza";
  caliber?: string;    // opcional (9mm, .38, 12g, 7.62, "flecha")
};

export type Weapon = MeleeWeapon | RangedWeapon;

export const WEAPONS: Record<string, Weapon> = {
  // ====== MELEE ======
  metal_pipe: {
    id: "metal_pipe",
    name: "Tubo de metal",
    type: "melee",
    damage: { times: 1, faces: 8, mod: 1 }, // 1d8+1 contundente
    usesAttr: "Fuerza",
  },
  baseball_bat: {
    id: "baseball_bat",
    name: "Bate de béisbol",
    type: "melee",
    damage: { times: 1, faces: 8, mod: 0 }, // 1d8
    usesAttr: "Fuerza",
  },
  wood_club: {
    id: "wood_club",
    name: "Trozo de madera",
    type: "melee",
    damage: { times: 1, faces: 6, mod: 0 }, // 1d6
    usesAttr: "Fuerza",
  },
  katana: {
    id: "katana",
    name: "Katana",
    type: "melee",
    damage: { times: 1, faces: 10, mod: 0 }, // 1d10
    hitBonus: 1,
    usesAttr: "Destreza",
  },
  kitchen_knife: {
    id: "kitchen_knife",
    name: "Cuchillo de cocina",
    type: "melee",
    damage: { times: 1, faces: 6, mod: 1 }, // 1d6+1
    usesAttr: "Destreza",
  },
  pocket_knife: {
    id: "pocket_knife",
    name: "Navaja",
    type: "melee",
    damage: { times: 1, faces: 6, mod: 0 }, // 1d6
    usesAttr: "Destreza",
  },
  nail_bat: {
    id: "nail_bat",
    name: "Bate con clavos",
    type: "melee",
    damage: { times: 1, faces: 8, mod: 2 }, // 1d8+2 perforante/contundente
    usesAttr: "Fuerza",
  },
  construction_hammer: {
    id: "construction_hammer",
    name: "Martillo de construcción",
    type: "melee",
    damage: { times: 1, faces: 8, mod: 1 }, // 1d8+1
    usesAttr: "Fuerza",
  },
  chainsaw: {
    id: "chainsaw",
    name: "Motosierra",
    type: "melee",
    damage: { times: 2, faces: 4, mod: 3 }, // 2d4+3 (devastadora pero más errática)
    usesAttr: "Fuerza",
  },
  axe: {
    id: "axe",
    name: "Hacha",
    type: "melee",
    damage: { times: 1, faces: 10, mod: 1 }, // 1d10+1
    usesAttr: "Fuerza",
  },
  fists: {
    id: "fists",
    name: "Puños",
    type: "melee",
    damage: { times: 1, faces: 4, mod: 0 }, // 1d4
    usesAttr: "Fuerza",
  },

  // ====== DISTANCIA ======
  bow: {
    id: "bow",
    name: "Arco y flecha",
    type: "ranged",
    damage: { times: 1, faces: 8, mod: 0 }, // 1d8
    magSize: 1,        // 1 flecha “cargada” por tiro
    ammoCost: 1,
    usesAttr: "Destreza",
    caliber: "flecha",
  },
  pistol9: {
    id: "pistol9",
    name: "Pistola 9mm",
    type: "ranged",
    damage: { times: 1, faces: 8, mod: 0 }, // 1d8
    magSize: 12,
    ammoCost: 1,
    usesAttr: "Destreza",
    caliber: "9mm",
  },
  revolver38: {
    id: "revolver38",
    name: "Revólver",
    type: "ranged",
    damage: { times: 1, faces: 8, mod: 1 }, // 1d8+1
    magSize: 6,
    ammoCost: 1,
    usesAttr: "Destreza",
    caliber: ".38",
  },
  rifle_hunting: {
    id: "rifle_hunting",
    name: "Rifle de caza",
    type: "ranged",
    damage: { times: 1, faces: 10, mod: 1 }, // 1d10+1
    magSize: 5,
    ammoCost: 1,
    usesAttr: "Destreza",
    caliber: "7.62",
  },
  shotgun: {
    id: "shotgun",
    name: "Escopeta",
    type: "ranged",
    damage: { times: 2, faces: 4, mod: 3 }, // 2d4+3
    magSize: 5,
    ammoCost: 1,
    usesAttr: "Destreza",
    caliber: "12g",
  },
};

export const WEAPON_LIST: Weapon[] = Object.values(WEAPONS);
export function findWeaponById(id?: string) {
  return id ? WEAPONS[id] : undefined;
}
