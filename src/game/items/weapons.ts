export type DiceSpec = { times: number; faces: number; mod?: number };

export type Weapon = {
  id: string;
  name: string;
  type: 'melee'|'ranged';
  hitBonus: number;
  damage: DiceSpec;
  usesAttr: 'Fuerza'|'Destreza';
  ammoCost?: number;
  magCapacity?: number;
  ammoType?: '9mm'|'rifle'|'escopeta'|null;
};

export const WEAPONS: Weapon[] = [
  { id: 'fists',  name: 'Puños',  type:'melee',  hitBonus:0, damage:{times:1,faces:4,mod:0}, usesAttr:'Fuerza' },
  { id: 'pistol', name: 'Pistola', type:'ranged', hitBonus:4, damage:{times:1,faces:6,mod:4}, usesAttr:'Destreza', ammoCost:1, magCapacity:15, ammoType:'9mm' },
  { id: 'rifle',  name: 'Rifle',  type:'ranged', hitBonus:5, damage:{times:1,faces:8,mod:4}, usesAttr:'Destreza', ammoCost:1, magCapacity:10, ammoType:'rifle' },
];

export function findWeaponById(id?: string) {
  return WEAPONS.find(w => w.id === id);
}

export const rollDamage = (d: DiceSpec, rng: () => number = Math.random): number => {
  let total = 0;
  for (let i = 0; i < d.times; i++) {
    total += Math.floor(rng() * d.faces) + 1;
  }
  return total + (d.mod ?? 0);
};

export const damageRange = (d: DiceSpec) => ({
  min: d.times * 1 + (d.mod ?? 0),
  max: d.times * d.faces + (d.mod ?? 0),
});
