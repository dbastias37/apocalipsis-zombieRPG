import { useCallback } from "react";
import { getAvailableWeapons, WeaponOpt } from "../../systems/combat/getAvailableWeapons";

export interface AttackFlowResultChoose {
  needChooser: true;
  weapons: WeaponOpt[];
}

export interface AttackFlowResultDirect {
  needChooser: false;
  chosen: string | null;
  weapons: WeaponOpt[];
}

export type AttackFlowResult = AttackFlowResultChoose | AttackFlowResultDirect;

/**
 * Hook que gestiona la lógica de selección de arma antes de atacar.
 *
 * No ejecuta el ataque directamente. En su lugar, devuelve información
 * para que el componente decida si mostrar un selector o atacar de inmediato.
 */
export function useAttackFlow(
  player: any,
  resources: { ammo?: number },
  _doAttack: (weaponId: string) => void
) {
  // _doAttack no se usa aquí directamente pero se admite por diseño
  void _doAttack;

  const startAttack = useCallback((): AttackFlowResult => {
    const weapons = getAvailableWeapons(player, resources);
    const usable = weapons.filter((w) => w.usable);

    if (usable.length === 0) {
      if (typeof window !== "undefined") {
        window.alert("No tienes armas utilizables");
      }
      return { needChooser: false, chosen: null, weapons };
    }

    if (usable.length === 1) {
      return { needChooser: false, chosen: usable[0].id, weapons };
    }

    return { needChooser: true, weapons };
  }, [player, resources]);

  return { startAttack };
}

export default useAttackFlow;
