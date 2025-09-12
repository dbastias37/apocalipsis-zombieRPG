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

export function ensureAmmoNames(item: any){
  const kind = item?.kind === "box" ? "box" : "loose";
  const amount = Math.max(0, Math.floor(Number(item?.amount ?? 0)));
  const name = kind === "box" ? `Caja de munición (${amount})` : `Munición (${amount})`;
  return { ...item, type: "ammo", kind, amount, qty: amount, count: amount, name };
}

export function addLoose(inv: any[] | null | undefined, n: number){
  const arr = Array.isArray(inv) ? [...inv] : [];
  const amount = Math.max(0, Math.floor(n));
  if (amount <= 0) return arr;
  arr.push(ensureAmmoNames({ kind: "loose", amount }));
  return arr;
}

export function addBox(inv: any[] | null | undefined, n: number){
  const arr = Array.isArray(inv) ? [...inv] : [];
  const amount = Math.max(0, Math.floor(n));
  if (amount <= 0) return arr;
  arr.push(ensureAmmoNames({ kind: "box", amount }));
  return arr;
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

export function reduceLoose(inv: any[] | undefined | null, need: number){
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
      arr[idx] = ensureAmmoNames({ ...(typeof it === "object" ? it : {}), kind: "loose", amount: left });
    }
    taken += take;
  }
  return { taken, inv: arr };
}

export function reduceBoxes(inv: any[] | undefined | null, need: number){
  const arr = Array.isArray(inv) ? [...inv] : [];
  let taken = 0;
  for (let idx = 0; idx < arr.length && taken < need; idx++){
    const it = arr[idx];
    const bullets = isAmmoBox(it) ? ammoCount(it) : 0;
    if (bullets <= 0) continue;
    const take = Math.min(need - taken, bullets);
    const left = bullets - take;
    if (left <= 0){
      arr.splice(idx,1); idx--;
    } else {
      arr[idx] = ensureAmmoNames({ ...(typeof it === "object" ? it : {}), kind: "box", amount: left });
    }
    taken += take;
  }
  return { taken, inv: arr };
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
  return reduceLoose(inv, need);
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

export function loadFromBackpackExact(state: any, amount: number){
  const pIdx = state?.turn?.activeIndex ?? 0;
  const player = state?.players?.[pIdx];
  if (!player) return state;
  const w = getSelectedWeapon(player);
  if (!isRangedWeapon(w)) return state;
  const mag = Number(w?.magSize ?? 0);
  const cur = getLoadedAmmo(player, w.id);
  const free = Math.max(0, mag - cur);
  const need = Math.min(Math.max(0, Math.floor(amount)), free);
  if (need <= 0) return state;

  let inventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
  const loose = reduceLoose(inventory, need);
  let taken = loose.taken;
  inventory = loose.inv;
  if (taken < need){
    const fromBoxes = reduceBoxes(inventory, need - taken);
    taken += fromBoxes.taken;
    inventory = fromBoxes.inv;
  }
  if (taken <= 0) return state;
  const load = Math.min(need, taken);
  const updated = setLoadedAmmo({ ...player, inventory }, w.id, cur + load);
  const next = { ...state, players: [...state.players] };
  next.players[pIdx] = updated;
  return next;
}

export function takeAmmoFromCamp(state: any, opts: { loose: number; boxes: number }){
  const loose = Math.max(0, Math.floor(opts?.loose ?? 0));
  const boxes = Math.max(0, Math.floor(opts?.boxes ?? 0));
  const total = loose + boxes * 15;
  const stock = Math.max(0, Number(state?.camp?.resources?.ammo ?? 0));
  if (total <= 0 || total > stock) return state;
  const pIdx = state?.turn?.activeIndex ?? 0;
  const player = state?.players?.[pIdx];
  if (!player) return state;
  let inventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
  if (loose > 0) inventory = addLoose(inventory, loose);
  for (let i = 0; i < boxes; i++) inventory = addBox(inventory, 15);
  const nextPlayers = [...state.players];
  nextPlayers[pIdx] = { ...player, inventory };
  return {
    ...state,
    camp: { ...(state.camp ?? {}), resources: { ...(state.camp?.resources ?? {}), ammo: stock - total } },
    players: nextPlayers,
  };
}

export function canReloadFromBackpack(player: any): boolean {
  const w = getSelectedWeapon(player);
  if (!isRangedWeapon(w)) return false;
  const hasLoose = listLoose(player?.inventory).length > 0;
  const hasBoxes = listAmmoBoxes(player?.inventory).length > 0;
  return hasLoose || hasBoxes;
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
  return loadFromBackpackExact(state, free);
}

export const listAmmoboxes = listAmmoBoxes;
