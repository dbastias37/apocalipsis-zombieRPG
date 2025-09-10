export type AmmoPack = { type: 'loose'; count: number } | { type: 'box'; count: number };
export type InventoryItem =
  | string
  | { id?: string; name?: string; type?: string; ammo?: AmmoPack; [k: string]: any };

function isLoose(it: InventoryItem): it is { ammo: AmmoPack } {
  return typeof it === 'object' && !!it && it.ammo?.type === 'loose';
}

function isBox(it: InventoryItem): it is { ammo: AmmoPack } {
  return typeof it === 'object' && !!it && it.ammo?.type === 'box';
}

/**
 * Normaliza la munición en el inventario:
 *  - agrupa todas las balas sueltas en una sola entrada
 *  - convierte cada 15 balas sueltas en una caja
 *  - elimina cajas con conteo 0
 */
export function normalizeAmmo(inv: InventoryItem[]): InventoryItem[] {
  const out: InventoryItem[] = [];
  let loose = 0;
  const boxes: InventoryItem[] = [];

  for (const it of Array.isArray(inv) ? inv : []) {
    if (isLoose(it)) {
      loose += Math.max(0, Math.floor(it.ammo.count));
      continue;
    }
    if (isBox(it)) {
      const cnt = Math.max(0, Math.floor(it.ammo.count));
      if (cnt > 0) {
        boxes.push({ ...it, ammo: { type: 'box', count: Math.min(15, cnt) } });
      }
      continue;
    }
    out.push(it);
  }

  // convertir lo suelto en cajas de 15
  while (loose >= 15) {
    boxes.push({ name: 'Caja de munición', ammo: { type: 'box', count: 15 } });
    loose -= 15;
  }
  if (loose > 0) {
    out.push({ name: 'Munición', ammo: { type: 'loose', count: loose } });
  }
  return [...out, ...boxes];
}

/** Total de balas disponibles en el inventario */
export function ammoAvailable(inv: InventoryItem[]): number {
  return normalizeAmmo(inv).reduce((acc, it) => {
    if (isLoose(it) || isBox(it)) return acc + it.ammo.count;
    return acc;
  }, 0);
}

/**
 * Quita balas del inventario, usando primero balas sueltas y luego cajas.
 * Devuelve cuántas tomó, el nuevo inventario y de dónde provinieron.
 */
export function takeAmmo(
  inv: InventoryItem[],
  needed: number
): { taken: number; newInv: InventoryItem[]; from: 'loose' | 'box' | 'mixed' } {
  let need = Math.max(0, Math.floor(needed));
  const norm = normalizeAmmo(inv);
  const others: InventoryItem[] = [];
  const boxes: InventoryItem[] = [];
  let taken = 0;
  let fromLoose = false;
  let fromBox = false;

  for (const it of norm) {
    if (isLoose(it)) {
      const use = Math.min(it.ammo.count, need);
      taken += use;
      need -= use;
      const remain = it.ammo.count - use;
      if (use > 0) fromLoose = true;
      if (remain > 0) others.push({ ...it, ammo: { type: 'loose', count: remain } });
      continue;
    }
    if (isBox(it)) {
      boxes.push(it);
      continue;
    }
    others.push(it);
  }

  for (const box of boxes) {
    if (need <= 0) {
      others.push(box);
      continue;
    }
    const use = Math.min(box.ammo.count, need);
    taken += use;
    need -= use;
    const remain = box.ammo.count - use;
    if (use > 0) fromBox = true;
    if (remain > 0) others.push({ ...box, ammo: { type: 'box', count: remain } });
  }

  return {
    taken,
    newInv: normalizeAmmo(others),
    from: fromLoose && fromBox ? 'mixed' : fromLoose ? 'loose' : 'box',
  };
}

/**
 * Añade balas al inventario (como sueltas) y normaliza el resultado.
 */
export function addAmmo(inv: InventoryItem[], amount: number): InventoryItem[] {
  if (amount <= 0) return normalizeAmmo(inv);
  const norm = normalizeAmmo(inv);
  const out = norm.map((it) => (isLoose(it) ? { ...it } : it));
  const looseIdx = out.findIndex(isLoose);
  if (looseIdx >= 0) {
    const loose = out[looseIdx] as any;
    loose.ammo.count += amount;
  } else {
    out.push({ name: 'Munición', ammo: { type: 'loose', count: amount } });
  }
  return normalizeAmmo(out);
}

// ---------- Tipos mínimos de compatibilidad (si no existen en el módulo) ----------
type PlayerLike = {
  ammoByWeapon?: Record<string, number>;
  // ...otros campos del jugador que ya tengas
};

// ---------- totalAmmoInInventory ----------
/**
 * Si este archivo ya define getTotalAmmoAvailable, expórtalo con el nombre esperado por App.tsx.
 * De lo contrario, intenta importarlo del módulo donde viva en tu repo.
 * Si no existe en ningún lado, usa el Fallback de abajo.
 */
// CASO A: vive en este mismo archivo:
// declare const getTotalAmmoAvailable: (invOrPlayer: any) => number;
// (si no existe, comenta la línea de arriba y usa el CASO C)

// CASO B: vive en otro archivo (ajusta la ruta si aplica):
// import { getTotalAmmoAvailable } from "./ammo-utils"; // <-- ajusta ruta si aplica

// Export preferido (A o B):
export const totalAmmoInInventory = (function totalAmmoInInventoryFallback(
  invOrPlayer: any
): number {
  // Intenta aceptar player o directamente un array de items
  const inv = Array.isArray(invOrPlayer)
    ? invOrPlayer
    : invOrPlayer?.inventory ?? [];
  if (!Array.isArray(inv)) return 0;

  return inv.reduce((sum, it: any) => {
    const t = (it?.type || it?.id || it?.name || "")
      .toString()
      .toLowerCase();
    const count = Number(it?.count ?? it?.cantidad ?? 1) || 0;

    // Heurística: soporta términos españoles/ingleses
    const isBox = t.includes("ammo_box") || t.includes("caja");
    const isLoose =
      t.includes("ammo") || t.includes("municion") || t.includes("munición");

    if (isBox) return sum + (count || 15);
    if (isLoose) return sum + (count || 1);
    return sum;
  }, 0);
}) as any;

// ---------- getLoadedAmmo ----------
/**
 * Devuelve las balas actualmente cargadas en el cargador del arma indicada para este jugador.
 * Fuente de verdad: player.ammoByWeapon[weaponId]
 */
export function getLoadedAmmo(
  player: PlayerLike | null | undefined,
  weaponId: string
): number {
  if (!player || !weaponId) return 0;
  return Math.max(0, Number(player.ammoByWeapon?.[weaponId] ?? 0));
}

// ---------- spendAmmo ----------
/**
 * Descuenta 'amount' balas del cargador del arma especificada y devuelve un nuevo objeto jugador (inmutable).
 * No baja de 0, y no altera otras armas.
 */
export function spendAmmo<T extends PlayerLike>(
  player: T,
  weaponId: string,
  amount: number = 1
): T {
  const cur = getLoadedAmmo(player, weaponId);
  const next = Math.max(0, cur - Math.max(0, amount | 0));
  return {
    ...player,
    ammoByWeapon: {
      ...(player.ammoByWeapon ?? {}),
      [weaponId]: next,
    },
  };
}

