import React, { useEffect, useRef } from "react";
import { WeaponOpt } from "../../systems/combat/getAvailableWeapons";

interface Props {
  weapons: WeaponOpt[];
  onClose: () => void;
  doAttack: (weaponId: string) => void;
}

export default function ChooseWeaponModal({ weapons, onClose, doAttack }: Props) {
  const firstBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const choose = (id: string, usable: boolean) => {
    if (!usable) return;
    doAttack(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-neutral-900 border border-neutral-700 rounded p-4 w-80 max-w-full">
        <h2 className="text-lg mb-3">Elige arma</h2>
        <div className="space-y-2">
          {weapons.map((w, idx) => (
            <button
              key={w.id}
              ref={idx === 0 ? firstBtnRef : undefined}
              disabled={!w.usable}
              title={!w.usable && w.reason ? w.reason : undefined}
              onClick={() => choose(w.id, w.usable)}
              className={`block w-full text-left px-3 py-1 rounded border ${
                w.usable ? "border-slate-500" : "border-slate-700 opacity-50"
              }`}
            >
              {w.label}
              {!w.usable && w.reason && (
                <span className="ml-2 text-xs text-red-400">{w.reason}</span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-700 text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
