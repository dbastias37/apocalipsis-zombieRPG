export type World = any;

let WORLD_REF: World = {} as World;

/** Vincula la referencia viva del estado del juego (la App la llama). */
export function setWorldRef(ref: World) {
  WORLD_REF = ref ?? ({} as World);
}

/** Obtiene el estado actual del juego, siempre definido. */
export function getWorld(): World {
  return WORLD_REF ?? ({} as World);
}

/** Atajo para mutaciones localizadas (si el proyecto usa mutación interna). */
export function withWorld<T>(fn: (w: World) => T): T {
  return fn(getWorld());
}
