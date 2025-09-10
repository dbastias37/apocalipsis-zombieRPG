// Helper to list available weapons for a player
// Shows pistol even without ammo (disabled with reason)

export type WeaponOpt = { id: string; label: string; usable: boolean; reason?: string };

type Player = { inventory?: any[]; ammo?: number };

/** Comprueba si el jugador porta un item de cierto tipo */
function hasItem(p: Player, type: string): boolean {
  return Array.isArray(p.inventory) && p.inventory.some((i: any) => {
    if (typeof i === "string") return i === type;
    return i?.type === type || i?.id === type || i?.name === type;
  });
}

export function getAvailableWeapons(player: Player): WeaponOpt[] {
  const list: WeaponOpt[] = [
    { id: 'fists', label: 'Puños (1–2)', usable: true },
  ];

  if (hasItem(player, 'knife')) {
    list.push({ id: 'knife', label: 'Navaja (1–6)', usable: true });
  }

  const ammo = player.ammo ?? 0;

  if (hasItem(player, 'pistol')) {
    list.push({
      id: 'pistol',
      label: `Pistola (2–8) — Munición: ${ammo}`,
      usable: ammo > 0,
      reason: ammo > 0 ? undefined : 'Sin munición',
    });
  }

  if (hasItem(player, 'rifle')) {
    list.push({
      id: 'rifle',
      label: `Rifle (4–12) — Munición: ${ammo}`,
      usable: ammo > 0,
      reason: ammo > 0 ? undefined : 'Sin munición',
    });
  }

  return list;
}

