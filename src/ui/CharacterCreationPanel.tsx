import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/state/gameStore";

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

export default function CharacterCreationPanel() {
  const {
    ui: { characterInitial: initial },
    createPlayer,
    setMode,
    players,
  } = useGameStore();

  const [draft, setDraft] = useState<Draft>({
    name: "",
    profession: "",
    bio: "",
  });

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
  }, [initial?.id]);

  function onChange<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function randomizeProfessionOnce() {
    if (!draft.profession) {
      const r = PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];
      setDraft((prev) => ({ ...prev, profession: r }));
    }
  }

  function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const name = draft.name.trim();
    const profession = draft.profession.trim();
    if (!name || !profession) return;

    createPlayer({
      name,
      profession,
      bio: draft.bio.trim(),
    });

    setDraft((prev) => ({ ...prev, name: "", bio: "" }));
  }

  function handleStart() {
    if (players.length > 0) setMode("running");
  }

  return (
    <form onSubmit={handleCreate} className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Crear Personaje</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Nombre</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Ingresa nombre…"
          value={draft.name}
          onChange={(e) => onChange("name", e.target.value)}
          onFocus={randomizeProfessionOnce}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Profesión</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={draft.profession}
          onChange={(e) => onChange("profession", e.target.value)}
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
        />
      </div>

      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-blue-600 text-white" type="submit">
          Crear personaje
        </button>

        <button
          type="button"
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          onClick={handleStart}
          disabled={players.length === 0}
        >
          Iniciar
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Sugerencia: crea varios personajes y luego pulsa “Iniciar”. El juego permanece en pausa durante la creación.
      </p>
    </form>
  );
}
