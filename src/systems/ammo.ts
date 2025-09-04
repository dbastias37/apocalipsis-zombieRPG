// src/systems/ammo.ts
import { getSelectedWeapon, isRangedWeapon } from "./weapons";

/** Detecta si un item del inventario es una caja de munición. */
export function isAmmoBox(item: any): boolean {
  if (!item) return false;
  if (item.type === "ammo" || item.kind === "ammoBox") return true;
  const name: string = String(item.name ?? item.title ?? "").toLowerCase();
  return /caja\s+de\s+munici(o|ó)n/.test(name);
}

/** Extrae cantidad de balas de un item. Busca amount, qty o "(N)" en el nombre. */
export function parseAmmoCount(item: any): number {
  if (!item) return 0;
  const n = Number(item.amount ?? item.qty ?? item.count ?? 0);
  if (!Number.isNaN(n) && n > 0) return n;
  const m = String(item.name ?? item.title ?? "").match(/\((\d+)\)\s*$/);
  return m ? Number(m[1]) : 0;
}

/** Lista de cajas en inventario con índice y balas. */
export function listAmmoBoxes(inventory: any[] | undefined | null) {
  const inv = Array.isArray(inventory) ? inventory : [];
  return inv
    .map((it, idx) => ({ idx, item: it, bullets: parseAmmoCount(it) }))
    .filter(row => isAmmoBox(row.item) && row.bullets > 0);
}

// Alias tolerante por si en el código quedó con otra capitalización.
export const listAmmoboxes = listAmmoBoxes;

/** Total de balas en cajas del inventario. */
export function totalAmmoInInventory(inventory: any[] | undefined | null): number {
  return listAmmoBoxes(inventory).reduce((acc, r) => acc + r.bullets, 0);
}

/** Consume UNA caja (la primera) y devuelve { bullets, newInventory }. Si no hay, bullets=0. */
export function consumeOneAmmoBox(inventory: any[] | undefined | null) {
  const inv = Array.isArray(inventory) ? [...inventory] : [];
  const list = listAmmoBoxes(inv);
  if (list.length === 0) return { bullets: 0, newInventory: inv };
  const first = list[0];
  inv.splice(first.idx, 1);
  return { bullets: first.bullets, newInventory: inv };
}

/** Lee la munición cargada actualmente para un arma del jugador. */
export function getLoadedAmmo(player: any, weaponId: string): number {
  const table = player?.ammoByWeapon ?? {};
  const n = Number(table[weaponId] ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Establece nueva munición para un arma del jugador. */
export function setLoadedAmmo(player: any, weaponId: string, value: number) {
  const next = Math.max(0, Math.floor(value));
  const table = { ...(player?.ammoByWeapon ?? {}) };
  table[weaponId] = next;
  return { ...player, ammoByWeapon: table };
}

/** Gasta munición (por disparo). Devuelve { player:newPlayer, ok:boolean }. */
export function spendAmmo(player: any, weaponId: string, amount = 1) {
  const cur = getLoadedAmmo(player, weaponId);
  if (cur < amount) return { player, ok: false };
  return { player: setLoadedAmmo(player, weaponId, cur - amount), ok: true };
}

/** Recarga el arma seleccionada del jugador consumiendo UNA caja del inventario. */
export function reloadSelectedWeapon(player: any, pushLog?: (s: string) => void) {
  if (!player) return player;
  const w = getSelectedWeapon(player);
  if (!isRangedWeapon(w)) {
    pushLog?.(`${player.name} intenta recargar, pero ${w.name} no usa munición.`);
    return player;
  }
  const { bullets, newInventory } = consumeOneAmmoBox(player.inventory);
  if (bullets <= 0) {
    pushLog?.(`${player.name} no tiene cajas de munición disponibles.`);
    return player;
  }
  const cur = getLoadedAmmo(player, w.id);
  const nextCount = cur + bullets;
  const updated = setLoadedAmmo({ ...player, inventory: newInventory }, w.id, nextCount);
  pushLog?.(`${player.name} recarga ${w.name}: +${bullets} balas (munición: ${nextCount}).`);
  return updated;
}

// Nota: no imponemos cargador máximo; si tienes w.magSize, puedes limitar con Math.min(nextCount, w.magSize).
