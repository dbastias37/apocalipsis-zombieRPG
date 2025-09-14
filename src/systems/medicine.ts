export type MedkitItem = { type:'medkit'; medicines:number; name?:string };

export const isMedkit = (it:any): it is MedkitItem => !!it && typeof it==='object' && it.type==='medkit';

export function medCount(it:any){
  return isMedkit(it) ? Math.max(0, Math.floor(it.medicines || 0)) : 0;
}
export function setMedCount(it:MedkitItem,n:number):MedkitItem{
  return { ...it, medicines: Math.max(0, Math.floor(n)) };
}

function consumeFromList(list:any[]|null|undefined, need:number){
  const arr = Array.isArray(list) ? [...list] : [];
  const n = Math.max(0, Math.floor(need));
  let taken = 0;
  for(let i=0;i<arr.length && taken<n;i++){
    const it = arr[i];
    if(!isMedkit(it)) continue;
    const cnt = medCount(it);
    if(cnt<=0) continue;
    const take = Math.min(n - taken, cnt);
    const left = cnt - take;
    if(left<=0){ arr.splice(i,1); i--; }
    else arr[i] = setMedCount(it,left);
    taken += take;
  }
  return { list: arr, taken };
}

export function countMedicineInInventory(player:any): number {
  const inv = Array.isArray(player?.inventory) ? player.inventory : [];
  const pack = Array.isArray(player?.backpack) ? player.backpack : [];
  return [...inv, ...pack].reduce((sum,it)=> sum + medCount(it), 0);
}

export function consumeMedicineFromPlayer(player:any, n:number){
  const need = Math.max(0, Math.floor(n));
  if(need<=0) return { player, taken:0 };
  let inventory = Array.isArray(player?.inventory) ? [...player.inventory] : [];
  let backpack = Array.isArray(player?.backpack) ? [...player.backpack] : [];
  const rInv = consumeFromList(inventory, need);
  let taken = rInv.taken;
  inventory = rInv.list;
  if(taken < need){
    const rPack = consumeFromList(backpack, need - taken);
    taken += rPack.taken;
    backpack = rPack.list;
  }
  return { player: { ...player, inventory, backpack }, taken };
}

export function addMedicineToCamp(state:any, n:number){
  const stock = Math.max(0, Number(state?.camp?.resources?.medicine ?? 0));
  const add = Math.max(0, Math.floor(n));
  return {
    ...state,
    camp:{
      ...(state.camp ?? {}),
      resources:{ ...(state.camp?.resources ?? {}), medicine: stock + add }
    }
  };
}

export function takeMedicineFromCamp(state:any, n:number){
  const stock = Math.max(0, Number(state?.camp?.resources?.medicine ?? 0));
  const take = Math.min(stock, Math.max(0, Math.floor(n)));
  const next = {
    ...state,
    camp:{ ...(state.camp ?? {}), resources:{ ...(state.camp?.resources ?? {}), medicine: stock - take } }
  };
  return { state: next, taken: take };
}
