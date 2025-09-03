import React, { useEffect, useState } from "react";

const DISMISS_KEY = "azrpg_welcome_dismissed";

export default function WelcomeOverlay() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"how" | "story">("how");

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) !== "true") {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="azrpg-welcome-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur">
      <div className="azrpg-welcome-panel relative max-w-[980px] w-full mx-4 rounded-2xl border border-neutral-700 bg-neutral-900/90 p-6 shadow-xl text-neutral-200">
        <button
          aria-label="Cerrar"
          onClick={close}
          className="azrpg-welcome-close absolute top-3 right-3 text-neutral-400 hover:text-white"
        >
          ✕
        </button>

        <div className="azrpg-welcome-tabs flex gap-6 mb-4 border-b border-neutral-700">
          <button
            className={`azrpg-welcome-tab pb-2 ${
              tab === "how" ? "border-b-2 border-red-500 text-white" : "text-neutral-400"
            }`}
            onClick={() => setTab("how")}
          >
            Cómo jugar
          </button>
          <button
            className={`azrpg-welcome-tab pb-2 ${
              tab === "story" ? "border-b-2 border-red-500 text-white" : "text-neutral-400"
            }`}
            onClick={() => setTab("story")}
          >
            Historia
          </button>
        </div>

        <div className="azrpg-welcome-content max-h-[60vh] overflow-y-auto space-y-3">
          {tab === "how" ? (
            <div className="azrpg-welcome-how space-y-3">
              <p>
                <b>Fases del día:</b> amanecer, día, atardecer y noche. Cada acción consume tiempo.
              </p>
              <p>
                <b>Recursos:</b> comida, agua, medicina, combustible, munición y materiales aseguran la supervivencia.
              </p>
              <p>
                <b>Campamento:</b> protege la defensa y comodidad para resistir.
              </p>
              <p>
                <b>Equipo:</b> administra inventario y armas de tu grupo.
              </p>
              <p>
                <b>Cartas de decisión:</b> elige con cuidado; afectan moral, amenaza y recursos.
              </p>
              <p>
                <b>Combate:</b> enfrenta a los infectados usando habilidades y estrategia.
              </p>
              <p>
                <b>Exploración:</b> arriesga para hallar recursos y pistas.
              </p>
              <p>
                <b>Victoria:</b> la comunidad sobrevive varios días. <b>Derrota:</b> la amenaza o la moral llegan a cero.
              </p>
              <p className="text-sm text-neutral-400">
                Consejo: planifica cada paso; el tiempo es tu recurso más valioso.
              </p>
            </div>
          ) : (
            <div className="azrpg-welcome-story space-y-3">
              <p>Año 2130. Neo Santiago es un laberinto de ruinas y neón.</p>
              <p>Una infección arrasó con la mayoría, dejando hordas de no muertos.</p>
              <p>Los últimos humanos resisten en enclaves fortificados, cada día más aislados.</p>
              <p>La amenaza crece con cada noche. Tu misión: mantener viva a tu comunidad.</p>
            </div>
          )}
        </div>

        <div className="azrpg-welcome-actions mt-6 flex justify-end gap-3">
          <button
            onClick={dismiss}
            className="azrpg-welcome-dismiss px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600"
          >
            No volver a mostrar
          </button>
          <button
            onClick={close}
            className="azrpg-welcome-start px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white"
          >
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}

