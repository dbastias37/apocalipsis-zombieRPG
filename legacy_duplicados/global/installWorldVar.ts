// src/global/installWorldVar.ts
// 1) Tipado para TS (no afecta runtime)
declare global {
  // eslint-disable-next-line no-var
  var worldState: any;
}
export {};

// 2) Enlazar propiedad en globalThis
const g: any = globalThis as any;
g.worldState = g.worldState ?? {};

// 3) Definir la variable global real `worldState` (NO solo propiedad)
//    Usamos Function para ejecutar en el ámbito global (no de módulo).
try {
  // Crea/reescribe la variable global 'worldState' y la vincula a globalThis.worldState
  // eslint-disable-next-line no-new-func
  new Function("g", "var worldState = g.worldState; g.worldState = worldState;")(g);
} catch {
  // Si el entorno bloquea, al menos queda globalThis.worldState
}
