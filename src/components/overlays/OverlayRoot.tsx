import { useEffect } from "react";

export default function OverlayRoot({ overlayOpen, proceed }: { overlayOpen: boolean; proceed: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && overlayOpen) {
        e.preventDefault();
        proceed();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, proceed]);
  return null;
}
