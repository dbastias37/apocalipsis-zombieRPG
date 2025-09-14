import { consumeFoodFromPlayer } from "../systems/food";
import { consumeMedicineFromPlayer } from "../systems/medicine";

declare global {
  interface Window {
    consumeFoodInventoryItem?: (player:any, amount:number)=>any;
    consumeMedItem?: (player:any, amount:number)=>any;
    consumeFoodForPlayer?: (player:any, amount:number)=>any;
  }
}

(function install(){
  const g = window as any;
  if(typeof g.consumeFoodInventoryItem!=="function"){
    g.consumeFoodInventoryItem = (p:any, n:number=1)=> consumeFoodFromPlayer(p, n);
  }
  if(typeof g.consumeFoodForPlayer!=="function"){
    g.consumeFoodForPlayer = (p:any, n:number=1)=> consumeFoodFromPlayer(p, n);
  }
  if(typeof g.consumeMedItem!=="function"){
    g.consumeMedItem = (p:any, n:number=1)=> consumeMedicineFromPlayer(p, n);
  }
})();
export {};

