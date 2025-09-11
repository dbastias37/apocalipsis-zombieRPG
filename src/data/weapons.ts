export type Weapon = {
  id: string;
  name: string;
  type: 'melee' | 'ranged';
  hitBonus: number;
  damage: { times: number; faces: number; mod: number };
  usesAttr: 'Fuerza' | 'Destreza';
  ammoCost?: number;   // cuántas balas consume un disparo (1 en nuestras armas)
  magSize?: number;    // capacidad del cargador (pistola 15, smg 30, etc.)
};

export const WEAPONS: Weapon[] = [
  { id:'fists',  name:'Puños',   type:'melee',  hitBonus:0, damage:{times:1,faces:4,mod:0}, usesAttr:'Fuerza' },
  { id:'knife',  name:'Navaja',  type:'melee',  hitBonus:1, damage:{times:1,faces:6,mod:0}, usesAttr:'Fuerza' },

  { id:'pistol',  name:'Pistola',          type:'ranged', hitBonus:4, damage:{times:1,faces:6,mod:4}, usesAttr:'Destreza', ammoCost:1, magSize:15 },
  { id:'smg',     name:'Subfusil (SMG)',   type:'ranged', hitBonus:5, damage:{times:1,faces:6,mod:3}, usesAttr:'Destreza', ammoCost:1, magSize:30 },
  { id:'shotgun', name:'Escopeta',         type:'ranged', hitBonus:3, damage:{times:2,faces:4,mod:3}, usesAttr:'Destreza', ammoCost:1, magSize:5  },
  { id:'rifle',   name:'Rifle',            type:'ranged', hitBonus:4, damage:{times:1,faces:8,mod:4}, usesAttr:'Destreza', ammoCost:1, magSize:10 },
];

export function findWeaponById(id?: string) {
  return WEAPONS.find(w => w.id === id);
}
