import { useEffect } from "react";

export default function ContinueOverlay({
  open,
  text,
  onContinue,
}: {
  open: boolean;
  text?: string;
  onContinue: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onContinue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {text ? (
          <div className="text-white/80 text-sm max-w-[80vw] text-center">{text}</div>
        ) : null}
        <button
          className="px-6 py-3 rounded-xl bg-white text-black font-semibold shadow"
          onClick={onContinue}
          aria-label="Continuar"
        >
          Continuar ▸
        </button>
        <div className="text-white/60 text-xs">Enter o Espacio para continuar</div>
      </div>
    </div>
  );
}

