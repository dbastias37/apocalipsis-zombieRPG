/**
 * Resuelve un ataque del jugador registrando el evento en el log.
 */
export function resolveAttack(state: any, weaponId: string, atk: { name: string }) {
  const next = structuredClone(state);
  const logEntry = {
    ts: Date.now(),
    text: `${atk.name} dispara ${weaponId}`,
  };
  const logs = Array.isArray(next.ui?.logs) ? [...next.ui.logs] : [];
  logs.push(logEntry);
  next.ui = { ...(next.ui || {}), logs };
  return next;
}

export default resolveAttack;
