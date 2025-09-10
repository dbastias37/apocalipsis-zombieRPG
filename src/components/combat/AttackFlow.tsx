import { getSelectedWeapon, getAmmoFor, isRangedWeapon } from "../../systems/weapons";
import resolveAttack from "../../systems/combat/resolveAttack";
import { nextTurn, TurnState } from "../../systems/turns";

/**
 * Ejecuta el ataque del jugador activo y avanza el turno.
 *
 * - Si el arma seleccionada es de fuego y no hay munición, el ataque falla
 *   automáticamente pero consume el turno y la energía.
 * - En caso contrario, delega el cálculo al resolver del sistema de combate.
 */
export function performAttack(
  state: any,
  turn: TurnState,
  playersLen: number,
  enemiesLen: number,
  log: (msg: string) => void
) {
  const player = state?.players?.[turn.activeIndex];
  if (!player) return state;

  const weapon = getSelectedWeapon(player);
  const ammo = getAmmoFor(player, weapon.id);

  if (isRangedWeapon(weapon) && ammo === 0) {
    const name = player.name || "Alguien";
    log(`[${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}] ${name} intenta disparar la ${weapon.name}, pero no revisó la recámara. No había balas. Turno perdido.`);
    if (typeof player.energy === "number") {
      player.energy = Math.max(0, player.energy - (weapon.energyCost ?? 1));
    }
    nextTurn(turn, playersLen, enemiesLen);
    return state;
  }

  const next = resolveAttack(state, weapon.id, { name: player.name || "Alguien" });
  nextTurn(turn, playersLen, enemiesLen);
  return next;
}

export default performAttack;
