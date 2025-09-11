import React from "react";
import { hasCondition } from "../../systems/status";

export default function HealAllyModal({
  open, players, onPick, onClose
}:{
  open:boolean;
  players: any[]; // {id,name,hp,conditions,backpack?}
  onPick: (playerId:string)=>void;
  onClose: ()=>void;
}){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 max-w-lg w-full mx-4 rounded-2xl p-6 bg-zinc-900/95 border border-white/10 shadow-xl">
        <h3 className="text-lg font-bold mb-2">Curar aliado</h3>
        <p className="text-xs opacity-80 mb-3">Elige a quién asistir. La infección requiere <b>1 medicina</b>. El sangrado se detiene sin medicina.</p>
        <div className="grid gap-2">
          {players.filter(p=>p.hp>0).map(p=>{
            const inf = hasCondition(p.conditions,'infected');
            const ble = hasCondition(p.conditions,'bleeding');
            const stn = hasCondition(p.conditions,'stunned');
            return (
              <button
                key={p.id}
                onClick={()=>onPick(p.id)}
                className="w-full text-left p-3 rounded-xl border border-white/10 hover:bg-white/5"
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-xs opacity-80">
                  PV: {p.hp}
                  {" · "}
                  {inf && <span className="text-emerald-300">infectado</span>}
                  {ble && <span className="text-red-300">{inf?" · ":""}sangrando</span>}
                  {stn && <span className="text-zinc-300">{(inf||ble)?" · ":""}aturdido</span>}
                  {(!inf && !ble && !stn) && <span>sin estados</span>}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex justify-end mt-3">
          <button className="px-3 py-2 rounded-xl border border-white/15 hover:bg-white/5" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
