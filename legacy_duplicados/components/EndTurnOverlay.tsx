import React from "react";

export type EndTurnData = {
  title: string;        // línea principal (ej: "Jugador1 tu turno ha terminado")
  subtitle?: string;    // línea secundaria (ej: "ahora le toca a: Jugador2")
  onContinue?: () => void; // callback al presionar Continuar
};

export default function EndTurnOverlay({ data }: { data: EndTurnData | null }) {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md flex items-center justify-center">
      <div className="w-[min(680px,92vw)] rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl p-6 text-center">
        <h3 className="text-2xl font-bold">{data.title}</h3>
        {data.subtitle ? (
          <p className="text-neutral-300 mt-2">{data.subtitle}</p>
        ) : null}
        <button
          className="mt-6 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold"
          onClick={data.onContinue}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
