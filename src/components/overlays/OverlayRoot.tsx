import { useEffect } from "react";
export default function OverlayRoot({ overlayOpen, proceed }:{ overlayOpen:boolean; proceed:()=>void }) {
  useEffect(() => {
    if (!overlayOpen) return;
    // no hace nada aquí; el avance lo maneja App con typewriter
  }, [overlayOpen]);
  return null;
}
