import React from "react";
import { useUIStore } from "@/state/ui";

// Start screen simply moves UI mode to character creation
export default function StartScreen() {
  const setMode = useUIStore((s) => s.setMode);
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card card-red max-w-2xl w-full p-6 space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
          Apocalipsis Zombie RPG
        </h1>

        <div className="space-y-3 text-sm text-neutral-300">
          <p className="text-neutral-200">Reglas rápidas:</p>
          <ul className="list-disc ml-5 space-y-2">
            <li>Crea uno o más personajes con nombre, profesión y bio.</li>
            <li>Gestiona recursos y toma decisiones; cada acción consume tiempo.</li>
            <li>El riesgo aumenta con el ruido y la amenaza del entorno.</li>
            <li>Game Over si moral o recursos críticos llegan a 0.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            className="btn btn-red px-5 py-2 rounded-2xl border border-red-800"
            onClick={() => setMode("character-creation")}
          >
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}
