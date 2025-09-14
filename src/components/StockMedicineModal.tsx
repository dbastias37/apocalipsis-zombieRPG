import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { takeMedicineFromCamp, MedkitItem } from "../systems/medicine";
import { ensureBreathPlomoStyle } from "./util/breathPlomo";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  state: any;
  setState: (s: any) => void;
};

export default function StockMedicineModal({ isOpen, onClose, state, setState }: Props){
  ensureBreathPlomoStyle();
  const stock = Math.max(0, Number(state?.camp?.resources?.medicine ?? 0));
  const [amount, setAmount] = useState(0);

  useEffect(()=>{ if(isOpen) setAmount(0); }, [isOpen]);
  useEffect(()=>{
    const fn = (e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    if(isOpen) window.addEventListener('keydown', fn);
    return ()=> window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);
  if(!isOpen) return null;

  const inc = ()=> setAmount(a=> Math.min(stock, a+1));
  const dec = ()=> setAmount(a=> Math.max(0, a-1));
  const disabled = amount<=0 || amount>stock;
  const confirm = ()=>{
    const { state: st, taken } = takeMedicineFromCamp(state, amount);
    const stash = Array.isArray(st?.camp?.stash) ? [...st.camp.stash] : [];
    if(taken>0){
      const item: MedkitItem = { type:'medkit', medicines:taken };
      stash.push(item);
    }
    const next = { ...st, camp:{ ...(st.camp ?? {}), stash } };
    setState(next);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center" style={{zIndex:9999}}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100" role="dialog" aria-modal>
        <button className="absolute top-2 right-3" onClick={onClose}>✖</button>
        <h3 className="text-lg font-bold mb-2">Stock de Medicina</h3>
        <p className="text-sm text-neutral-400 mb-4">Stock: {stock} medicinas</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Medicinas</span>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 bg-neutral-800 rounded" onClick={dec}>-</button>
              <span>{amount}</span>
              <button className="px-2 py-1 bg-neutral-800 rounded" onClick={inc}>+</button>
            </div>
          </div>
          <div className="text-sm text-neutral-400">Retirarás {amount} medicinas</div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 bg-neutral-800 rounded" onClick={onClose}>Cancelar</button>
          <button className={`px-4 py-2 rounded ${disabled? 'btn-disabled':'breath-plomo'}`} disabled={disabled} onClick={confirm}>Retirar del stock</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
