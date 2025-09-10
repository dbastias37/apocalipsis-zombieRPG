import { findWeaponById, damageRange, Weapon } from "../game/items/weapons.js";

// Pseudo-arma por defecto (puños), por si no hay selección válida.
const fists = findWeaponById("fists")!;
const fistsRange = damageRange(fists.damage);
export const FISTS_WEAPON = {
  id: fists.id,
  name: fists.name,
  type: fists.type,
  damageMin: fistsRange.min,
  damageMax: fistsRange.max,
  damage: fists.damage,
};

/**
 * Devuelve el arma seleccionada para un jugador.
 * - Si player.selectedWeaponId está definido y existe en el catálogo -> ese arma.
 * - Si no, devuelve Puños.
 * Nunca retorna undefined (evita crasheos de UI).
 */
export function getSelectedWeapon(player: any) {
  try {
    const selId = player?.currentWeaponId ?? player?.selectedWeaponId;
    if (selId) {
      const w = findWeaponById(selId);
      if (w) {
        const range = damageRange(w.damage);
        return { ...w, damageMin: range.min, damageMax: range.max } as Weapon & {damageMin:number;damageMax:number};
      }
    }
  } catch (_) {}
  return FISTS_WEAPON;
}

/**
 * Munición actual para un arma concreta del jugador.
 * Si no existe estructura, devuelve 0.
 */
export function getAmmoFor(player: any, weaponId: string): number {
  const state = player?.weaponState?.[weaponId];
  if (state && typeof state.ammoInMag === "number") return Math.max(0, state.ammoInMag);
  // compatibilidad legacy
  const legacy = player?.ammoByWeapon?.[weaponId] ?? player?.ammo;
  return Math.max(0, Number(legacy ?? 0));
}

/**
 * Devuelve true si un arma es de fuego (por si tu UI lo necesita).
 */
export function isRangedWeapon(w: any): boolean {
  return w?.type === "ranged" || w?.range === "ranged";
}

/** Asegura que exista el estado de un arma en el jugador */
export function ensureWeaponState(player: any, weaponId: string) {
  const table = { ...(player?.weaponState ?? {}) };
  const cur = table[weaponId] ?? { ammoInMag: 0 };
  table[weaponId] = cur;
  return { table, state: cur };
}

/** Busca un arma en el catálogo */
export function lookupWeapon(id: string) {
  return findWeaponById(id);
}

