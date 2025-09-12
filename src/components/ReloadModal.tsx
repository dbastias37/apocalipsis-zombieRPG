import React, { useEffect, useState } from "react";
import { getSelectedWeapon, isRangedWeapon } from "../systems/weapons";
import { getLoadedAmmo, listAmmoBoxes, listLoose, loadFromBackpackExact } from "../systems/ammo";
import { ensureBreathPlomoStyle } from "./util/breathPlomo";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  state: any;
  setState: (s:any)=>void;
};

export default function ReloadModal({isOpen,onClose,state,setState}:Props){
  ensureBreathPlomoStyle();
  const pIdx = state?.turn?.activeIndex ?? 0;
  const player = state?.players?.[pIdx];
  if(!isOpen || !player) return null;
  const weapon = getSelectedWeapon(player);
  if(!isRangedWeapon(weapon)) return null;
  const loaded = getLoadedAmmo(player, weapon.id);
  const magSize = Number(weapon?.magSize ?? 0);
  const free = Math.max(0, magSize - loaded);
  const loose = listLoose(player.inventory).reduce((a,r)=>a+r.bullets,0);
  const boxes = listAmmoBoxes(player.inventory).reduce((a,r)=>a+r.bullets,0);
  const available = loose + boxes;
  const maxLoad = Math.min(free, available);
  const [count,setCount] = useState(maxLoad);
  useEffect(()=>{ setCount(maxLoad); }, [maxLoad, isOpen]);
  const confirm = ()=>{
    const next = loadFromBackpackExact(state, count);
    setState(next);
    onClose();
  };
  const disabled = count<=0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100" role="dialog" aria-modal>
        <button className="absolute top-2 right-3" onClick={onClose}>✖</button>
        <h3 className="text-lg font-bold mb-2">Recargar arma</h3>
        <p className="text-sm text-neutral-400 mb-4">Disponible en mochila: {available} • Espacio libre: {free}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm">Balas a cargar</span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 bg-neutral-800 rounded" onClick={()=>setCount(c=>Math.max(0,c-1))}>-</button>
            <span>{count}</span>
            <button className="px-2 py-1 bg-neutral-800 rounded" onClick={()=>setCount(c=>Math.min(maxLoad,c+1))}>+</button>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 bg-neutral-800 rounded" onClick={onClose}>Cancelar</button>
          <button className={`px-4 py-2 rounded ${disabled? 'btn-disabled':'breath-plomo'}`} disabled={disabled} onClick={confirm}>Cargar</button>
        </div>
      </div>
    </div>
  );
}
