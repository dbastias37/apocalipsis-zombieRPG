import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/state/gameStore";
import { toast } from "@/components/Toast";

type Draft = {
  name: string;
  profession: string;
  bio: string;
};

const PROFESSIONS = [
  "Médico/a",
  "Mecánico/a",
  "Docente",
  "Scout",
  "Carpintero/a",
  "Enfermero/a",
  "Ingeniero/a",
  "Agricultor/a",
];

// evita toasts duplicados en la sesión
let toastShown = false;

export default function CharacterCreationPanel() {
  const ui = useGameStore((s) => s.ui);
  const createPlayer = useGameStore((s) => s.createPlayer);
  const setMode = useGameStore((s) => s.setMode);
  const hasPlayers = useGameStore((s) => s.players.length > 0);

  const [draft, setDraft] = useState<Draft>({
    name: "Sara", // borrador inicial
    profession: "", // valor por defecto del select
    bio: "",
  });

  const initial = useGameStore((s) => s.ui.characterInitial || null);
  const prevInitialId = useRef<string | null>(null);

  useEffect(() => {
    if (initial && initial.id !== prevInitialId.current) {
      setDraft({
        name: initial.name ?? "",
        profession: initial.profession ?? "",
        bio: initial.bio ?? "",
      });
      prevInitialId.current = initial.id;
    }
  }, [initial]);

  // disparar toast una sola vez al montar
  useEffect(() => {
    if (!toastShown) {
      toast(
        "¡Personaje inicial creado! Puedes cambiar el nombre, elegir una profesión y escribir la bio cuando quieras."
      );
      toastShown = true;
    }
  }, []);

  function onChange<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function randomizeProfessionOnce() {
    if (!draft.profession) {
      const r = PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];
      setDraft((prev) => ({ ...prev, profession: r }));
    }
  }

  function handleCreate() {
    const name = draft.name.trim();
    const profession = draft.profession.trim();
    if (!name || !profession) return;

    createPlayer({
      name,
      profession,
      bio: draft.bio.trim(),
    });

    setDraft({ name: "", profession: "", bio: "" });
  }

  function handleStart() {
    if (!hasPlayers) return;
    setMode("running");
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Crear Personaje</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Nombre</label>
        <input
          className="w-full border rounded px-3 py-2"
          type="text"
          placeholder="Ingresa nombre…"
          value={draft.name}
          onChange={(e) => onChange("name", e.target.value)}
          onFocus={randomizeProfessionOnce}
          onKeyDown={(e) => e.stopPropagation()} // evita que los atajos globales intercepten la escritura
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Profesión</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={draft.profession}
          onChange={(e) => onChange("profession", e.target.value)}
          onKeyDown={(e) => e.stopPropagation()} // evita que los atajos globales intercepten la escritura
        >
          <option value="">Selecciona…</option>
          {PROFESSIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Bio</label>
        <textarea
          className="w-full border rounded px-3 py-2 h-28"
          placeholder="Breve historia / rasgos…"
          value={draft.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          onKeyDown={(e) => e.stopPropagation()} // evita que los atajos globales intercepten la escritura
        />
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={handleCreate}
        >
          Crear personaje
        </button>

        <button
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          onClick={handleStart}
          disabled={!hasPlayers}
        >
          Iniciar
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Sugerencia: crea varios personajes y luego pulsa “Iniciar”. El juego permanece en pausa durante la creación.
      </p>
    </div>
  );
}

/*
Manual test:
1. Abrir "Crear personaje" → Nombre = "Sara", profesión por defecto, bio vacía.
2. Aparece un toast con el mensaje indicado y desaparece solo.
3. Se pueden editar Nombre/Profesión/Bio normalmente.
4. Al volver a la pantalla en la misma sesión, no se repite el toast.
*/
