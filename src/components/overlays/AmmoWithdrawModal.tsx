import React, { useMemo, useState } from "react";

type Props = {
  isOpen: boolean;
  ammo: number;
  onClose: () => void;
  onWithdrawBoxes: (boxes: number) => void;    // boxes * 15 se restan de depósito
  onWithdrawBullets: (bullets: number) => void;// balas sueltas a restar
};

export default function AmmoWithdrawModal({ isOpen, ammo, onClose, onWithdrawBoxes, onWithdrawBullets }: Props) {
  if (!isOpen) return null;

  const maxBoxes = useMemo(() => Math.floor((ammo || 0) / 15), [ammo]);
  const [boxes, setBoxes] = useState<number>(maxBoxes > 0 ? 1 : 0);
  const [bullets, setBullets] = useState<number>(ammo > 0 ? 1 : 0);

  const dec = (v:number, set:(n:number)=>void, min=0) => set(Math.max(min, v-1));
  const inc = (v:number, set:(n:number)=>void, max:number) => set(Math.min(max, v+1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 text-neutral-100 shadow-2xl border border-neutral-800">
        <div className="p-5 border-b border-neutral-800">
          <h3 className="text-xl font-bold">Depósito de munición</h3>
          <p className="text-sm text-neutral-400 mt-1">Disponible: <b>{ammo}</b> municiones</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Acción rápida */}
          <button
            className={`w-full rounded-lg py-2 font-semibold ${ammo >= 15 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'}`}
            disabled={ammo < 15}
            onClick={() => onWithdrawBoxes(1)}
          >
            Sacar caja de munición (15 municiones)
          </button>

          {/* Por cajas */}
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Sacar por Cajas</div>
                <div className="text-xs text-neutral-400">1 caja = 15 municiones • Máx: {maxBoxes}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
                        onClick={()=>dec(boxes,setBoxes,0)}>-</button>
                <span className="w-10 text-center font-bold">{boxes}</span>
                <button className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
                        onClick={()=>inc(boxes,setBoxes,maxBoxes)}>+</button>
              </div>
            </div>
            <button
              className={`mt-3 w-full rounded-lg py-2 ${boxes>0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'}`}
              disabled={boxes<=0}
              onClick={()=>onWithdrawBoxes(boxes)}
            >
              Confirmar ({boxes} {boxes===1?'caja':'cajas'}) • {boxes*15} municiones
            </button>
          </div>

          {/* Por balas sueltas */}
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Sacar munición unitaria</div>
                <div className="text-xs text-neutral-400">Máx: {ammo}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
                        onClick={()=>dec(bullets,setBullets,0)}>-</button>
                <span className="w-10 text-center font-bold">{bullets}</span>
                <button className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
                        onClick={()=>inc(bullets,setBullets,ammo)}>+</button>
              </div>
            </div>
            <button
              className={`mt-3 w-full rounded-lg py-2 ${bullets>0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'}`}
              disabled={bullets<=0}
              onClick={()=>onWithdrawBullets(bullets)}
            >
              Confirmar ({bullets} {bullets===1?'munición':'municiones'})
            </button>
          </div>
        </div>

        <div className="p-5 border-t border-neutral-800 flex justify-end">
          <button className="rounded-lg px-4 py-2 bg-neutral-800 hover:bg-neutral-700" onClick={onClose}>
            Volver al juego
          </button>
        </div>
      </div>
    </div>
  );
}

