import React, { useState } from "react";

type MedicalKit = { id: string; medCount: number };

interface Props {
  open: boolean;
  kit: MedicalKit | null;
  setGameState: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
}

export default function MedicalKitModal({ open, kit, setGameState, onClose }: Props) {
  const [isBusy, setIsBusy] = useState(false);
  const canExtract = !!kit && kit.medCount > 0 && !isBusy;

  if (!open) return null;

  const handleExtract = async () => {
    if (!kit || kit.medCount <= 0) return;
    setIsBusy(true);
    try {
      setGameState(prev => {
        const next = structuredClone(prev);
        const k: MedicalKit | undefined = next.items.find((i: any) => i.id === kit.id);
        if (!k || k.medCount <= 0) return prev;
        k.medCount -= 1;
        next.resources.medicine = (next.resources.medicine ?? 0) + 1;
        return next;
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 max-w-md w-full mx-4 rounded-2xl p-6 bg-zinc-900/95 border border-white/10 text-white">
        <h3 className="text-lg font-bold mb-3">Botiquín</h3>
        <button
          onClick={handleExtract}
          disabled={!canExtract}
          className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50"
        >
          Sacar medicina
        </button>
        <div className="text-xs opacity-70 mt-1">En botiquín: {kit?.medCount ?? 0}</div>
        <div className="flex justify-end mt-4">
          <button
            className="px-3 py-1 rounded border border-white/15 hover:bg-white/5"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

