import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/state/gameStore";
import type { Player } from "@/state/gameStore";
import { useUIStore } from "@/state/ui";

type Draft = { name: string; profession: string; bio: string };

const PROFESSIONS = [
  "Médico/a","Mecánico/a","Docente","Scout","Carpintero/a","Enfermero/a",
  "Bombero/a","Cocinero/a","Agricultor/a","Electricista","Policía","Militar"
];
const defaultProfession = PROFESSIONS[0];

export default function CharacterCreationPanel() {
  const { players, createPlayer, updatePlayer, removePlayer, setPaused } = useGameStore();
  const { setMode } = useUIStore();

  const [draft, setDraft] = useState<Draft>({ name: "", profession: defaultProfession, bio: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Autocrear personaje inicial "Sara" la primera vez
  const autoSeeded = useRef(false);
  useEffect(() => {
    if (!autoSeeded.current && players.length === 0) {
      createPlayer({ name: "Sara", profession: defaultProfession, bio: "" });
      autoSeeded.current = true;
    }
  }, [players.length, createPlayer]);

  // Cargar a "Sara" para editar una sola vez
  const autoLoaded = useRef(false);
  useEffect(() => {
    if (!autoLoaded.current && players.length > 0) {
      setEditingId(players[0].id);
      setDraft({ name: "", profession: "", bio: "" });
      autoLoaded.current = true;
    }
  }, [players]);

  const initial = players.find((p) => p.id === editingId);
  // Prefill solo cuando el usuario aún no escribió nada
  useEffect(() => {
    if (!initial) return;
    setDraft((prev) => {
      const userTyped = (prev.name?.trim() || prev.profession?.trim() || prev.bio?.trim());
      if (userTyped) return prev; // no sobrescribir si ya empezó a escribir
      return {
        name: initial.name ?? "",
        profession: initial.profession ?? defaultProfession,
        bio: initial.bio ?? "",
      };
    });
  }, [initial]);

  const onChange = (k: keyof Draft, v: string) => setDraft((prev) => ({ ...prev, [k]: v }));

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setDraft({ name: "", profession: "", bio: "" });
  };

  const handleSubmit = () => {
    const nm = draft.name.trim();
    if (!nm) return;
    if (editingId) {
      updatePlayer(editingId, { name: nm, profession: draft.profession, bio: draft.bio });
      setEditingId(null);
    } else {
      createPlayer({ name: nm, profession: draft.profession, bio: draft.bio });
    }
    setDraft({ name: "", profession: defaultProfession, bio: "" });
  };

  const handleRemove = (id: string) => {
    removePlayer(id);
    if (editingId === id) {
      setEditingId(null);
      setDraft({ name: "", profession: defaultProfession, bio: "" });
    }
  };

  const handleStart = () => {
    if (players.length > 0) {
      setMode("running");
      setPaused(false); // resume game clock
    }
  };

  const submitLabel = editingId ? "Guardar cambios" : "Agregar al roster";
  const hasPlayers = players.length > 0;

  return (
    <div className="max-w-2xl mx-auto card card-red p-6 space-y-6 animate-fade-in">
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
            onKeyDown={(e) => e.stopPropagation()}
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
            onKeyDown={(e) => e.stopPropagation()}
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
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!draft.name.trim()}
          >
            {submitLabel}
          </button>
          <span className="text-xs text-neutral-400">Puedes crear varios personajes antes de iniciar.</span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-bold">Roster</h3>
        {players.length === 0 ? (
          <p className="text-neutral-400">Aún no hay personajes creados.</p>
        ) : (
          players.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border-2 border-neutral-800 bg-neutral-900/50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{p.name}</div>
                  <div className="text-sm text-neutral-400">{p.profession}</div>
                  {p.bio && <div className="text-xs text-neutral-500 mt-2 italic">{p.bio}</div>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded-lg text-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          onClick={handleStart}
          disabled={!hasPlayers}
        >
          Iniciar campaña
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Sugerencia: crea varios personajes y luego pulsa “Iniciar”. El juego permanece en pausa durante la creación.
      </p>
    </div>
  );
}

