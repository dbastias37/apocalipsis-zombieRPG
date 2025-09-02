import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/state/gameStore";

type Draft = { name: string; profession: string; bio: string };

const PROFESSIONS = [
  "Médico/a","Mecánico/a","Docente","Scout","Carpintero/a","Enfermero/a",
  "Bombero/a","Cocinero/a","Agricultor/a","Electricista","Policía","Militar"
];

export default function CharacterCreationPanel() {
  const { ui, players, createPlayer, setMode } = useGameStore();
  const [draft, setDraft] = useState<Draft>({ name: "", profession: PROFESSIONS[0], bio: "" });
  const seededOnce = useRef(false);

  // Prefill SOLO si el usuario aún no escribió nada
  useEffect(() => {
    if (seededOnce.current) return;
    if (!draft.name.trim() && !draft.bio.trim()) {
      if (ui?.characterInitial) {
        setDraft({
          name: ui.characterInitial.name ?? "Sara",
          profession: ui.characterInitial.profession ?? PROFESSIONS[0],
          bio: ui.characterInitial.bio ?? "",
        });
      } else {
        setDraft((prev) => ({ ...prev, name: "Sara" }));
      }
      seededOnce.current = true;
    }
  }, [ui?.characterInitial, draft.name, draft.bio]);

  const onChange = (k: keyof Draft, v: string) => setDraft(prev => ({ ...prev, [k]: v }));

  const handleAdd = () => {
    const nm = draft.name.trim();
    if (!nm) return;
    createPlayer({ name: nm, profession: draft.profession, bio: draft.bio });
    setDraft({ name: "", profession: PROFESSIONS[0], bio: "" });
    seededOnce.current = false; // permite prefill de nuevo si vuelves a entrar
  };

  const handleStart = () => {
    if (players.length > 0) setMode("running");
  };

  // Bloquea atajos globales mientras estás en esta pantalla
  const stopAllKeysCapture: React.KeyboardEventHandler = (e) => {
    // Evita submits fantasmas
    if (e.key === "Enter") e.preventDefault();
    e.stopPropagation();
  };

  const hasPlayers = players.length > 0;

  return (
    <div
      className="max-w-2xl mx-auto card card-red p-6 space-y-6 animate-fade-in"
      // Captura antes que burbujee a listeners globales
      onKeyDownCapture={stopAllKeysCapture}
      onKeyUpCapture={(e) => e.stopPropagation()}
      onKeyPressCapture={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-bold">Crear personaje</h2>

      <div className="grid gap-4">
        {/* Nombre */}
        <div>
          <label htmlFor="player-name" className="block text-sm font-medium">Nombre</label>
          <input
            id="player-name"
            name="playerName"
            type="text"
            autoComplete="off"
            className="w-full border rounded px-3 py-2"
            placeholder="Ingresa nombre…"
            value={draft.name}
            onChange={(e) => onChange("name", e.target.value)}
            onKeyDown={stopAllKeysCapture}
          />
        </div>

        {/* Profesión */}
        <div>
          <label htmlFor="player-profession" className="block text-sm font-medium">Profesión</label>
          <select
            id="player-profession"
            name="playerProfession"
            className="w-full border rounded px-3 py-2"
            value={draft.profession}
            onChange={(e) => onChange("profession", e.target.value)}
            onKeyDown={stopAllKeysCapture}
          >
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="player-bio" className="block text-sm font-medium">Bio</label>
          <textarea
            id="player-bio"
            name="playerBio"
            className="w-full border rounded px-3 py-2 h-28"
            placeholder="Breve historia / rasgos…"
            value={draft.bio}
            onChange={(e) => onChange("bio", e.target.value)}
            onKeyDown={stopAllKeysCapture}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
            onClick={handleAdd}
            disabled={!draft.name.trim()}
          >
            Agregar
          </button>
          <span className="text-xs text-neutral-400">Puedes crear varios personajes antes de iniciar.</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
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

