import { getSelectedWeapon, isRangedWeapon } from "./weapons.js";
import { WEAPONS } from "../data/weapons";

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
  const amount = Math.max(0, Math.floor(Number(item?.amount ?? item?.bullets ?? 0)));
  const id = item?.id ?? crypto.randomUUID();
  const name = kind === "box" ? `Caja de munición (${amount})` : `Munición (${amount})`;
  return { ...item, id, type: "ammo", kind, amount, bullets: amount, qty: amount, count: amount, name };
}

export function toAmmoBox(bullets: number) {
  return ensureAmmoNames({ kind: "box", amount: bullets });
}

export function toLooseAmmo(bullets: number) {
  return ensureAmmoNames({ kind: "loose", amount: bullets });
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

export function getTotalAmmoAvailable(player: any){
  const inv = Array.isArray(player?.inventory) ? player.inventory : [];
  let loose = 0, boxesBullets = 0, boxesCount = 0;
  for (const it of inv){
    const boxB = isAmmoBox(it) ? ammoCount(it) : 0;
    if (boxB > 0){ boxesBullets += boxB; boxesCount += 1; continue; }
    const looseN = isLooseAmmo(it) ? ammoCount(it) : 0;
    loose += looseN;
  }
  return { loose, boxesBullets, boxesCount, total: loose + boxesBullets };
}

export function consumeAmmoFromPlayer(player:any, requested:number){
  let need = Math.max(0, Math.floor(requested));
  if (need <= 0) return { player, taken: 0 };
  let inventory = Array.isArray(player?.inventory) ? [...player.inventory] : [];
  const rLoose = reduceLoose(inventory, need);
  let taken = rLoose.taken;
  inventory = rLoose.inv;
  if (taken < need){
    const rBox = reduceBoxes(inventory, need - taken);
    taken += rBox.taken;
    inventory = rBox.inv;
  }
  return { player: { ...player, inventory }, taken };
}

export function listReloadableWeapons(player:any): {id:string; name:string}[] {
  const list: {id:string; name:string}[] = [];
  const add = (id:string,name:string)=>{ if(!list.find(w=>w.id===id)) list.push({id,name}); };
  const norm = (s?:string)=>String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase();
  const selId = (player as any)?.currentWeaponId ?? (player as any)?.selectedWeaponId;
  const byId = selId ? WEAPONS.find(w => w.id === selId) : null;
  const fromGetter = typeof getSelectedWeapon === 'function' ? getSelectedWeapon(player) : null;
  const sel = byId?.type === 'ranged' ? byId : (fromGetter && fromGetter.type === 'ranged' ? fromGetter : null);
  if (sel) add(sel.id, sel.name ?? sel.id);
  const inv = Array.isArray(player?.inventory) ? player.inventory : [];
  for (const it of inv){
    if (typeof it === 'string'){
      const s = norm(it);
      const m = WEAPONS.find(w=>w.type==='ranged' && (norm(w.name)===s || w.id===s));
      if (m) add(m.id, m.name);
      continue;
    }
    if (it && typeof it === 'object'){
      if (it.type === 'ranged' && typeof it.id === 'string'){
        const m = WEAPONS.find(w=>w.id===it.id) ?? {id:it.id,name:(it as any).name ?? it.id};
        add(m.id, m.name);
      } else if (typeof (it as any).name === 'string'){
        const nm = norm((it as any).name);
        const m2 = WEAPONS.find(w=>w.type==='ranged' && norm(w.name)===nm);
        if (m2) add(m2.id, m2.name);
      }
    }
  }
  return list;
}
