import type { GameState } from "../types/game";

export type World = GameState;

let _worldRef: World = {} as World;
/** Vincula la referencia viva del estado del juego (la App la llama). */
export function bindWorldRef(ref: World) {
  _worldRef = ref ?? ({} as World);
}
/** Obtiene el estado actual del juego, siempre definido. */
export function getWorld(): World {
  return _worldRef ?? ({} as World);
}
/** Atajo para mutaciones localizadas (si el proyecto usa mutación interna). */
export function withWorld<T>(fn: (w: World) => T): T {
  const w = getWorld();
  return fn(w);
}
