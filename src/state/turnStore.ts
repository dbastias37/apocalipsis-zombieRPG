// src/state/turnStore.ts
import { create } from "zustand";

export type Phase = "out_of_combat" | "players" | "enemies";
export type Actor = { id: string; name: string; hp: number; hpMax: number; def: number; atk: number };

type TurnState = {
  phase: Phase;
  round: number;
  order: string[];
  index: number;
  lock: boolean;
  players: Actor[];
  enemies: Actor[];
};

type TurnAPI = {
  startCombat(players: Actor[], enemies: Actor[]): void;
  endCombat(): void;
  endTurn(): void;
  currentActorId(): string | null;
  isEnemyPhase(): boolean;
  setLock(v: boolean): void;
};

export const useTurn = create<TurnState & TurnAPI>((set, get) => ({
  phase: "out_of_combat",
  round: 0,
  order: [],
  index: 0,
  lock: false,
  players: [],
  enemies: [],

  startCombat(players, enemies) {
    const order = [...players.map(p => p.id), ...enemies.map(e => e.id)];
    set({ phase: "players", round: 1, order, index: 0, players, enemies, lock: false });
  },

  endCombat() {
    set({ phase: "out_of_combat", order: [], index: 0, enemies: [], lock: false });
  },

  endTurn() {
    const { phase, order, index, enemies, players } = get();
    if (phase === "players") {
      // avanzar a siguiente jugador vivo; si no quedan, fase enemigos
      const nextIndex = index + 1;
      const playersCount = players.filter(p => p.hp > 0).length;
      if (nextIndex < playersCount) {
        set({ index: nextIndex });
      } else {
        set({ phase: "enemies", index: 0 });
      }
    } else if (phase === "enemies") {
      // fin de ronda -> vuelve a jugadores
      set((s) => ({ phase: "players", index: 0, round: s.round + 1 }));
    }
  },

  currentActorId() {
    const { phase, order, index, players, enemies } = get();
    if (phase === "players") {
      const alivePlayers = players.filter(p => p.hp > 0);
      return alivePlayers[index]?.id ?? null;
    }
    if (phase === "enemies") {
      const aliveEnemies = enemies.filter(e => e.hp > 0);
      return aliveEnemies[index]?.id ?? null;
    }
    return null;
  },

  isEnemyPhase() {
    return get().phase === "enemies";
  },

  setLock(v) { set({ lock: v }); }
}));

