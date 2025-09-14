// src/systems/medicine.ts
export type MedItem = { type:"med"; kind:"dose"|"kit"; amount:number; name?:string };

function norm(s?: string){ return String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase(); }

export function isMed(it:any): it is MedItem {
  if (!it) return false;
  if (typeof it === "object" && it.type === "med") return true;
  const n = norm(it?.name ?? it?.title ?? it);
  return n.includes("medicina") || n.includes("botiquin") || n.includes("botiquín") || n.includes("vend") || n.includes("analges") || n.includes("antibiot");
}

export function medCount(it:any): number {
  if (!it) return 0;
  if (typeof it === "object") {
    const n = Number(it.amount ?? it.qty ?? it.count ?? it.medicines ?? 0);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
    const m = String(it.name ?? it.title ?? "").match(/\((\d+)\)/);
    return m ? Math.max(0, parseInt(m[1],10)) : (it.type === "med" ? 1 : 0);
  }
  const m = String(it).match(/\((\d+)\)/);
  return m ? Math.max(0, parseInt(m[1],10)) : 0;
}

function ensureMed(it:any, amount:number): MedItem {
  const amt = Math.max(0, Math.floor(amount));
  const base = typeof it === "object" ? it : {};
  const kind: "dose"|"kit" = base?.kind === "kit" ? "kit" : "dose";
  const name = base?.name ?? (kind==="kit" ? `Botiquín (${amt})` : `Medicina (${amt})`);
  return { ...base, type:"med", kind, amount: amt, name };
}

function consumeFromList(list:any[], need:number){
  const out = [...list]; let taken = 0;
  for (let i=0; i<out.length && taken<need; i++){
    const it = out[i]; const units = isMed(it) ? medCount(it) : 0;
    if (units<=0) continue;
    const take = Math.min(need - taken, units);
    const left = units - take;
    if (left<=0) { out.splice(i,1); i--; } else { out[i] = ensureMed(it, left); }
    taken += take;
  }
  return { out, taken };
}

export function totalMedInInventory(inv:any[]|null|undefined){
  const arr = Array.isArray(inv) ? inv : [];
  return arr.reduce((a,it)=> a + (isMed(it) ? medCount(it) : 0), 0);
}

export function consumeMedicineFromPlayer(player:any, need:number){
  const inv = Array.isArray(player?.inventory) ? player.inventory : [];
  const bp  = Array.isArray(player?.backpack)  ? player.backpack  : [];
  const n = Math.max(0, Math.floor(need));
  const a = consumeFromList(inv, n);
  const b = a.taken >= n ? { out: bp, taken: 0 } : consumeFromList(bp, n - a.taken);
  return { player: { ...player, inventory: a.out, backpack: b.out }, taken: a.taken + b.taken };
}

export function addMedicineToCamp(state:any, amount:number){
  const next = structuredClone(state ?? {});
  const cur = Math.max(0, Number(next?.resources?.medicine ?? 0));
  next.resources = { ...(next.resources ?? {}), medicine: cur + Math.max(0, Math.floor(amount)) };
  return next;
}

export function takeMedicineFromCamp(state:any, amount:number){
  const next = structuredClone(state ?? {});
  const cur = Math.max(0, Number(next?.resources?.medicine ?? 0));
  const take = Math.min(cur, Math.max(0, Math.floor(amount)));
  next.resources = { ...(next.resources ?? {}), medicine: cur - take };
  return { state: next, taken: take };
}

export { ensureMed as setMedCount };
