import React, { useMemo, useState } from "react";
import { findAmmoBoxInBackpack, getReloadableWeapons } from "../../helpers";

type Weapon = { id:string; name:string };
type Props = {
  isOpen: boolean;
  player: any|null;
  onClose: () => void;
  onConfirm: (weaponId:string, bullets:number) => void;
};

export default function AmmoReloadModal({ isOpen, player, onClose, onConfirm }: Props){
  if(!isOpen || !player) return null;

  const boxInfo = useMemo(()=>findAmmoBoxInBackpack(player), [player]);
  const weapons = useMemo(()=>getReloadableWeapons(player), [player]);
  const [wid, setWid] = useState<string>(weapons[0]?.id ?? "");
  const maxBullets = Math.max(0, boxInfo?.box?.bullets ?? 0);
  const [count, setCount] = useState<number>(Math.min(5, maxBullets)); // default 5 para UX

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 text-neutral-100 shadow-2xl border border-neutral-800">
        <div className="p-5 border-b border-neutral-800">
          <h3 className="text-xl font-bold">Recarga tu arma</h3>
          <p className="text-xs text-neutral-400 mt-1">Disponible en la caja: <b>{maxBullets}</b> municiones</p>
        </div>

        <div className="p-5 space-y-5">
          {weapons.length > 1 ? (
            <div>
              <div className="text-sm mb-2">Elige arma a recargar</div>
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
              <div className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 inline-block">{weapons[0]?.name ?? '—'}</div>
            </div>
          )}

          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Municiones a cargar</div>
                <div className="text-xs text-neutral-400">Selecciona cuántas transferir desde la caja</div>
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

        <div className="p-5 border-t border-neutral-800 flex justify-end gap-2">
          <button className="rounded-lg px-4 py-2 bg-neutral-800 hover:bg-neutral-700" onClick={onClose}>Cancelar</button>
          <button
            className={`rounded-lg px-4 py-2 ${count>0 && wid ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'}`}
            disabled={!wid || count<=0}
            onClick={()=>onConfirm(wid, count)}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

