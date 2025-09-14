// src/state/turnStore.ts
import { create } from 'zustand';

export type Phase = 'out_of_combat' | 'players' | 'enemies';

export type Actor = {
  id: string;
  name: string;
  hp: number;
  hpMax: number;
  def: number;
  atk: number;
  energy: number;
  energyMax: number;
  defense?: number;
  conditions?: any;
  profession?: string;
  inventory: any[];
  backpack?: any[];
  equippedWeaponId?: string;
  ammoByWeapon?: Record<string, number>;
};

export type TurnState = {
  phase: Phase;
  round: number;
  index: number;
  lock: boolean;
  players: Actor[];
  enemies: Actor[];
};

export type TurnAPI = {
  startCombat(players: Actor[], enemies: Actor[]): void;
  endCombat(): void;
  currentActorId(): string | null;
  isEnemyPhase(): boolean;
  endTurn(): void;
  setLock(v: boolean): void;
};

// helper to ensure defaults
function normalizeActor(a: Actor): Actor {
  return {
    equippedWeaponId: 'fists',
    ammoByWeapon: {},
    inventory: [],
    energy: 0,
    energyMax: 0,
    ...a,
    equippedWeaponId: a.equippedWeaponId ?? 'fists',
    ammoByWeapon: a.ammoByWeapon ?? {},
  };
}

export const useTurn = create<TurnState & TurnAPI>((set, get) => ({
  phase: 'out_of_combat',
  round: 0,
  index: 0,
  lock: false,
  players: [],
  enemies: [],

  startCombat(players, enemies) {
    set({
      players: players.map(normalizeActor),
      enemies: enemies.map(normalizeActor),
      phase: 'players',
      round: 1,
      index: 0,
      lock: false,
    });
  },

  endCombat() {
    set({ phase: 'out_of_combat', players: [], enemies: [], round: 0, index: 0, lock: false });
  },

  currentActorId() {
    const { phase, players, enemies, index } = get();
    if (phase === 'players') {
      const alive = players.filter((p) => p.hp > 0);
      return alive[index]?.id ?? null;
    }
    if (phase === 'enemies') {
      const alive = enemies.filter((e) => e.hp > 0);
      return alive[index]?.id ?? null;
    }
    return null;
  },

  isEnemyPhase() {
    return get().phase === 'enemies';
  },

  endTurn() {
    const { phase, players, enemies, index } = get();
    if (phase === 'players') {
      const alive = players.filter((p) => p.hp > 0);
      const next = index + 1;
      if (next < alive.length) {
        set({ index: next });
        return;
      }
      // enemy phase
      set({ phase: 'enemies', index: 0 });
      const aliveEnemies = enemies.filter((e) => e.hp > 0);
      let curPlayers = [...players];
      for (const enemy of aliveEnemies) {
        const targets = curPlayers.filter((p) => p.hp > 0);
        if (!targets.length) break;
        const target = targets[Math.floor(Math.random() * targets.length)];
        const dmg = Math.max(1, enemy.atk);
        curPlayers = curPlayers.map((p) =>
          p.id === target.id ? { ...p, hp: Math.max(0, p.hp - dmg) } : p
        );
      }
      set((s) => ({ players: curPlayers, phase: 'players', round: s.round + 1, index: 0 }));
    }
  },

  setLock(v) {
    set({ lock: v });
  },
}));
