import React, { useEffect } from "react";

export type EndTurnData = {
  title: string;        // línea principal (ej: "Jugador1 tu turno ha terminado")
  subtitle?: string;    // línea secundaria (ej: "ahora le toca a: Jugador2")
  onContinue?: () => void; // callback cuando el overlay se disipa
};

export default function EndTurnOverlay({ data }: { data: EndTurnData | null }) {
  useEffect(() => {
    if (data?.onContinue) {
      const t = setTimeout(() => data.onContinue?.(), 200);
      return () => clearTimeout(t);
    }
  }, [data]);

  if (!data) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md flex items-center justify-center">
      <div className="w-[min(680px,92vw)] rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl p-6 text-center">
        <h3 className="text-2xl font-bold">{data.title}</h3>
        {data.subtitle ? (
          <p className="text-neutral-300 mt-2">{data.subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
