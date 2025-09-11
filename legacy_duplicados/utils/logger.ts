export type LogFn = (msg: string) => void;

let currentLogger: LogFn = () => {};
/**
 * Registra la función que empuja logs al estado de la app.
 * Se puede llamar múltiples veces; siempre usaremos la última.
 */
export function registerLogger(fn: LogFn) {
  currentLogger = fn;
}

/**
 * Publica un log de juego de forma segura.
 * Nunca lanza, aunque no haya logger registrado aún.
 */
export function gameLog(message: string) {
  try {
    currentLogger(message);
  } catch {
    // no-op para no romper el runtime
  }
}
