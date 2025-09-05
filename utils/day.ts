export function getCurrentDay(state?: any): number {
  const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : {}) || {};
  const cands = [state?.currentDay, state?.day, state?.time?.day, state?.timeline?.day, g.__DAY, g.day];
  for (const v of cands) { const n = Number(v); if (Number.isFinite(n) && n > 0) return n; }
  return 1;
}
