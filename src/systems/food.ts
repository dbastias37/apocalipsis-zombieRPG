function norm(s?: string){ return String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase(); }
export type FoodItem = { type:"food"; kind:"ration"; amount:number; name?:string };
export function isRation(it:any): it is FoodItem {
  if(!it) return false;
  if(typeof it==="object" && it.type==="food") return true;
  const n = norm((it?.name ?? it?.title ?? it)+"");
  return n.includes("comida") || n.includes("racion") || n.includes("ración") || n.includes("lata") || n.includes("conserva");
}
export function rationCount(it:any): number {
  const n = Number(it?.amount ?? it?.qty ?? it?.count ?? 0);
  if(Number.isFinite(n) && n>0) return Math.floor(n);
  const name = String(it?.name ?? it?.title ?? "");
  const m = name.match(/\((\d+)\)/);
  return m ? Math.max(0, parseInt(m[1],10)) : (isRation(it) ? 1 : 0);
}
export function ensureRation(it:any, amount:number){
  const amt = Math.max(0, Math.floor(amount));
  const base = typeof it==="object" ? it : {};
  return { ...base, type:"food", kind:"ration", amount:amt, qty:amt, count:amt, name: base?.name ?? `Ración (${amt})` } as FoodItem;
}
function listRations(inv:any[]|null|undefined){
  const arr = Array.isArray(inv)? inv : [];
  return arr.map((it,i)=>({ i, it, units: rationCount(it) })).filter(r=> isRation(r.it) && r.units>0);
}
function consumeFromList(list:any[], need:number){
  const out = [...list]; let taken = 0;
  for(let i=0;i<out.length && taken<need;i++){
    const it = out[i]; const units = isRation(it) ? rationCount(it) : 0;
    if(units<=0) continue;
    const take = Math.min(need-taken, units);
    const left = units - take;
    if(left<=0) { out.splice(i,1); i--; }
    else { out[i] = ensureRation(it, left); }
    taken += take;
  }
  return { out, taken };
}
export function totalFoodInInventory(inv:any[]|null|undefined){
  return listRations(inv).reduce((a,r)=>a+r.units,0);
}
// Consume primero inventory y luego backpack
export function consumeFoodFromPlayer(player:any, need:number){
  const inv = Array.isArray(player?.inventory)? player.inventory : [];
  const bp  = Array.isArray(player?.backpack) ? player.backpack  : [];
  const a = consumeFromList(inv, Math.max(0, Math.floor(need)));
  const b = a.taken>=need ? { out: bp, taken: 0 } : consumeFromList(bp, need - a.taken);
  return { player: { ...player, inventory: a.out, backpack: b.out }, taken: a.taken + b.taken };
}
// Campamento
export function addFoodToCamp(state:any, n:number){
  const next = structuredClone(state ?? {});
  const cur = Math.max(0, Number(next?.resources?.food ?? 0));
  next.resources = { ...(next.resources??{}), food: cur + Math.max(0, Math.floor(n)) };
  return next;
}
export function takeFoodFromCamp(state:any, n:number){
  const next = structuredClone(state ?? {});
  const cur = Math.max(0, Number(next?.resources?.food ?? 0));
  const take = Math.min(cur, Math.max(0, Math.floor(n)));
  next.resources = { ...(next.resources??{}), food: cur - take };
  return { state: next, taken: take };
}
