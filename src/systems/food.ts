export type FoodItem = { type:'ration'; food:number; name?:string };

export const isRation = (it:any): it is FoodItem => !!it && typeof it==='object' && it.type==='ration';

function foodCount(it:any){
  return isRation(it) ? Math.max(0, Math.floor(it.food || 0)) : 0;
}
function setFoodCount(it:FoodItem,n:number):FoodItem{
  return { ...it, food: Math.max(0, Math.floor(n)) };
}

function consumeFromList(list:any[]|null|undefined, need:number){
  const arr = Array.isArray(list) ? [...list] : [];
  const n = Math.max(0, Math.floor(need));
  let taken = 0;
  for(let i=0;i<arr.length && taken<n;i++){
    const it = arr[i];
    if(!isRation(it)) continue;
    const cnt = foodCount(it);
    if(cnt<=0) continue;
    const take = Math.min(n - taken, cnt);
    const left = cnt - take;
    if(left<=0){ arr.splice(i,1); i--; }
    else arr[i] = setFoodCount(it,left);
    taken += take;
  }
  return { list: arr, taken };
}

export function countFoodInInventory(player:any): number {
  const inv = Array.isArray(player?.inventory) ? player.inventory : [];
  const pack = Array.isArray(player?.backpack) ? player.backpack : [];
  return [...inv, ...pack].reduce((sum,it)=> sum + foodCount(it), 0);
}

export function consumeFoodFromPlayer(player:any, n:number){
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

export function addFoodToCamp(state:any, n:number){
  const stock = Math.max(0, Number(state?.camp?.resources?.food ?? 0));
  const add = Math.max(0, Math.floor(n));
  return {
    ...state,
    camp:{
      ...(state.camp ?? {}),
      resources:{ ...(state.camp?.resources ?? {}), food: stock + add }
    }
  };
}

export function takeFoodFromCamp(state:any, n:number){
  const stock = Math.max(0, Number(state?.camp?.resources?.food ?? 0));
  const take = Math.min(stock, Math.max(0, Math.floor(n)));
  const next = {
    ...state,
    camp:{ ...(state.camp ?? {}), resources:{ ...(state.camp?.resources ?? {}), food: stock - take } }
  };
  return { state: next, taken: take };
}
