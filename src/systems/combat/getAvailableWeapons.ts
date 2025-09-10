// Helper to list available weapons for a player
// Shows pistol even without ammo (disabled with reason)

export type WeaponOpt = { id: string; label: string; usable: boolean; reason?: string };

import { getAmmoFor } from "../weapons.js";
import { findWeaponById, damageRange } from "../../game/items/weapons.js";

type Player = { inventory?: any[]; weaponState?: Record<string, { ammoInMag: number }> };

/** Normaliza a minúsculas, sin tildes y con espacios colapsados */
function norm(s?: string) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Alias ES → categoría canónica que usa el sistema de combate */
const ALIAS: Record<string, string[]> = {
  knife: ["knife","navaja","cuchillo","cuchillo tactico","kukri","tacdag","daga"],
  pistol: ["pistol","pistola","pistola 9mm","pistola9","revolver",".38","38"],
  rifle: ["rifle","rifle de caza","rifle_caza","rifle asalto","rifle_asalto","francotirador"],
  shotgun: ["escopeta","shotgun"],
  smg: ["smg","subfusil","subfusil (smg)"],
};

/** ¿El inventario contiene alguno de los alias dados? */
function hasAny(p: Player, keys: string[]): boolean {
  if (!Array.isArray(p.inventory)) return false;
  return p.inventory.some((i: any) => {
    const idOrName = typeof i === "string" ? i : (i?.id ?? i?.type ?? i?.name);
    const token = norm(idOrName);
    return keys.some(k => token.includes(norm(k)));
  });
}

export function getAvailableWeapons(player: Player): WeaponOpt[] {
  const fists = findWeaponById("fists")!;
  const fistsRange = damageRange(fists.damage);
  const list: WeaponOpt[] = [{ id: "fists", label: `Puños (${fistsRange.min}-${fistsRange.max})`, usable: true }];

  if (hasAny(player, ALIAS.knife)) {
    const knife = findWeaponById("knife");
    if (knife) {
      const r = damageRange(knife.damage);
      list.push({ id: "knife", label: `${knife.name} (${r.min}-${r.max})`, usable: true });
    }
  }

  if (hasAny(player, ALIAS.pistol)) {
    const w = findWeaponById("pistol");
    if (w) {
      const r = damageRange(w.damage);
      const ammo = getAmmoFor(player, "pistol");
      const cap = w.magCapacity ?? 0;
      list.push({
        id: w.id,
        label: `${w.name} (${r.min}-${r.max}) — Munición: ${ammo}/${cap}${ammo > 0 ? "" : " (Sin munición)"}`,
        usable: ammo > 0,
        reason: ammo > 0 ? undefined : "Sin munición",
      });
    }
  }

  if (hasAny(player, ALIAS.rifle)) {
    const w = findWeaponById("rifle");
    if (w) {
      const r = damageRange(w.damage);
      const ammo = getAmmoFor(player, "rifle");
      const cap = w.magCapacity ?? 0;
      list.push({
        id: w.id,
        label: `${w.name} (${r.min}-${r.max}) — Munición: ${ammo}/${cap}${ammo > 0 ? "" : " (Sin munición)"}`,
        usable: ammo > 0,
        reason: ammo > 0 ? undefined : "Sin munición",
      });
    }
  }

  // Opcionales si tu UI los usa:
  if (hasAny(player, ALIAS.shotgun)) {
    const ammo = getAmmoFor(player, "shotgun");
    const cap = 6;
    list.push({
      id: "shotgun",
      label: `Escopeta (2d4+3) — Munición: ${ammo}/${cap}${ammo > 0 ? "" : " (Sin munición)"}`,
      usable: true,
      reason: ammo > 0 ? undefined : "Sin munición",
    });
  }

  if (hasAny(player, ALIAS.smg)) {
    const ammo = getAmmoFor(player, "smg");
    const cap = 30;
    list.push({
      id: "smg",
      label: `SMG (1d6+3) — Munición: ${ammo}/${cap}${ammo > 0 ? "" : " (Sin munición)"}`,
      usable: true,
      reason: ammo > 0 ? undefined : "Sin munición",
    });
  }

  return list;
}

