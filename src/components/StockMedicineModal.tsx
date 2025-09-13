import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MED_CATALOG } from "../data/consumables";
import { materializeMedFromStock } from "../systems/inventory";
import { ensureBreathPlomoStyle } from "./util/breathPlomo";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  state: any;
  setState: (s:any)=>void;
};

export default function StockMedicineModal({isOpen,onClose,state,setState}:Props){
  ensureBreathPlomoStyle();
  const stock = Math.max(0, Number(state?.camp?.resources?.medicine ?? 0));
  const [count,setCount] = useState(0);
  const [medId,setMedId] = useState<string>(MED_CATALOG[0]?.id ?? "");
  useEffect(()=>{ if(isOpen){ setCount(0); } }, [isOpen]);
  useEffect(()=>{
    const fn = (e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    if(isOpen) window.addEventListener('keydown', fn);
    return ()=> window.removeEventListener('keydown', fn);
  }, [isOpen,onClose]);
  if(!isOpen) return null;
  const max = stock;
  const toggle = ()=> setMedId(id=> id===MED_CATALOG[0].id ? MED_CATALOG[1].id : MED_CATALOG[0].id);
  const confirm = ()=>{
    const next = materializeMedFromStock(state, count, medId);
    setState(next);
    onClose();
  };
  const disabled = count<=0 || count>max;
  const currentName = MED_CATALOG.find(m=>m.id===medId)?.name ?? "";
  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center" style={{zIndex:9999}}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100" role="dialog" aria-modal>
        <button className="absolute top-2 right-3" onClick={onClose}>✖</button>
        <h3 className="text-lg font-bold mb-2">Cajón Médico</h3>
        <p className="text-sm text-neutral-400 mb-4">Unidades en stock: {stock}</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Tipo</span>
            <button className="px-2 py-1 bg-neutral-800 rounded" onClick={toggle}>{currentName}</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Unidades</span>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 bg-neutral-800 rounded" onClick={()=>setCount(c=>Math.max(0,c-1))}>-</button>
              <span>{count}</span>
              <button className="px-2 py-1 bg-neutral-800 rounded" onClick={()=>setCount(c=>Math.min(max,c+1))}>+</button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 bg-neutral-800 rounded" onClick={onClose}>Cancelar</button>
          <button className={`px-4 py-2 rounded ${disabled? 'btn-disabled':'breath-plomo'}`} disabled={disabled} onClick={confirm}>Retirar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
