import React from "react";

type Props = {
  open: boolean;
  enemyName?: string;
  onClose: () => void;
};

export default function NoAmmoModal({ open, enemyName, onClose }: Props){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 max-w-md mx-auto my-12 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
        <h3 className="text-xl font-bold">El arma no tiene munición</h3>
        <p className="text-sm text-neutral-300 mt-2">
          Recarga tu arma para disparar a <b>{enemyName ?? "el enemigo"}</b>.
        </p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
