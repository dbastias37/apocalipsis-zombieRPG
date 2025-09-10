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

