import { getWorld, setWorldRef } from "../state/world";
// Exponer accesores sobre window/globalThis para depurar en consola:
Object.defineProperty(globalThis as any, "worldState", {
  get() { return getWorld(); },
  set(v) { setWorldRef(v); },
  configurable: true
});
export {};
