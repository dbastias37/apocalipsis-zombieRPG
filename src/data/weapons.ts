export type Weapon = {
  id: string;
  name: 'Puños' | 'Navaja' | 'Pistola' | 'Subfusil (SMG)' | 'Escopeta' | 'Rifle' | string;
  type: 'melee' | 'ranged';
  hitBonus: number;
  damage: { times: number; faces: number; mod: number };
  usesAttr: 'Fuerza' | 'Destreza';
  ammoCost?: number;
  magSize?: number;
};

export const WEAPONS: Weapon[] = [
  { id: 'fists',   name: 'Puños',           type: 'melee',  hitBonus: 0, damage: { times:1, faces:4, mod:0 }, usesAttr: 'Fuerza' },
  { id: 'knife',   name: 'Navaja',          type: 'melee',  hitBonus: 1, damage: { times:1, faces:6, mod:0 }, usesAttr: 'Fuerza' },
  { id: 'pistol',  name: 'Pistola',         type: 'ranged', hitBonus: 1, damage: { times:1, faces:6, mod:4 }, usesAttr: 'Destreza', ammoCost:1, magSize:15 },
  { id: 'pistol9', name: 'Pistola 9mm',     type: 'ranged', hitBonus: 1, damage: { times:1, faces:8, mod:0 }, usesAttr: 'Destreza', ammoCost:1, magSize:12 },
  { id: 'smg',     name: 'Subfusil (SMG)',  type: 'ranged', hitBonus: 1, damage: { times:1, faces:6, mod:3 }, usesAttr: 'Destreza', ammoCost:1, magSize:30 },
  { id: 'shotgun', name: 'Escopeta',        type: 'ranged', hitBonus: 0, damage: { times:2, faces:4, mod:3 }, usesAttr: 'Destreza', ammoCost:1, magSize:5 },
  { id: 'rifle',   name: 'Rifle',           type: 'ranged', hitBonus: 2, damage: { times:1, faces:8, mod:4 }, usesAttr: 'Destreza', ammoCost:1, magSize:10 },
];

export function findWeaponById(id?: string) {
  return WEAPONS.find(w => w.id === id);
}
