// src/compat/legacy-globals.ts
// Define funciones globales antiguas si no existen, para evitar crashes.
import { consumeFoodFromPlayer } from "../systems/food";
import { consumeMedicineFromPlayer } from "../systems/medicine";

declare global {
  interface Window {
    consumeFoodInventoryItem?: (player?: any, amount?: number) => any;
    consumeFoodForPlayer?: (player?: any, amount?: number) => any;
    consumeMedItem?: (player?: any, amount?: number) => any;
    consumeMedForPlayer?: (player?: any, amount?: number) => any;
    activePlayer?: any;
    getActivePlayer?: () => any;
  }
}

(function installLegacyGlobals() {
  const g = window as any;
  const withFallback = (fn: (p: any, n: number) => any, tag: string) =>
    (p?: any, n?: number) => {
      const player = p ?? g.activePlayer ?? (g.getActivePlayer?.() ?? null);
      const amount = Number.isFinite(n) ? (n as number) : 1;
      if (!player) {
        console.warn(`[compat] ${tag}: no hay activePlayer disponible; operación ignorada.`);
        return { player: null, taken: 0 };
      }
      try {
        return fn(player, amount);
      } catch (e) {
        console.error(`[compat] fallo ${tag}`, e);
        return { player, taken: 0 };
      }
    };

  if (typeof g.consumeFoodInventoryItem !== "function")
    g.consumeFoodInventoryItem = withFallback(consumeFoodFromPlayer, "consumeFoodInventoryItem");
  if (typeof g.consumeFoodForPlayer !== "function")
    g.consumeFoodForPlayer = withFallback(consumeFoodFromPlayer, "consumeFoodForPlayer");
  if (typeof g.consumeMedItem !== "function")
    g.consumeMedItem = withFallback(consumeMedicineFromPlayer, "consumeMedItem");
  if (typeof g.consumeMedForPlayer !== "function")
    g.consumeMedForPlayer = withFallback(consumeMedicineFromPlayer, "consumeMedForPlayer");
})();

export {};
