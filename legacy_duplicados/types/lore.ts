export interface LoreEntry {
  id: string;           // uid "D{day}-N{noteId}"
  noteId: number;
  day: number;
  title: string;        // derivado de la nota (“Diario del granjero”, etc.)
  body: string;         // texto multi-línea (>=30 líneas)
  createdAt: number;
}
