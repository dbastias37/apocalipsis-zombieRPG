import { getSelectedWeapon, isRangedWeapon } from "./weapons.js";

function norm(s?: string) {
  return String(s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function isAmmoBox(item: any): boolean {
  if (!item) return false;
  if (typeof item === "object" && item.type === "ammo" && item.kind === "box") return true;
  const n = norm(item.name ?? item.title ?? item);
  return n.includes("caja") && (n.includes("municion") || n.includes("munición"));
}

export function isLooseAmmo(item: any): boolean {
  if (!item) return false;
  if (typeof item === "object" && item.type === "ammo" && item.kind === "loose") return true;
  const n = norm(item.name ?? item.title ?? item);
  return (n.includes("municion") || n.includes("munición")) && !n.includes("caja");
}

export function ammoCount(item: any): number {
  const n = Number(item?.amount ?? item?.qty ?? item?.count ?? 0);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  const name = String(item?.name ?? item?.title ?? "");
  const m = name.match(/\((\d+)\)/);
  if (m) return Math.max(0, parseInt(m[1], 10));
  return isLooseAmmo(item) ? 1 : 0;
}

export function ensureAmmoNames(item: any) {
  const kind = item?.kind === "box" ? "box" : "loose";
  const amount = Math.max(0, Math.floor(Number(item?.amount ?? 0)));
  const name = kind === "box" ? `Caja de munición (${amount})` : `Munición (${amount})`;
  return { ...item, type: "ammo", kind, amount, qty: amount, count: amount, name };
}

export function listAmmoBoxes(inv: any[] | null | undefined) {
  const arr = Array.isArray(inv) ? inv : [];
  return arr
    .map((it, i) => ({ i, it, bullets: ammoCount(it) }))
    .filter(r => isAmmoBox(r.it) && r.bullets > 0);
}

export function listLoose(inv: any[] | null | undefined) {
  const arr = Array.isArray(inv) ? inv : [];
  return arr
    .map((it, i) => ({ i, it, bullets: ammoCount(it) }))
    .filter(r => isLooseAmmo(r.it) && r.bullets > 0);
}

export function addLoose(inv: any[] | null | undefined, n: number) {
  const arr = Array.isArray(inv) ? [...inv] : [];
  const amount = Math.max(0, Math.floor(n));
  if (amount <= 0) return arr;
  arr.push(ensureAmmoNames({ kind: "loose", amount }));
  return arr;
}

export function addBox(inv: any[] | null | undefined, n: number) {
  const arr = Array.isArray(inv) ? [...inv] : [];
  const amount = Math.max(0, Math.floor(n));
  if (amount <= 0) return arr;
  arr.push(ensureAmmoNames({ kind: "box", amount }));
  return arr;
}

export function reduceLoose(inv: any[] | null | undefined, need: number) {
  const arr = Array.isArray(inv) ? [...inv] : [];
  let taken = 0;
  for (let i = 0; i < arr.length && taken < need; i++) {
    const it = arr[i];
    const loose = isLooseAmmo(it) ? ammoCount(it) : 0;
    if (loose <= 0) continue;
    const take = Math.min(need - taken, loose);
    const left = loose - take;
    if (left <= 0) {
      arr.splice(i, 1); i--; // adjust index after removal
    } else {
      arr[i] = ensureAmmoNames({ ...(typeof it === "object" ? it : {}), kind: "loose", amount: left });
    }
    taken += take;
  }
  return { taken, inv: arr };
}

export function reduceBoxes(inv: any[] | null | undefined, need: number) {
  const arr = Array.isArray(inv) ? [...inv] : [];
  let taken = 0;
  for (let i = 0; i < arr.length && taken < need; i++) {
    const it = arr[i];
    const bullets = isAmmoBox(it) ? ammoCount(it) : 0;
    if (bullets <= 0) continue;
    const take = Math.min(need - taken, bullets);
    const left = bullets - take;
    if (left <= 0) {
      arr.splice(i, 1); i--;
    } else {
      arr[i] = ensureAmmoNames({ ...(typeof it === "object" ? it : {}), kind: "box", amount: left });
    }
    taken += take;
  }
  return { taken, inv: arr };
}

export function getLoadedAmmo(player: any, weaponId: string): number {
  const n = Number(player?.ammoByWeapon?.[weaponId] ?? 0);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function setLoadedAmmo(player: any, weaponId: string, n: number) {
  const table = { ...(player?.ammoByWeapon ?? {}) };
  table[weaponId] = Math.max(0, Math.floor(n));
  return { ...player, ammoByWeapon: table };
}

export function spendAmmo(player: any, weaponId: string, n = 1) {
  const cur = getLoadedAmmo(player, weaponId);
  if (cur < n) return { player, ok: false };
  return { player: setLoadedAmmo(player, weaponId, cur - n), ok: true };
}

export function takeAmmoFromCamp(state: any, { loose, boxes }: { loose: number; boxes: number }) {
  const l = Math.max(0, Math.floor(loose));
  const b = Math.max(0, Math.floor(boxes));
  const total = l + b * 15;
  const stock = Math.max(0, Number(state?.camp?.resources?.ammo ?? 0));
  if (total <= 0 || total > stock) return state;
  const idx = state?.turn?.activeIndex ?? 0;
  const player = state?.players?.[idx];
  if (!player) return state;
  let inventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
  if (l > 0) inventory = addLoose(inventory, l);
  for (let i = 0; i < b; i++) inventory = addBox(inventory, 15);
  const players = [...state.players];
  players[idx] = { ...player, inventory };
  return {
    ...state,
    camp: { ...(state.camp ?? {}), resources: { ...(state.camp?.resources ?? {}), ammo: stock - total } },
    players,
  };
}

export function loadFromBackpackExact(state: any, amount: number) {
  const idx = state?.turn?.activeIndex ?? 0;
  const player = state?.players?.[idx];
  if (!player) return state;
  const weapon = getSelectedWeapon(player);
  if (!isRangedWeapon(weapon)) return state;
  const mag = Number(weapon.magSize ?? 0);
  const loaded = getLoadedAmmo(player, weapon.id);
  const free = Math.max(0, mag - loaded);
  const loose = listLoose(player.inventory).reduce((a, r) => a + r.bullets, 0);
  const boxes = listAmmoBoxes(player.inventory).reduce((a, r) => a + r.bullets, 0);
  const available = loose + boxes;
  const need = Math.min(Math.max(0, Math.floor(amount)), free, available);
  if (need <= 0) return state;
  let inventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
  const rLoose = reduceLoose(inventory, need);
  let taken = rLoose.taken;
  inventory = rLoose.inv;
  if (taken < need) {
    const rBox = reduceBoxes(inventory, need - taken);
    taken += rBox.taken;
    inventory = rBox.inv;
  }
  if (taken <= 0) return state;
  const nextPlayer = setLoadedAmmo({ ...player, inventory }, weapon.id, loaded + taken);
  const players = [...state.players];
  players[idx] = nextPlayer;
  return { ...state, players };
}

export function reloadSelectedWeapon(state: any) {
  const idx = state?.turn?.activeIndex ?? 0;
  const player = state?.players?.[idx];
  if (!player) return state;
  const weapon = getSelectedWeapon(player);
  if (!isRangedWeapon(weapon)) return state;
  const mag = Number(weapon.magSize ?? 0);
  const loaded = getLoadedAmmo(player, weapon.id);
  const free = Math.max(0, mag - loaded);
  if (free <= 0) return state;
  return loadFromBackpackExact(state, free);
}

export function canReloadFromBackpack(player: any) {
  const w = getSelectedWeapon(player);
  if (!isRangedWeapon(w)) return false;
  return listLoose(player?.inventory).length > 0 || listAmmoBoxes(player?.inventory).length > 0;
}

export function totalAmmoInInventory(inv: any[] | null | undefined): number {
  if (!Array.isArray(inv)) return 0;
  const loose = listLoose(inv).reduce((a, r) => a + r.bullets, 0);
  const boxes = listAmmoBoxes(inv).reduce((a, r) => a + r.bullets, 0);
  return loose + boxes;
}

export const listAmmoboxes = listAmmoBoxes;
