import React from "react";

export default function InfectionFatalModal({ open, playerName, onClose }:{
  open:boolean; playerName:string; onClose:()=>void;
}){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 max-w-lg w-full mx-4 rounded-2xl p-6 bg-zinc-900/95 border border-white/10 shadow-xl">
        <p className="text-sm mb-4">
          <b>{playerName}</b> no aguantó la infección y tuvimos que sacrificarlo al ver que ya era parte de ellos...
        </p>
        <div className="flex justify-end">
          <button className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500" onClick={onClose}>
            Seguir adelante
          </button>
        </div>
      </div>
    </div>
  );
}
