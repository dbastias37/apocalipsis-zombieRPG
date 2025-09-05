import type { GameNote } from "../data/notes";
import type { LoreEntry } from "../types/lore";
import { DAY1_LORE, DAY2_LORE, DAY3_LORE } from "../data/lore";

function norm(s?: string): string {
  return String(s || "").normalize("NFD").replace(/\p{Diacritic}/gu,"" ).toLowerCase();
}
function pickMapByDay(day:number){
  if (day === 3) return DAY3_LORE;
  if (day === 2) return DAY2_LORE;
  return DAY1_LORE;
}
function matchKey(note: GameNote): string | null {
  const nTitle = norm(note.title);
  const nHint  = norm(note.hintLocation);
  const haystack = `${nTitle} ${nHint}`;

  const keys = [
    "granja","granjero","silo",
    "taller","mecanico","ferreteria",
    "hospital","enfermeria","clinica",
    "metro","estacion","subterraneo",
    "puerto","muelle",
    "garaje","garage",
    "bodega","almacen",
    "oficina","banco",
    "terminal","buses",
    "comisaria",
    "refineria","planta",
    "biblioteca",
    "laboratorio","lab",
    "astillero",
    "base","militar"
  ];
  for (const k of keys){
    if (haystack.includes(k)) return k;
  }
  return null;
}

/** fallback: genera una historia coherente (>=30 líneas) a partir de la nota */
function generatedFallback(note: GameNote, day:number){
  const title = `Voces del ${note.hintLocation ? note.hintLocation : 'silencio'}`;
  const base = [
    `La nota decía: "${note.title}".`,
    `Día ${day}.`,
    "Escribo para no olvidar.",
    "—",
  ];
  // crea 30–34 líneas con variaciones
  const extra: string[] = [];
  for (let i=0;i<32;i++){
    extra.push(
      [
        "No hubo sirenas esta vez.",
        "El metal del cerrojo se astilló.",
        "Los pasos se contaron hasta el amanecer.",
        "El agua sabía a polvo.",
        "Prometí no volver, pero volví.",
        "Las ventanas dejaron de mirar hacia afuera.",
        "El perro no ladró.",
        "Escribo nombres para que no se borren.",
      ][i % 8]
    );
  }
  return { title, body: [...base, ...extra].join("\n") };
}

export function resolveLoreForNote(note: GameNote, day:number): { title:string; body:string } {
  const map = pickMapByDay(day);
  const key = matchKey(note);
  if (key && map[key]) return map[key];
  // sin match: fallback seguro
  return generatedFallback(note, day);
}

export function buildLoreEntry(note: GameNote, day:number): LoreEntry {
  const { title, body } = resolveLoreForNote(note, day);
  return {
    id: `D${day}-N${note.id}`,
    noteId: note.id,
    day,
    title,
    body,
    createdAt: Date.now(),
  };
}
