export type Weapon = {
  id: string;
  name: string;
  type: 'melee' | 'firearm';
  dice: string;          // display (p.ej. "1d6")
  caliber?: '9mm';
  magSize?: number;      // para pistola
  // legacy fields for compatibility
  hitBonus?: number;
  damage?: { times: number; faces: number; mod: number };
  usesAttr?: 'Fuerza' | 'Destreza';
  ammoCost?: number;
};

export const WEAPONS: Record<string, Weapon> = {
  fists:   { id:'fists',   name:'Puños',          type:'melee',   dice:'1d4', hitBonus:0, damage:{times:1,faces:4,mod:0}, usesAttr:'Fuerza' },
  knife:   { id:'knife',   name:'Navaja',         type:'melee',   dice:'1d6', hitBonus:1, damage:{times:1,faces:6,mod:0}, usesAttr:'Fuerza' },
  pistol9: { id:'pistol9', name:'Pistola 9mm',    type:'firearm', dice:'1d8', caliber:'9mm', magSize:12, hitBonus:1, damage:{times:1,faces:8,mod:0}, usesAttr:'Destreza', ammoCost:1 },
};

export const WEAPON_LIST: Weapon[] = Object.values(WEAPONS);

export function findWeaponById(id?: string) {
  return id ? WEAPONS[id] : undefined;
}
