import { containersDay1, containersDay2, containersDay3 } from '../data/containers.index';
import { ExplorationContainer } from '../types/exploration';
import { GameState } from '../types/game';
import { gameLog } from '../utils/logger';

function ensureContainersState(state: GameState) {
  if (!state.containersState) {
    (state as any).containersState = {
      openedIdsByDay: { 1: new Set<string>(), 2: new Set<string>(), 3: new Set<string>() },
      lastOpenedWasContainer: false,
    };
  }
  const map = state.containersState.openedIdsByDay;
  // Normalize arrays to Set if persisted
  [1,2,3].forEach(d => {
    const v: any = (map as any)[d];
    if (!(v instanceof Set)) {
      (map as any)[d] = new Set<string>(Array.isArray(v) ? v : []);
    }
  });
}

export function getContainersForDay(day:number): ExplorationContainer[] {
  if (day === 1) return containersDay1;
  if (day === 2) return containersDay2;
  return containersDay3;
}

export function getAvailableContainers(day:number, state:GameState): ExplorationContainer[] {
  ensureContainersState(state);
  const opened = state.containersState.openedIdsByDay[day] as Set<string>;
  return getContainersForDay(day).filter(c => !opened.has(c.id));
}

export function pickRandomContainer(day:number, state:GameState): ExplorationContainer | null {
  const pool = getAvailableContainers(day, state);
  if (!pool.length) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export function rarityAmmoBoost(rarity: 'common'|'rare'|'military'): number {
  if (rarity === 'military') return 1.25;
  if (rarity === 'rare') return 1.10;
  return 1.0;
}

export function openContainer(day:number, containerId:string, state:GameState): number {
  ensureContainersState(state);
  const cs = state.containersState;
  if (cs.lastOpenedWasContainer) {
    gameLog('⛔ No puedes abrir dos contenedores seguidos. Realiza otra acción y vuelve a intentar.');
    return 0;
  }
  const pool = getContainersForDay(day);
  const c = pool.find(x => x.id === containerId);
  if (!c) return 0;

  const openedSet = cs.openedIdsByDay[day] as Set<string>;
  if (openedSet.has(c.id)) {
    gameLog('⚠️ Ese contenedor ya fue abierto.');
    return 0;
  }

  const boost = rarityAmmoBoost(c.rarity);
  const min = Math.max(0, Math.floor(c.ammoMin * boost));
  const max = Math.max(min, Math.floor(c.ammoMax * boost));
  const amount = Math.floor(Math.random() * (max - min + 1)) + min;

  // Sumar a recursos
  (state as any).resources = (state as any).resources ?? { ammo: 0 };
  const prev = (state as any).resources.ammo ?? 0;
  (state as any).resources.ammo = prev + amount;

  openedSet.add(c.id);
  cs.lastOpenedWasContainer = true;

  gameLog(`🔓 Abriste ${c.name} en ${c.place}. Munición obtenida: +${amount}.`);
  return amount;
}

export function resetContainerConsecutive(state: GameState) {
  ensureContainersState(state);
  state.containersState.lastOpenedWasContainer = false;
}
