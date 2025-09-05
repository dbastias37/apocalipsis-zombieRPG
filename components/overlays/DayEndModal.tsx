import React, { useEffect, useState } from "react";

export default function DayEndModal({
  open, lines, onNextDay
}:{
  open:boolean;
  lines:string[];
  onNextDay:()=>void;
}){
  const [idx, setIdx] = useState(0);
  const [typing, setTyping] = useState(false);
  const [shown, setShown] = useState("");

  const current = lines[idx] ?? "";

  useEffect(()=>{
    if(!open) return;
    setIdx(0); setShown(""); setTyping(true);
  },[open]);

  useEffect(()=>{
    if(!open) return;
    setShown("");
    setTyping(true);
    let i=0;
    const step=()=>{
      if(i>=current.length){ setTyping(false); return; }
      setShown(s=>s+current[i]); i++; setTimeout(step, 12);
    };
    step();
  },[current, open]);

  useEffect(()=>{
    if(!open) return;
    const onKey=(e:KeyboardEvent)=>{
      if(e.key!=="Enter") return;
      if(typing){ setTyping(false); setShown(current); }
      else if(idx<lines.length-1){ setIdx(x=>x+1); }
    };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  },[typing, idx, lines.length, current, open]);

  if(!open) return null;
  const finished = !typing && idx>=lines.length-1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative z-10 w-full max-w-xl mx-4 rounded-2xl p-6 bg-zinc-900/95 border border-white/10 shadow-xl">
        <h2 className="text-lg font-bold text-amber-300 mb-2">Día concluido</h2>
        <p className="text-sm opacity-80 mb-3">Es mejor dormir. El cansancio pesa sobre el campamento…</p>
        <div className="text-sm whitespace-pre-wrap font-mono bg-black/30 rounded-lg p-3 min-h-[120px] border border-white/5">{shown}</div>
        {!finished && <div className="mt-3 text-xs text-center opacity-80 animate-pulse">Presiona Enter para continuar</div>}
        {finished && (
          <div className="mt-4 flex justify-end">
            <button className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500" onClick={onNextDay}>
              Pasar al día siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
