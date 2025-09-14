export type AmmoItem   = { type:'ammo',   kind:'loose'|'box', amount:number };
export type MedkitItem = { type:'medkit', medicines:number };
export type FoodItem   = { type:'ration', food:number };
export type BackpackItem = string | AmmoItem | MedkitItem | FoodItem;

// Reexport existing ammo utilities
export * from './ammo.js';

export const isMedkit = (it:any): it is MedkitItem => !!it && typeof it==='object' && it.type==='medkit';
export const medCount = (it:any) => isMedkit(it) ? Math.max(0, Math.floor(it.medicines||0)) : 0;
export const setMedCount = (it:MedkitItem, n:number):MedkitItem => ({...it, medicines: Math.max(0, Math.floor(n))});

export function addMedicineToCamp(state:any, n:number){
  const stock = Math.max(0, Number(state?.camp?.resources?.medicine ?? 0));
  const add = Math.max(0, Math.floor(n));
  return {
    ...state,
    camp: {
      ...(state.camp ?? {}),
      resources: { ...(state.camp?.resources ?? {}), medicine: stock + add }
    }
  };
}

export function takeMedicineFromCamp(state:any, n:number){
  const stock = Math.max(0, Number(state?.camp?.resources?.medicine ?? 0));
  const take = Math.max(0, Math.floor(n));
  if(take<=0 || take>stock) return state;
  const stash = Array.isArray(state?.camp?.stash) ? [...state.camp.stash] : [];
  stash.push({ type:'medkit', medicines: take });
  return {
    ...state,
    camp:{
      ...(state.camp ?? {}),
      stash,
      resources:{ ...(state.camp?.resources ?? {}), medicine: stock - take }
    }
  };
}

export function consumeMedicineFromPlayer(player:any, need:number){
  const n = Math.max(0, Math.floor(need));
  if(n<=0) return { player, taken:0 };
  const inv = Array.isArray(player.inventory) ? [...player.inventory] : [];
  const pack = Array.isArray(player.backpack) ? [...player.backpack] : [];
  const r1 = consumeFromList(inv, n, medCount, setMedCount, isMedkit);
  let taken = r1.taken;
  let inventory = r1.list;
  let backpack = pack;
  if(taken < n){
    const r2 = consumeFromList(pack, n - taken, medCount, setMedCount, isMedkit);
    taken += r2.taken;
    backpack = r2.list;
  }
  return { player:{ ...player, inventory, backpack }, taken };
}

export const isRation = (it:any): it is FoodItem => !!it && typeof it==='object' && it.type==='ration';
export const rationCount = (it:any) => isRation(it) ? Math.max(0, Math.floor(it.food||0)) : 0;
export const setRationCount = (it:FoodItem, n:number):FoodItem => ({...it, food: Math.max(0, Math.floor(n))});

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
  const take = Math.max(0, Math.floor(n));
  if(take<=0 || take>stock) return state;
  const stash = Array.isArray(state?.camp?.stash) ? [...state.camp.stash] : [];
  stash.push({ type:'ration', food: take });
  return {
    ...state,
    camp:{
      ...(state.camp ?? {}),
      stash,
      resources:{ ...(state.camp?.resources ?? {}), food: stock - take }
    }
  };
}

export function consumeFoodFromPlayer(player:any, need:number){
  const n = Math.max(0, Math.floor(need));
  if(n<=0) return { player, taken:0 };
  const inv = Array.isArray(player.inventory) ? [...player.inventory] : [];
  const pack = Array.isArray(player.backpack) ? [...player.backpack] : [];
  const r1 = consumeFromList(inv, n, rationCount, setRationCount, isRation);
  let taken = r1.taken;
  let inventory = r1.list;
  let backpack = pack;
  if(taken < n){
    const r2 = consumeFromList(pack, n - taken, rationCount, setRationCount, isRation);
    taken += r2.taken;
    backpack = r2.list;
  }
  return { player:{ ...player, inventory, backpack }, taken };
}

export function consumeFromList(list:any[]|null|undefined, need:number, getCount:(it:any)=>number, setCount:(it:any,n:number)=>any, isMatch:(it:any)=>boolean){
  const arr = Array.isArray(list) ? [...list] : [];
  const n = Math.max(0, Math.floor(need));
  let taken = 0;
  for(let i=0;i<arr.length && taken<n;i++){
    const it = arr[i];
    if(!isMatch(it)) continue;
    const cnt = getCount(it);
    if(cnt<=0) continue;
    const take = Math.min(n - taken, cnt);
    const left = cnt - take;
    if(left<=0){ arr.splice(i,1); i--; }
    else arr[i] = setCount(it, left);
    taken += take;
  }
  return { list: arr, taken };
}
