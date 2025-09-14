// src/compat/active-player-compat.ts
// Mantiene una referencia global al jugador activo para código legacy.
declare global {
  interface Window {
    activePlayer?: any;
    getActivePlayer?: () => any;
  }
}

export function setActivePlayerCompat(player: any) {
  (window as any).activePlayer = player ?? null;
  (window as any).getActivePlayer = () => (window as any).activePlayer ?? null;
}
