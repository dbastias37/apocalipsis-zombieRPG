/**
 * Resuelve un ataque del jugador consumiendo munición si corresponde
 * y registrando el evento en el log.
 */
export function resolveAttack(state: any, weaponId: string, atk: { name: string }) {
  const next = structuredClone(state);
  if (weaponId === "pistol") {
    const ammo = Math.max(0, (next.resources?.ammo ?? 0) - 1);
    next.resources = { ...(next.resources || {}), ammo };
    const logEntry = {
      ts: Date.now(),
      text: `${atk.name} dispara Pistola (munición restante: ${ammo})`,
    };
    const logs = Array.isArray(next.ui?.logs) ? [...next.ui.logs] : [];
    logs.push(logEntry);
    next.ui = { ...(next.ui || {}), logs };
  }
  return next;
}

export default resolveAttack;
