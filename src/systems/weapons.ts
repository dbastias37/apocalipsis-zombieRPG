import { findWeaponById } from "../data/weapons.js";

export function getSelectedWeapon(player: any) {
  const id = player?.currentWeaponId ?? player?.selectedWeaponId ?? "fists";
  return findWeaponById(id) ?? findWeaponById("fists")!;
}

export function isRangedWeapon(w: any): boolean {
  return w?.type === "ranged";
}

export function getAmmoFor(player: any, weaponId: string): number {
  return Math.max(0, Number(player?.ammoByWeapon?.[weaponId] ?? 0));
}

export function setAmmoFor(player: any, weaponId: string, count: number) {
  const table = { ...(player?.ammoByWeapon ?? {}) };
  table[weaponId] = Math.max(0, Math.floor(count));
  return { ...player, ammoByWeapon: table };
}
