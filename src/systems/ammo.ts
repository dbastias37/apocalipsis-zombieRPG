import { getSelectedWeapon, isRangedWeapon } from "./weapons";

function norm(s?: string){ return String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase(); }

// ¿Es una CAJA de munición?
export function isAmmoBox(item: any): boolean {
  if (!item) return false;
  if (item.type === "ammo" && item.kind === "box") return true;
  const n = norm(item.name ?? item.title);
  return /(caja).*(municion)/.test(n);
}

// ¿Es munición suelta?
export function isLooseAmmo(item:any): boolean {
  if (!item) return false;
  if (item.type === "ammo" && item.kind !== "box") return true;
  const n = norm(item.name ?? item.title);
  return /\bmunicion\b/.test(n) && !/(caja)/.test(n);
}

// Balas contenidas en un item (caja o suelta)
export function ammoCount(item:any): number {
  const fromField = Number(item.amount ?? item.qty ?? item.count ?? 0);
  if (fromField > 0) return fromField;
  const m = String(item.name ?? item.title ?? "").match(/\((\d+)\)/);
  return m ? Number(m[1]) : (isLooseAmmo(item) ? 1 : 0);
}

// Listados y consumo
export function listAmmoBoxes(inv:any[]|undefined|null){
  const a = Array.isArray(inv)? inv : [];
  return a.map((it,i)=>({i,it,bullets:ammoCount(it)})).filter(x=>isAmmoBox(x.it) && x.bullets>0);
}

export function listLoose(inv:any[]|undefined|null){
  const a = Array.isArray(inv)? inv : [];
  return a.map((it,i)=>({i,it,bullets:ammoCount(it)})).filter(x=>isLooseAmmo(x.it) && x.bullets>0);
}

export function consumeOneBox(inv:any[]|undefined|null){
  const arr = Array.isArray(inv)? [...inv] : [];
  const boxes = listAmmoBoxes(arr);
  if (!boxes.length) return { bullets:0, inv:arr };
  const { i, bullets } = boxes[0];
  arr.splice(i,1);
  return { bullets, inv:arr };
}

export function consumeLoose(inv:any[]|undefined|null, need:number){
  const arr = Array.isArray(inv)? [...inv] : [];
  const loose = listLoose(arr);
  let taken = 0;
  for (const x of loose){
    if (taken >= need) break;
    const take = Math.min(need - taken, x.bullets);
    const left = x.bullets - take;
    if (left <= 0) arr.splice(x.i,1); else arr[x.i] = { ...(x.it), amount:left, qty:left, count:left };
    taken += take;
  }
  return { taken, inv:arr };
}

// Leer/guardar munición cargada por arma
export function getLoaded(player:any, weaponId:string){ return Math.max(0, Number(player?.weaponState?.[weaponId]?.ammoInMag ?? 0)); }
export function setLoaded(player:any, weaponId:string, count:number){
  const ws = { ...(player.weaponState ?? {}) };
  ws[weaponId] = { ammoInMag: Math.max(0, Math.floor(count)) };
  return { ...player, weaponState: ws };
}

// Recarga del arma seleccionada del jugador activo
export function reloadSelectedWeapon(state:any){
  const turn = state.turn;
  const pIdx = turn.activeIndex ?? 0;
  const player = state.players[pIdx];
  const w = getSelectedWeapon(player);
  if (!isRangedWeapon(w)) return state;

  const mag = Number(w.magSize ?? 99);
  const cur = getLoaded(player, w.id);
  if (cur >= mag) return state;

  let inv = Array.isArray(player.backpack) ? player.backpack : (Array.isArray(player.inventory) ? player.inventory : []);
  const need = mag - cur;

  // Primero intenta con CAJA
  let { bullets, inv:inv1 } = consumeOneBox(inv);
  let gained = bullets;
  let invFinal = inv1;

  // Si no hay caja, usa sueltas
  if (gained <= 0){
    const r = consumeLoose(inv, need);
    gained = r.taken;
    invFinal = r.inv;
  }
  if (gained <= 0) return state;

  const nextCount = Math.min(mag, cur + gained);
  const newPlayer = setLoaded({ ...player, backpack:invFinal, inventory:invFinal }, w.id, nextCount);
  const players = [...state.players]; players[pIdx] = newPlayer;
  return { ...state, players };
}
