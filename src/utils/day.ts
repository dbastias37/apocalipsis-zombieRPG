export function getCurrentDay(state: any): number {
  const cand =
    state?.currentDay ??
    state?.day ??
    state?.time?.day ??
    state?.timeline?.day ??
    1;
  const n = Number(cand);
  return Number.isFinite(n) ? n : 1;
}
