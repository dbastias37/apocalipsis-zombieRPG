import { DayContent } from "@/types/day";
import { validateDayContent } from "@/utils/validateDayContent";

async function loadJson<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[DayContent] fallo al cargar", path, err);
    return [];
  }
}

export async function loadDayContent(day: number): Promise<DayContent> {
  const base = `/data/day${day}`;
  const [decisions, battles, exploration] = await Promise.all([
    loadJson(`${base}/day${day}_decisions.json`),
    loadJson(`${base}/day${day}_battles.json`),
    loadJson(`${base}/day${day}_exploration.json`),
  ]);
  const content: DayContent = { decisions, battles, exploration };
  if (import.meta.env.DEV) {
    validateDayContent(day, content);
  }
  return content;
}
