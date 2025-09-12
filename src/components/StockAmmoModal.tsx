import React, { useEffect, useState } from "react";
import { takeAmmoFromCamp } from "../systems/ammo";
import { ensureBreathPlomoStyle } from "./util/breathPlomo";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  state: any;
  setState: (s: any) => void;
};

export default function StockAmmoModal({ isOpen, onClose, state, setState }: Props){
  ensureBreathPlomoStyle();
  const stock = Math.max(0, Number(state?.camp?.resources?.ammo ?? 0));
  const [loose, setLoose] = useState(0);
  const [boxes, setBoxes] = useState(0);

  useEffect(()=>{ if(isOpen){ setLoose(0); setBoxes(0); } }, [isOpen]);
  if(!isOpen) return null;

  const total = loose + boxes*15;
  const maxLoose = Math.max(0, stock - boxes*15);
  const maxBoxes = Math.floor((stock - loose)/15);

  const dec = (v:number,set:(n:number)=>void)=> set(Math.max(0,v-1));
  const incLoose = ()=> setLoose(l=> Math.min(maxLoose, l+1));
  const incBoxes = ()=> setBoxes(b=> Math.min(maxBoxes, b+1));

  const disabled = total<=0 || total>stock;
  const confirm = ()=>{
    const next = takeAmmoFromCamp(state, { loose, boxes });
    setState(next);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100" role="dialog" aria-modal>
        <button className="absolute top-2 right-3" onClick={onClose}>✖</button>
        <h3 className="text-lg font-bold mb-2">Cajón de Munición</h3>
        <p className="text-sm text-neutral-400 mb-4">Stock: {stock} balas</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Balas sueltas</span>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 bg-neutral-800 rounded" onClick={()=>dec(loose,setLoose)}>-</button>
              <span>{loose}</span>
              <button className="px-2 py-1 bg-neutral-800 rounded" onClick={incLoose}>+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Cajas (x15)</span>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 bg-neutral-800 rounded" onClick={()=>dec(boxes,setBoxes)}>-</button>
              <span>{boxes}</span>
              <button className="px-2 py-1 bg-neutral-800 rounded" onClick={incBoxes}>+</button>
            </div>
          </div>
          <div className="text-sm text-neutral-400">Retirarás {total} balas</div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 bg-neutral-800 rounded" onClick={onClose}>Cancelar</button>
          <button className={`px-4 py-2 rounded ${disabled? 'btn-disabled':'breath-plomo'}`} disabled={disabled} onClick={confirm}>Retirar del stock</button>
        </div>
      </div>
    </div>
  );
}
