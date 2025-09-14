import { consumeFoodFromPlayer } from "../systems/food";
import { consumeMedicineFromPlayer } from "../systems/medicine";

// mapear globals antiguos si faltan
if(!(window as any).consumeFoodInventoryItem){
  (window as any).consumeFoodInventoryItem = (p:any,n:number)=>consumeFoodFromPlayer(p,n);
}
if(!(window as any).consumeMedItem){
  (window as any).consumeMedItem = (p:any,n:number)=>consumeMedicineFromPlayer(p,n);
}
