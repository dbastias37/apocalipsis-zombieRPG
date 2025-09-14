// src/compat/legacy-globals.ts
// Define funciones globales antiguas si no existen, para evitar crashes.
import { consumeFoodFromPlayer } from "../systems/food";
import { consumeMedicineFromPlayer } from "../systems/medicine";

declare global {
  interface Window {
    consumeFoodInventoryItem?: (player:any, amount:number)=>any;
    consumeFoodForPlayer?: (player:any, amount:number)=>any;
    consumeMedItem?: (player:any, amount:number)=>any;
    consumeMedForPlayer?: (player:any, amount:number)=>any;
  }
}

(function installLegacyGlobals(){
  const g = window as any;
  const wrap = (fn:(p:any,n:number)=>any, tag:string) =>
    (p:any, n:number=1) => {
      console.warn(`[compat] ${tag} llamado`, { n });
      try { return fn(p, n); } catch(e){ console.error(`[compat] fallo ${tag}`, e); return { player:p, taken:0 }; }
    };

  if (typeof g.consumeFoodInventoryItem !== "function")
    g.consumeFoodInventoryItem = wrap(consumeFoodFromPlayer, "consumeFoodInventoryItem");
  if (typeof g.consumeFoodForPlayer !== "function")
    g.consumeFoodForPlayer = wrap(consumeFoodFromPlayer, "consumeFoodForPlayer");
  if (typeof g.consumeMedItem !== "function")
    g.consumeMedItem = wrap(consumeMedicineFromPlayer, "consumeMedItem");
  if (typeof g.consumeMedForPlayer !== "function")
    g.consumeMedForPlayer = wrap(consumeMedicineFromPlayer, "consumeMedForPlayer");
})();

export {};
