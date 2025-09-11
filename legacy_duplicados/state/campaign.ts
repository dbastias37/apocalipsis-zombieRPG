import { create } from "zustand";
import type { Player } from "@/state/gameStore";
import type { DayContent, DecisionOption, NextDayModifiers } from "@/types/day";
import { loadDayContent } from "@/content/registry";

export type GameState = "menu" | "setup" | "playing" | "paused" | "victory" | "gameover";

export interface CampaignState {
  state: GameState;
  day: number;
  roster: Player[];
  flags: Set<string>;
  pendingNextDay: {
    flagsToSet: Set<string>;
    flagsToUnset: Set<string>;
    modifiers: NextDayModifiers;
  };
  content: Record<number, DayContent | undefined>;
  modifiersByDay: Record<number, NextDayModifiers | undefined>;
  tickEnabled: boolean;
  // actions
  setState: (s: GameState) => void;
  setRoster: (p: Player[]) => void;
  ensureDayLoaded: (day: number) => Promise<void>;
  applyDecision: (option: DecisionOption) => void;
  prepareNextDay: () => void;
  startCampaign: () => Promise<void>;
  setTickEnabled: (on: boolean) => void;
}

function mergeModifiers(target: NextDayModifiers, incoming: NextDayModifiers): NextDayModifiers {
  const out: NextDayModifiers = { ...target };
  if (incoming.hordeIntensity !== undefined)
    out.hordeIntensity = (out.hordeIntensity || 0) + incoming.hordeIntensity;
  if (incoming.safehouseRevealed)
    out.safehouseRevealed = Boolean(out.safehouseRevealed || incoming.safehouseRevealed);
  if (incoming.eventUnlocks)
    out.eventUnlocks = Array.from(new Set([...(out.eventUnlocks || []), ...incoming.eventUnlocks]));
  if (incoming.shopPricesMultiplier !== undefined)
    out.shopPricesMultiplier = (out.shopPricesMultiplier || 1) * incoming.shopPricesMultiplier;
  return out;
}

const useCampaignStore = create<CampaignState>((set, get) => ({
  state: "menu",
  day: 1,
  roster: [],
  flags: new Set<string>(),
  pendingNextDay: {
    flagsToSet: new Set(),
    flagsToUnset: new Set(),
    modifiers: {},
  },
  content: {},
  modifiersByDay: {},
  tickEnabled: false,

  setState: (s) => set({ state: s }),
  setRoster: (p) => set({ roster: p }),
  ensureDayLoaded: async (day: number) => {
    const existing = get().content[day];
    if (existing) return;
    const content = await loadDayContent(day);
    set((st) => ({ content: { ...st.content, [day]: content } }));
  },
  applyDecision: (option) => {
    const outcome = option.outcome;
    set((st) => {
      const pending = { ...st.pendingNextDay };
      outcome.flagsSet?.forEach((f) => pending.flagsToSet.add(f));
      outcome.flagsUnset?.forEach((f) => pending.flagsToUnset.add(f));
      if (outcome.nextDayModifiers) {
        pending.modifiers = mergeModifiers(pending.modifiers, outcome.nextDayModifiers);
      }
      return { pendingNextDay: pending };
    });
  },
  prepareNextDay: () => {
    const { pendingNextDay, day } = get();
    const nextDay = day + 1;
    const newFlags = new Set(get().flags);
    pendingNextDay.flagsToSet.forEach((f) => newFlags.add(f));
    pendingNextDay.flagsToUnset.forEach((f) => newFlags.delete(f));
    set((st) => {
      const modifiersByDay = { ...st.modifiersByDay };
      if (Object.keys(pendingNextDay.modifiers).length > 0) {
        modifiersByDay[nextDay] = mergeModifiers(
          modifiersByDay[nextDay] || {},
          pendingNextDay.modifiers
        );
      }
      return {
        flags: newFlags,
        modifiersByDay,
        day: nextDay,
        pendingNextDay: {
          flagsToSet: new Set(),
          flagsToUnset: new Set(),
          modifiers: {},
        },
      };
    });
    get().ensureDayLoaded(nextDay);
  },
  startCampaign: async () => {
    if (get().roster.length === 0) {
      console.error("No hay jugadores para iniciar campaña");
      return;
    }
    await get().ensureDayLoaded(1);
    set({ state: "playing", day: 1, tickEnabled: true });
  },
  setTickEnabled: (on) => set({ tickEnabled: on }),
}));

export const useCampaign = useCampaignStore;

export const campaignStore = {
  getState: () => useCampaignStore.getState(),
  canStartCampaign: () => useCampaignStore.getState().roster.length > 0,
  getDayContent: (day: number) => useCampaignStore.getState().content[day],
  setState: (s: GameState) => useCampaignStore.getState().setState(s),
  setRoster: (p: Player[]) => useCampaignStore.getState().setRoster(p),
  ensureDayLoaded: (d: number) => useCampaignStore.getState().ensureDayLoaded(d),
  applyDecision: (o: DecisionOption) => useCampaignStore.getState().applyDecision(o),
  prepareNextDay: () => useCampaignStore.getState().prepareNextDay(),
  startCampaign: () => useCampaignStore.getState().startCampaign(),
  setTickEnabled: (on: boolean) => useCampaignStore.getState().setTickEnabled(on),
};
