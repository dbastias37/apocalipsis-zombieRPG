import { findWeaponById } from "../data/weapons";
import { takeAmmo, InventoryItem } from "./ammo";

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
    const selId = player?.currentWeaponId ?? player?.selectedWeaponId;
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

/**
 * Recarga un arma consumiendo munición del inventario.
 */
export function reloadWeapon(p: any, weaponId: string): { updated: any; log: string[] } {
  const w = lookupWeapon(weaponId);
  if (!w || w.type !== "ranged" || !w.magCapacity)
    return { updated: p, log: ["Esta arma no usa munición."] };

  const { table, state } = ensureWeaponState(p, weaponId);
  const missing = Math.max(0, w.magCapacity - state.ammoInMag);
  if (missing === 0) return { updated: p, log: ["El cargador ya está completo."] };

  const { taken, newInv, from } = takeAmmo(p.inventory ?? [], missing);
  const newAmmo = state.ammoInMag + taken;
  const newPlayer = {
    ...p,
    inventory: newInv as InventoryItem[],
    weaponState: { ...table, [weaponId]: { ammoInMag: newAmmo } },
  };

  if (taken === 0) {
    return { updated: newPlayer, log: ["Intentó recargar, pero no tenía munición compatible."] };
  }

  const tag = `[${w.name}: ${newAmmo}/${w.magCapacity}]`;
  if (from === "loose")
    return { updated: newPlayer, log: [`Recarga ${taken} bala(s) suelta(s). ${tag}`] };
  if (from === "box")
    return { updated: newPlayer, log: [`Recarga ${taken} bala(s) desde caja. ${tag}`] };
  return { updated: newPlayer, log: [`Recarga ${taken} bala(s) (mixto). ${tag}`] };
}

