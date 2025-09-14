import { WEAPONS, Weapon } from '../data/weapons';
import { getAmmoTotalForCaliber, reloadWeaponMagazine, getMagazineCount } from './ammo';

const norm = (s?:string)=> String(s??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();

// ¿El jugador posee un arma?
export function playerOwnsWeapon(player:any, weaponId:string){
  if(weaponId==='fists') return true;
  const arr = [...(player?.inventory||[]), ...(player?.backpack||[])];
  const n = weaponId==='knife' ? 'navaja' : weaponId==='pistol9' ? 'pistola' : weaponId;
  return arr.some(it => norm((it as any)?.name ?? it).includes(n));
}

export function getEquippedWeapon(player:any): Weapon {
  const id = player?.equippedWeaponId && WEAPONS[player.equippedWeaponId] ? player.equippedWeaponId : 'fists';
  return WEAPONS[id];
}

export function canReloadEquipped(player:any){
  const w = getEquippedWeapon(player);
  if (w.type!=='firearm' || !w.caliber) return false;
  return getAmmoTotalForCaliber(player, w.caliber) > 0;
}

export function isOutOfAmmoForEquipped(player:any){
  const w = getEquippedWeapon(player);
  if (w.type!=='firearm') return false;
  return getMagazineCount(player, w.id) <= 0;
}

export function equipWeapon(player:any, weaponId:string){
  if (!WEAPONS[weaponId]) return player;
  if (weaponId!=='fists' && !playerOwnsWeapon(player, weaponId)) return player;
  return { ...player, equippedWeaponId: weaponId };
}

// legacy helpers for existing code
export function getSelectedWeapon(player:any){
  return getEquippedWeapon(player);
}

export function isRangedWeapon(w:any): boolean {
  return w?.type === 'firearm' || w?.type === 'ranged';
}

export function getAmmoFor(player:any, weaponId:string): number {
  return Math.max(0, Number(player?.ammoByWeapon?.[weaponId] ?? 0));
}

export function setAmmoFor(player:any, weaponId:string, count:number){
  const table = { ...(player?.ammoByWeapon ?? {}) };
  table[weaponId] = Math.max(0, Math.floor(count));
  return { ...player, ammoByWeapon: table };
}
