import { appendLog } from "../systems/logger";

export type LogFn = (msg: string) => void;
export type TimeFn = () => string;

let currentLogger: LogFn = () => {};
let timeProvider: TimeFn = () => "??:??";
/**
 * Registra la función que empuja logs al estado de la app.
 * Se puede llamar múltiples veces; siempre usaremos la última.
 */
export function registerLogger(fn: LogFn) {
  currentLogger = fn;
}

/**
 * Registra una función que devuelve la hora actual en formato HH:MM.
 */
export function registerTimeProvider(fn: TimeFn) {
  timeProvider = fn;
}

/**
 * Publica un log de juego de forma segura.
 * Nunca lanza, aunque no haya logger registrado aún.
 */
export function gameLog(message: string) {
  try {
    const stamp = timeProvider();
    const line = `[${stamp}] ${message}`;
    appendLog(line);
    currentLogger(line);
  } catch {
    // no-op para no romper el runtime
  }
}
