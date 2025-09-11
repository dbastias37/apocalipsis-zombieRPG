import { findWeaponById } from "../data/weapons";

export const FISTS_WEAPON = {
  id: "fists",
  name: "Puños",
  type: "melee" as const,
  damageMin: 1,
  damageMax: 2,
  damage: { times: 1, faces: 2, mod: 0 },
};

export function getSelectedWeapon(player: any) {
  const w = findWeaponById(player?.selectedWeaponId);
  return w ?? findWeaponById("fists")!;
}

export function getAmmoFor(player: any, weaponId: string): number {
  return Math.max(0, Number(player?.weaponState?.[weaponId]?.ammoInMag ?? 0));
}

export function setAmmoFor(player: any, weaponId: string, count: number) {
  const ws = { ...(player?.weaponState ?? {}) };
  ws[weaponId] = { ammoInMag: Math.max(0, Math.floor(count)) };
  return { ...player, weaponState: ws };
}

export function isRangedWeapon(w: any): boolean {
  return w?.type === "ranged";
}
