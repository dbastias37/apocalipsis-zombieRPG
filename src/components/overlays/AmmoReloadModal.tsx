import React, { useEffect, useMemo, useState } from "react";
import { WEAPON_LIST } from "../../data/weapons";
import { getLoadedAmmo, getTotalAmmoAvailable, listReloadableWeapons } from "../../systems/ammo";

type Weapon = { id:string; name:string };

type Props = {
  isOpen: boolean;
  player: any|null;
  onClose: () => void;
  onConfirm: (weaponId:string, bullets:number) => void;
};

export default function AmmoReloadModal({ isOpen, player, onClose, onConfirm }: Props){
  if(!isOpen || !player) return null;

  const available = useMemo(()=>getTotalAmmoAvailable(player), [player]);
  const weapons   = useMemo(()=>listReloadableWeapons(player), [player]);

  const [wid, setWid] = useState<string>(weapons[0]?.id ?? "");
  // calcular límite real
  const selected = useMemo(()=> WEAPON_LIST.find(w => w.id === wid), [wid]);
  const curLoaded = useMemo(()=> (player && wid ? getLoadedAmmo(player, wid) : 0), [player, wid]);
  const freeSpace = Math.max(0, Number(selected?.magSize ?? 0) - curLoaded);

  const maxBullets = Math.min(available.total, freeSpace);
  const [count, setCount] = useState<number>(Math.min(5, maxBullets));
  useEffect(() => { setCount(c => Math.min(c, maxBullets)); }, [maxBullets]);

  const disabled = maxBullets<=0 || !wid;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 max-w-lg mx-auto my-10 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
        <h3 className="text-xl font-bold">Recarga tu arma</h3>
        <p className="text-xs text-neutral-400 mt-1">Disponible: <b>{maxBullets}</b> municiones</p>

        <div className="mt-4 space-y-4">
          {weapons.length > 1 ? (
            <div>
              <div className="text-sm mb-2">Elige arma</div>
              <div className="flex flex-wrap gap-2">
                {weapons.map(w=>(
                  <button key={w.id}
                    className={`px-3 py-1 rounded-lg border ${wid===w.id ? 'border-emerald-500 bg-emerald-600/20' : 'border-neutral-700 bg-neutral-800'}`}
                    onClick={()=>setWid(w.id)}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm mb-1">Arma</div>
              <div className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 inline-block">
                {weapons[0]?.name ?? '—'}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Municiones a cargar</div>
                <div className="text-xs text-neutral-400">Selecciona cuántas transferir</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
                        onClick={()=>setCount(c=>Math.max(0, c-1))}>-</button>
                <span className="w-12 text-center font-bold">{count}</span>
                <button className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
                        onClick={()=>setCount(c=>Math.min(maxBullets, c+1))}>+</button>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-400">recuerda utilizar tu munición de forma inteligente</p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-lg px-4 py-2 bg-neutral-800 hover:bg-neutral-700" onClick={onClose}>Cancelar</button>
          <button
            className={`rounded-lg px-4 py-2 ${!disabled ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'}`}
            disabled={disabled || count<=0}
            onClick={()=>onConfirm(wid, count)}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

