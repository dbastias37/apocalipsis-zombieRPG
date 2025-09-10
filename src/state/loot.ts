import { InventoryItem, addAmmo, normalizeAmmo } from "../systems/ammo";
import { gameLog } from "../utils/logger";

/**
 * Añade botín de munición al inventario del jugador.
 * - ammo: balas sueltas
 * - box: si es true, agrega una caja de 15 balas
 */
export function applyAmmoLoot(
  inventory: InventoryItem[],
  loot: { ammo?: number; box?: boolean }
): InventoryItem[] {
  let inv = [...(inventory ?? [])];
  if (loot.box) {
    inv.push({ name: "Caja de munición", ammo: { type: "box", count: 15 } });
    gameLog("Consigues caja de 15 balas.");
  }
  if (loot.ammo && loot.ammo > 0) {
    inv = addAmmo(inv, loot.ammo);
    gameLog(`Consigues munición: +${loot.ammo}`);
  }
  return normalizeAmmo(inv);
}

export default applyAmmoLoot;
