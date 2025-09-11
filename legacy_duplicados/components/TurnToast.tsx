import React, { useEffect, useState } from "react";

export type TurnToastData = { title: string; subtitle?: string };

export default function TurnToast({ data, onClose, autoMs=2200 }:{
  data: TurnToastData | null; onClose: ()=>void; autoMs?: number;
}){
  const [show, setShow] = useState(false);
  useEffect(()=>{
    if(!data) return;
    setShow(true);
    const t = setTimeout(()=> setShow(false), autoMs);
    const t2 = setTimeout(()=> onClose(), autoMs+200);
    return ()=>{ clearTimeout(t); clearTimeout(t2); };
  }, [data]);
  if(!data) return null;
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none transition-opacity duration-200 ${show?"opacity-100":"opacity-0"}`}>
      <div className="pointer-events-auto px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-950/95 shadow-lg text-center">
        <div className="font-semibold">{data.title}</div>
        {data.subtitle && <div className="text-sm text-neutral-400">{data.subtitle}</div>}
        <button className="mt-2 text-xs underline text-neutral-300 hover:text-white" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
