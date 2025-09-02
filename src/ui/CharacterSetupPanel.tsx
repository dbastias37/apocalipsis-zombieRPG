import React, { useEffect, useRef, useState } from "react";
import { campaignStore, useCampaign } from "@/state/campaign";
import { toast } from "@/components/Toast";

type Draft = { name: string; profession: string; bio: string };

const PROFESSIONS = [
  "Médico/a","Mecánico/a","Docente","Scout","Carpintero/a","Enfermero/a",
  "Bombero/a","Cocinero/a","Agricultor/a","Electricista","Policía","Militar"
];

export default function CharacterSetupPanel() {
  const roster = useCampaign((s) => s.roster);
  const [draft, setDraft] = useState<Draft>({ name: "", profession: PROFESSIONS[0], bio: "" });
  const seededOnce = useRef(false);

  useEffect(() => {
    if (seededOnce.current) return;
    if (!draft.name.trim() && !draft.bio.trim()) {
      setDraft((prev) => ({ ...prev, name: "Sara" }));
      seededOnce.current = true;
    }
  }, [draft.name, draft.bio]);

  const onChange = (k: keyof Draft, v: string) => setDraft((p) => ({ ...p, [k]: v }));

  const addToRoster = () => {
    const nm = draft.name.trim();
    if (!nm) return;
    const newPlayer = { id: crypto.randomUUID(), name: nm, profession: draft.profession, bio: draft.bio };
    campaignStore.setRoster([...roster, newPlayer]);
    setDraft({ name: "", profession: PROFESSIONS[0], bio: "" });
    seededOnce.current = false;
  };

  const onStartCampaign = async () => {
    if (roster.length === 0) {
      toast("Necesitas al menos un jugador");
      return;
    }
    await campaignStore.ensureDayLoaded(1);
    campaignStore.setState("playing");
  };

  const stopAllKeysCapture: React.KeyboardEventHandler = (e) => {
    if (e.key === "Enter") e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="max-w-2xl mx-auto card card-red p-6 space-y-6 animate-fade-in"
      onKeyDownCapture={stopAllKeysCapture}
      onKeyUpCapture={(e) => e.stopPropagation()}
      onKeyPressCapture={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-bold">Crear personaje</h2>

      <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); addToRoster(); }} noValidate>
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
            type="submit"
            className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
            disabled={!draft.name.trim()}
          >
            Agregar
          </button>
          <span className="text-xs text-neutral-400">Puedes crear varios personajes antes de iniciar.</span>
        </div>
      </form>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          onClick={onStartCampaign}
          disabled={roster.length === 0}
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
