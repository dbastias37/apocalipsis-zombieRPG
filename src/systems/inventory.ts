import { FOOD_CATALOG, MED_CATALOG } from "../data/consumables";
import { gameLog } from "../utils/logger";
import type { CampState, FoodItem, InventoryItem, MedItem } from "../types/inventory";

function toFoodItem(defId: string): FoodItem {
  const def = FOOD_CATALOG.find(f => f.id === defId) || FOOD_CATALOG[0];
  return { id: crypto.randomUUID(), name: def.name, type: 'food', energy: def.energy };
}

function toMedItem(defId: string): MedItem {
  const def = MED_CATALOG.find(m => m.id === defId) || MED_CATALOG[0];
  return { id: crypto.randomUUID(), name: def.name, type: 'med', heal: def.heal, kind: def.id };
}

export function materializeFoodFromStock(state: any, count: number, foodId: string): any {
  const n = Math.max(0, Math.floor(count));
  const stock = Number(state?.camp?.resources?.food ?? 0);
  if (n <= 0 || n > stock) return state;
  const items: InventoryItem[] = [];
  for (let i = 0; i < n; i++) items.push(toFoodItem(foodId));
  const stash = [ ...(state.camp?.stash ?? []), ...items ];
  return {
    ...state,
    camp: {
      ...(state.camp ?? {}),
      stash,
      resources: { ...(state.camp?.resources ?? {}), food: stock - n }
    }
  };
}

export function materializeMedFromStock(state: any, count: number, medId: string): any {
  const n = Math.max(0, Math.floor(count));
  const stock = Number(state?.camp?.resources?.medicine ?? 0);
  if (n <= 0 || n > stock) return state;
  const items: InventoryItem[] = [];
  for (let i = 0; i < n; i++) items.push(toMedItem(medId));
  const stash = [ ...(state.camp?.stash ?? []), ...items ];
  return {
    ...state,
    camp: {
      ...(state.camp ?? {}),
      stash,
      resources: { ...(state.camp?.resources ?? {}), medicine: stock - n }
    }
  };
}

export function moveFromStashToPlayer(state: any, playerId: string, itemId: string): any {
  const idx = state?.camp?.stash?.findIndex((it:InventoryItem)=>it.id===itemId) ?? -1;
  if (idx < 0) return state;
  const item = state.camp.stash[idx];
  const playerIdx = state.players?.findIndex((p:any)=>p.id===playerId) ?? -1;
  if (playerIdx < 0) return state;
  const player = state.players[playerIdx];
  const cap = player.backpackCapacity ?? 8;
  const used = Array.isArray(player.inventory) ? player.inventory.length : 0;
  if (used >= cap) { gameLog(`La mochila de ${player.name} está llena.`); return state; }
  const inventory = [ ...(player.inventory ?? []), item ];
  const stash = [ ...state.camp.stash ];
  stash.splice(idx,1);
  const players = [ ...state.players ];
  players[playerIdx] = { ...player, inventory };
  return { ...state, camp: { ...(state.camp ?? {}), stash }, players };
}

export function consumeFood(state: any, playerId: string, itemId: string): any {
  const pIdx = state?.players?.findIndex((p:any)=>p.id===playerId) ?? -1;
  if (pIdx < 0) return state;
  const player = state.players[pIdx];
  const idx = player.inventory.findIndex((it:InventoryItem)=>it.id===itemId && it.type==='food');
  if (idx < 0) return state;
  const item = player.inventory[idx] as FoodItem;
  const gain = Math.max(0, Math.min(item.energy, (player.energyMax ?? 100) - (player.energy ?? 0)));
  const inventory = [ ...player.inventory ];
  inventory.splice(idx,1);
  const players = [ ...state.players ];
  players[pIdx] = { ...player, inventory, energy: (player.energy ?? 0) + gain };
  gameLog(`🍽️ ${player.name} come ${item.name} (+${gain} energía).`);
  return { ...state, players };
}

export function consumeMed(state: any, playerId: string, itemId: string): any {
  const pIdx = state?.players?.findIndex((p:any)=>p.id===playerId) ?? -1;
  if (pIdx < 0) return state;
  const player = state.players[pIdx];
  const idx = player.inventory.findIndex((it:InventoryItem)=>it.id===itemId && it.type==='med');
  if (idx < 0) return state;
  const item = player.inventory[idx] as MedItem;
  const gain = Math.max(0, Math.min(item.heal, (player.hpMax ?? 0) - (player.hp ?? 0)));
  const inventory = [ ...player.inventory ];
  inventory.splice(idx,1);
  const players = [ ...state.players ];
  players[pIdx] = { ...player, inventory, hp: (player.hp ?? 0) + gain };
  gameLog(`💊 ${player.name} usa ${item.name} (+${gain} PV).`);
  return { ...state, players };
}

// Backwards-compatibility aliases for legacy imports
// (some modules may still expect these names)
export const consumeFoodInventoryItem = consumeFood;
export const consumeMedInventoryItem  = consumeMed;
