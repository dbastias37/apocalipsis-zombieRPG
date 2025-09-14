function norm(s?: string){ return String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase(); }
export type MedkitItem = { type:"med"; kind:"medkit"; amount:number; name?:string };
export function isMedkit(it:any): it is MedkitItem {
  if(!it) return false;
  if(typeof it==="object" && (it.type==="med" || it.type==="medicine")) return true;
  const n = norm((it?.name ?? it?.title ?? it)+"");
  return n.includes("med") || n.includes("botiquin") || n.includes("botiquín") || n.includes("cura") || n.includes("medicina");
}
export function medkitCount(it:any): number {
  const n = Number(it?.amount ?? it?.qty ?? it?.count ?? 0);
  if(Number.isFinite(n) && n>0) return Math.floor(n);
  const name = String(it?.name ?? it?.title ?? "");
  const m = name.match(/\((\d+)\)/);
  return m ? Math.max(0, parseInt(m[1],10)) : (isMedkit(it) ? 1 : 0);
}
export function ensureMedkit(it:any, amount:number){
  const amt = Math.max(0, Math.floor(amount));
  const base = typeof it==="object" ? it : {};
  return { ...base, type:"med", kind:"medkit", amount:amt, qty:amt, count:amt, name: base?.name ?? `Botiquín (${amt})` } as MedkitItem;
}
function listMedkits(inv:any[]|null|undefined){
  const arr = Array.isArray(inv)? inv : [];
  return arr.map((it,i)=>({ i, it, units: medkitCount(it) })).filter(r=> isMedkit(r.it) && r.units>0);
}
function consumeFromList(list:any[], need:number){
  const out = [...list]; let taken = 0;
  for(let i=0;i<out.length && taken<need;i++){
    const it = out[i]; const units = isMedkit(it) ? medkitCount(it) : 0;
    if(units<=0) continue;
    const take = Math.min(need-taken, units);
    const left = units - take;
    if(left<=0) { out.splice(i,1); i--; }
    else { out[i] = ensureMedkit(it, left); }
    taken += take;
  }
  return { out, taken };
}
export function totalMedicineInInventory(inv:any[]|null|undefined){
  return listMedkits(inv).reduce((a,r)=>a+r.units,0);
}
export function consumeMedicineFromPlayer(player:any, need:number){
  const inv = Array.isArray(player?.inventory)? player.inventory : [];
  const bp  = Array.isArray(player?.backpack) ? player.backpack  : [];
  const a = consumeFromList(inv, Math.max(0, Math.floor(need)));
  const b = a.taken>=need ? { out: bp, taken: 0 } : consumeFromList(bp, need - a.taken);
  return { player: { ...player, inventory: a.out, backpack: b.out }, taken: a.taken + b.taken };
}
export function addMedicineToCamp(state:any, n:number){
  const next = structuredClone(state ?? {});
  const cur = Math.max(0, Number(next?.resources?.medicine ?? 0));
  next.resources = { ...(next.resources??{}), medicine: cur + Math.max(0, Math.floor(n)) };
  return next;
}
export function takeMedicineFromCamp(state:any, n:number){
  const next = structuredClone(state ?? {});
  const cur = Math.max(0, Number(next?.resources?.medicine ?? 0));
  const take = Math.min(cur, Math.max(0, Math.floor(n)));
  next.resources = { ...(next.resources??{}), medicine: cur - take };
  return { state: next, taken: take };
}

// Backwards compatibility aliases
export { medkitCount as medCount, ensureMedkit as setMedCount };

