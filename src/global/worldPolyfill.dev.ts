import { getWorld, bindWorldRef } from "../state/world";
// Exponer accesores sobre window/globalThis para depurar en consola:
Object.defineProperty(globalThis as any, "worldState", {
  get() { return getWorld(); },
  set(v) { bindWorldRef(v); },
  configurable: true
});
export {};
