export type Weapon = {
  id: string;
  name: string;
  type: 'melee'|'ranged';
  hitBonus: number;
  damage: { times: number; faces: number; mod: number };
  usesAttr: 'Fuerza'|'Destreza';
  ammoCost?: number;
  magCapacity?: number;
  ammoType?: '9mm'|'rifle'|'12g'|'smg'|null;
};

export const WEAPONS: Weapon[] = [
  { id:'fists',  name:'Puños',             type:'melee',  hitBonus:0, damage:{times:1,faces:4,mod:0},  usesAttr:'Fuerza' },
  { id:'knife',  name:'Navaja',            type:'melee',  hitBonus:1, damage:{times:1,faces:6,mod:0},  usesAttr:'Fuerza' },
  { id:'kukri',  name:'Cuchillo',          type:'melee',  hitBonus:2, damage:{times:1,faces:6,mod:1},  usesAttr:'Fuerza' },
  { id:'tacdag', name:'Daga Táctica',      type:'melee',  hitBonus:2, damage:{times:1,faces:6,mod:2},  usesAttr:'Fuerza' },
  { id:'pipe',   name:'Tubo de metal',     type:'melee',  hitBonus:0, damage:{times:1,faces:8,mod:0},  usesAttr:'Fuerza' },
  { id:'bat',    name:'Bate de madera',    type:'melee',  hitBonus:1, damage:{times:1,faces:6,mod:1},  usesAttr:'Fuerza' },
  { id:'nailbat',name:'Bate con clavos',   type:'melee',  hitBonus:1, damage:{times:1,faces:8,mod:0},  usesAttr:'Fuerza' },
  { id:'machete',name:'Machete',           type:'melee',  hitBonus:1, damage:{times:1,faces:8,mod:1},  usesAttr:'Fuerza' },
  { id:'axe',    name:'Hacha',             type:'melee',  hitBonus:0, damage:{times:1,faces:10,mod:0}, usesAttr:'Fuerza' },
  { id:'hammer', name:'Martillo',          type:'melee',  hitBonus:1, damage:{times:1,faces:6,mod:2},  usesAttr:'Fuerza' },
  { id:'wrench', name:'Llave inglesa',     type:'melee',  hitBonus:1, damage:{times:1,faces:6,mod:1},  usesAttr:'Fuerza' },
  { id:'crowbar',name:'Barra palanca',     type:'melee',  hitBonus:1, damage:{times:1,faces:8,mod:1},  usesAttr:'Fuerza' },
  { id:'katana', name:'Katana',            type:'melee',  hitBonus:3, damage:{times:1,faces:10,mod:1}, usesAttr:'Fuerza' },
  { id:'spear',  name:'Lanza improvisada', type:'melee',  hitBonus:1, damage:{times:1,faces:8,mod:0},  usesAttr:'Fuerza' },
  { id:'pick',   name:'Pico',              type:'melee',  hitBonus:0, damage:{times:1,faces:8,mod:2},  usesAttr:'Fuerza' },
  { id:'mace',   name:'Maza casera',       type:'melee',  hitBonus:0, damage:{times:1,faces:10,mod:1}, usesAttr:'Fuerza' },
  { id:'saw',    name:'Sierra manual',     type:'melee',  hitBonus:0, damage:{times:2,faces:4,mod:1},  usesAttr:'Fuerza' },
  { id:'sdriver',name:'Destornillador grande',type:'melee',hitBonus:1,damage:{times:1,faces:6,mod:0},  usesAttr:'Fuerza' },
  { id:'chain',  name:'Cadena',            type:'melee',  hitBonus:0, damage:{times:1,faces:6,mod:1},  usesAttr:'Fuerza' },
  { id:'club',   name:'Garrote',           type:'melee',  hitBonus:1, damage:{times:1,faces:6,mod:0},  usesAttr:'Fuerza' },
  { id:'bottle', name:'Botella rota',      type:'melee',  hitBonus:1, damage:{times:1,faces:4,mod:2},  usesAttr:'Fuerza' },
  { id:'shovel', name:'Pala',              type:'melee',  hitBonus:0, damage:{times:1,faces:8,mod:1},  usesAttr:'Fuerza' },
  { id:'pipehd', name:'Cañería pesada',    type:'melee',  hitBonus:0, damage:{times:1,faces:10,mod:1}, usesAttr:'Fuerza' },
  { id:'faxe',   name:'Hacha de bombero',  type:'melee',  hitBonus:0, damage:{times:1,faces:12,mod:0}, usesAttr:'Fuerza' },

  { id:'sling',  name:'Hondita',           type:'ranged', hitBonus:1, damage:{times:1,faces:4,mod:1},  usesAttr:'Destreza', ammoCost:0 },
  { id:'xbow',   name:'Ballesta',          type:'ranged', hitBonus:3, damage:{times:1,faces:8,mod:2},  usesAttr:'Destreza', ammoCost:1 },
  { id:'pistol', name:'Pistola',           type:'ranged', hitBonus:4, damage:{times:1,faces:6,mod:4},  usesAttr:'Destreza', ammoCost:1, magCapacity:15, ammoType:'9mm' },
  { id:'rifle',  name:'Rifle',             type:'ranged', hitBonus:5, damage:{times:1,faces:8,mod:4},  usesAttr:'Destreza', ammoCost:1, magCapacity:10, ammoType:'rifle' },
  { id:'shotgun',name:'Escopeta',          type:'ranged', hitBonus:3, damage:{times:2,faces:4,mod:3},  usesAttr:'Destreza', ammoCost:1, magCapacity:6, ammoType:'12g' },
  { id:'smg',    name:'Subfusil (SMG)',    type:'ranged', hitBonus:5, damage:{times:1,faces:6,mod:3},  usesAttr:'Destreza', ammoCost:1, magCapacity:30, ammoType:'smg' },
];

export function findWeaponById(id?: string) {
  return WEAPONS.find(w => w.id === id);
}
