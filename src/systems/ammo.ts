import { getSelectedWeapon, isRangedWeapon } from "./weapons.js";

function norm(s?: string){
  return String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"" ).toLowerCase().trim();
}

export function isAmmoBox(item: any): boolean {
  if (!item) return false;
  if (typeof item === "object" && (item.type === "ammo" && item.kind === "box")) return true;
  const n = norm(item.name ?? item.title ?? item);
  return /caja/.test(n) && /municion|munición/.test(n);
}

export function isLooseAmmo(item: any): boolean {
  if (!item) return false;
  if (typeof item === "object" && item.type === "ammo" && item.kind !== "box") return true;
  const n = norm(item.name ?? item.title ?? item);
  return /municion|munición/.test(n) && !/caja/.test(n);
}

export function ammoCount(item: any): number {
  const fromField = Number(item?.amount ?? item?.qty ?? item?.count ?? 0);
  if (Number.isFinite(fromField) && fromField > 0) return Math.floor(fromField);
  const name = String(item?.name ?? item?.title ?? item ?? "");
  const m = name.match(/\((\d+)\)/);
  if (m) return Math.max(0, parseInt(m[1],10));
  return isLooseAmmo(item) ? 1 : 0;
}

export function listAmmoBoxes(inv: any[] | undefined | null){
  const arr = Array.isArray(inv) ? inv : [];
  return arr.map((it, i) => ({ i, it, bullets: ammoCount(it) }))
            .filter(row => isAmmoBox(row.it) && row.bullets > 0);
}

export function listLoose(inv: any[] | undefined | null){
  const arr = Array.isArray(inv) ? inv : [];
  return arr.map((it, i) => ({ i, it, bullets: ammoCount(it) }))
            .filter(row => isLooseAmmo(row.it) && row.bullets > 0);
}

export function consumeOneBox(inv: any[] | undefined | null){
  const arr = Array.isArray(inv) ? [...inv] : [];
  const boxes = listAmmoBoxes(arr);
  if (!boxes.length) return { bullets: 0, inv: arr };
  const { i, bullets } = boxes[0];
  arr.splice(i, 1);
  return { bullets, inv: arr };
}

export function consumeLoose(inv: any[] | undefined | null, need: number){
  const arr = Array.isArray(inv) ? [...inv] : [];
  let taken = 0;
  for (let idx = 0; idx < arr.length && taken < need; idx++){
    const it = arr[idx];
    const loose = isLooseAmmo(it) ? ammoCount(it) : 0;
    if (loose <= 0) continue;
    const take = Math.min(need - taken, loose);
    const left = loose - take;
    if (left <= 0){
      arr.splice(idx,1); idx--;
    } else {
      const base = typeof it === "object" ? it : { name: String(it ?? "Munición") };
      arr[idx] = { ...base, amount: left, qty: left, count: left };
    }
    taken += take;
  }
  return { taken, inv: arr };
}

export function getLoadedAmmo(player: any, weaponId: string): number {
  const n = Number(player?.ammoByWeapon?.[weaponId] ?? 0);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function setLoadedAmmo(player: any, weaponId: string, count: number){
  const table = { ...(player?.ammoByWeapon ?? {}) };
  table[weaponId] = Math.max(0, Math.floor(count));
  return { ...player, ammoByWeapon: table };
}

export function spendAmmo(player: any, weaponId: string, amount = 1){
  const cur = getLoadedAmmo(player, weaponId);
  if (cur < amount) return { player, ok: false };
  return { player: setLoadedAmmo(player, weaponId, cur - amount), ok: true };
}

export function totalAmmoInInventory(inv: any[] | null | undefined): number {
  if (!Array.isArray(inv)) return 0;
  const boxes = listAmmoBoxes(inv).reduce((acc, r) => acc + (r.bullets ?? 0), 0);
  const loose = listLoose(inv).reduce((acc, r) => acc + (r.bullets ?? 0), 0);
  return boxes + loose;
}

export function reloadSelectedWeapon(state: any){
  const pIdx = state?.turn?.activeIndex ?? 0;
  const player = state?.players?.[pIdx];
  if (!player) return state;
  const w = getSelectedWeapon(player);
  if (!isRangedWeapon(w)) return state;

  const mag = Number(w?.magSize ?? 0);
  const cur = getLoadedAmmo(player, w.id);
  const free = Math.max(0, mag - cur);
  if (free <= 0) return state;

  const fromLoose = consumeLoose(player.inventory, free);
  let taken = fromLoose.taken;
  let inventory = fromLoose.inv;

  if (taken < free){
    const { bullets, inv } = consumeOneBox(inventory);
    inventory = inv;
    const use = Math.min(free - taken, bullets);
    taken += use;
    const leftover = bullets - use;
    if (leftover > 0) {
      inventory = [{ type: 'ammo', kind: 'box', amount: leftover }, ...inventory];
    }
  }

  if (taken <= 0) return state;

  const load = Math.min(free, taken);
  const updated = setLoadedAmmo({ ...player, inventory }, w.id, cur + load);

  const next = { ...state, players: [...state.players] };
  next.players[pIdx] = updated;
  return next;
}

export const listAmmoboxes = listAmmoBoxes;
