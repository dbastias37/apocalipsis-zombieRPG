// Helper to list available weapons for a player
// Shows pistol even without ammo (disabled with reason)

export type WeaponOpt = { id: string; label: string; usable: boolean; reason?: string };

type Player = { inventory?: any[]; ammo?: number };

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
  const list: WeaponOpt[] = [{ id: "fists", label: "Puños (1–2)", usable: true }];

  if (hasAny(player, ALIAS.knife)) {
    list.push({ id: "knife", label: "Navaja (1–6)", usable: true });
  }

  const ammo = player.ammo ?? 0;

  if (hasAny(player, ALIAS.pistol)) {
    list.push({
      id: "pistol",
      label: `Pistola (2–8) — Munición: ${ammo}${ammo > 0 ? "" : " (Sin munición)"}`,
      usable: true,
      reason: ammo > 0 ? undefined : "Sin munición",
    });
  }

  if (hasAny(player, ALIAS.rifle)) {
    list.push({
      id: "rifle",
      label: `Rifle (4–12) — Munición: ${ammo}${ammo > 0 ? "" : " (Sin munición)"}`,
      usable: true,
      reason: ammo > 0 ? undefined : "Sin munición",
    });
  }

  // Opcionales si tu UI los usa:
  if (hasAny(player, ALIAS.shotgun)) {
    list.push({
      id: "shotgun",
      label: `Escopeta (2d4+3) — Munición: ${ammo}${ammo > 0 ? "" : " (Sin munición)"}`,
      usable: true,
      reason: ammo > 0 ? undefined : "Sin munición",
    });
  }

  if (hasAny(player, ALIAS.smg)) {
    list.push({
      id: "smg",
      label: `SMG (1d6+3) — Munición: ${ammo}${ammo > 0 ? "" : " (Sin munición)"}`,
      usable: true,
      reason: ammo > 0 ? undefined : "Sin munición",
    });
  }

  return list;
}

