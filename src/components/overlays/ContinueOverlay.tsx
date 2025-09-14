import { useEffect } from 'react';

export default function ContinueOverlay({ open, text, onContinue }:{
  open:boolean; text?:string; onContinue:()=>void;
}){
  useEffect(()=>{
    if(!open) return;
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); onContinue(); } };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[open,onContinue]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
      <button className="px-6 py-3 rounded-xl bg-white text-black font-semibold"
              onClick={onContinue}>{text ?? 'Continuar ▸'}</button>
    </div>
  );
}
