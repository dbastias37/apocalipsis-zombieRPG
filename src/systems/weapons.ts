import { findWeaponById } from "../data/weapons";

// Pseudo-arma por defecto (puños), por si no hay selección válida.
export const FISTS_WEAPON = {
  id: "fists",
  name: "Puños",
  type: "melee",
  damageMin: 1,
  damageMax: 2,
  damage: { times: 1, faces: 2, mod: 0 },
};

/**
 * Devuelve el arma seleccionada para un jugador.
 * - Si player.selectedWeaponId está definido y existe en el catálogo -> ese arma.
 * - Si no, devuelve Puños.
 * Nunca retorna undefined (evita crasheos de UI).
 */
export function getSelectedWeapon(player: any) {
  try {
    const selId = player?.selectedWeaponId;
    if (selId) {
      const w = findWeaponById(selId);
      if (w) {
        const times = w.damage?.times ?? 0;
        const faces = w.damage?.faces ?? 0;
        const mod = w.damage?.mod ?? 0;
        return { ...w, damageMin: times + mod, damageMax: times * faces + mod };
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
  return Math.max(0, Number(player?.ammoByWeapon?.[weaponId] ?? 0));
}

/**
 * Devuelve true si un arma es de fuego (por si tu UI lo necesita).
 */
export function isRangedWeapon(w: any): boolean {
  return w?.type === "ranged" || w?.range === "ranged";
}

