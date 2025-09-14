// src/systems/food.ts
// Funciones puras para manejar "raciones" de comida
export type FoodItem = { type:"food"; kind:"ration"; amount:number; name?:string };

import { getEnergy, getEnergyMax, withEnergy } from "./actors";

const NUTRITION: Record<string, number> = {
  "barra de cereal": 10,
  "barrita de cereal": 10,
  "lata": 12,
  "enlatado": 12,
  "racion": 8, "ración": 8,
};
function norm(s?:string){ return String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().trim(); }

export function getNutritionForItem(it:any): number {
  const n = norm(it?.name ?? it?.title ?? it?.label);
  for (const k of Object.keys(NUTRITION)) if (n.includes(k)) return NUTRITION[k];
  const guess = Number(it?.amount ?? it?.nutrition ?? 1);
  return Number.isFinite(guess) && guess>0 ? Math.floor(guess) : 1;
}

export function isRation(it:any): it is FoodItem {
  if (!it) return false;
  if (typeof it === "object" && it.type === "food") return true;
  const n = norm(it?.name ?? it?.title ?? it);
  return n.includes("racion") || n.includes("ración") || n.includes("comida") || n.includes("lata");
}

export function rationCount(it:any): number {
  if (!it) return 0;
  if (typeof it === "object") {
    const n = Number(it.amount ?? it.qty ?? it.count ?? 0);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
    const m = String(it.name ?? it.title ?? "").match(/\((\d+)\)/);
    return m ? Math.max(0, parseInt(m[1],10)) : (it.type === "food" ? 1 : 0);
  }
  const m = String(it).match(/\((\d+)\)/);
  return m ? Math.max(0, parseInt(m[1],10)) : 0;
}

function ensureRation(it:any, amount:number): FoodItem {
  const amt = Math.max(0, Math.floor(amount));
  const base = typeof it === "object" ? it : {};
  return { ...base, type:"food", kind:"ration", amount: amt, name: base?.name ?? `Ración (${amt})` };
}

function consumeFromList(list:any[], need:number){
  const out = [...list]; let taken = 0;
  for (let i=0; i<out.length && taken<need; i++){
    const it = out[i]; const units = isRation(it) ? rationCount(it) : 0;
    if (units<=0) continue;
    const take = Math.min(need - taken, units);
    const left = units - take;
    if (left<=0) { out.splice(i,1); i--; } else { out[i] = ensureRation(it, left); }
    taken += take;
  }
  return { out, taken };
}

export function totalFoodInInventory(inv:any[]|null|undefined){
  const arr = Array.isArray(inv) ? inv : [];
  return arr.reduce((a,it)=> a + (isRation(it) ? rationCount(it) : 0), 0);
}

// Consume primero inventory y luego backpack; devuelve { player, taken }
export function consumeFoodFromPlayer(player:any, need:number){
  const inv = Array.isArray(player?.inventory) ? player.inventory : [];
  const bp  = Array.isArray(player?.backpack)  ? player.backpack  : [];
  const n = Math.max(0, Math.floor(need));
  const a = consumeFromList(inv, n);
  const b = a.taken >= n ? { out: bp, taken: 0 } : consumeFromList(bp, n - a.taken);
  return { player: { ...player, inventory: a.out, backpack: b.out }, taken: a.taken + b.taken };
}

export function eat(player:any, foodItem:any){
  const gain = Math.max(0, Math.floor(getNutritionForItem(foodItem)));
  const cur = getEnergy(player), max = getEnergyMax(player);
  const delta = Math.max(0, Math.min(gain, max - cur));
  const next = withEnergy(player, cur + delta);
  return { player: next, delta };
}

// Operaciones en el campamento (recursos.globales)
export function addFoodToCamp(state:any, amount:number){
  const next = structuredClone(state ?? {});
  const cur = Math.max(0, Number(next?.resources?.food ?? 0));
  next.resources = { ...(next.resources ?? {}), food: cur + Math.max(0, Math.floor(amount)) };
  return next;
}

export function takeFoodFromCamp(state:any, amount:number){
  const next = structuredClone(state ?? {});
  const cur = Math.max(0, Number(next?.resources?.food ?? 0));
  const take = Math.min(cur, Math.max(0, Math.floor(amount)));
  next.resources = { ...(next.resources ?? {}), food: cur - take };
  return { state: next, taken: take };
}
