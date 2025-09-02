// src/state/levelStore.tsx
import React, { createContext, useContext, useMemo, useReducer, useEffect } from "react";
import type {
  DayId, DayState, LevelContextAPI, NarrativeFlags, DayRules, DeckId, LevelEndReason
} from "@/types/level";
import { dayDecksById, dayRulesById } from "@/data/days/dayConfigs";

type Action =
  | { type: "INIT_DAY"; day: DayId; players: string[] }
  | { type: "TICK"; nowMs: number }
  | { type: "OPEN_TURN_GATE"; index: number }
  | { type: "START_TURN" }
  | { type: "END_TURN" }
  | { type: "DRAW_CARD"; deck: DeckId; cardId: number | null }
  | { type: "MARK_USED"; deck: DeckId; cardId: number }
  | { type: "SPEND"; deck: DeckId; playerId: string }
  | { type: "START_EXPLORE"; id: number }
  | { type: "RESOLVE_EXPLORE"; id: number }
  | { type: "ADVANCE_DAY"; nextDay: DayId }
  | { type: "SET_FLAG"; key: string; value: any };

type State = {
  rules: DayRules;
  dayState: DayState;
  flags: NarrativeFlags;
};

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const initialState: State = {
  rules: dayRulesById[1],
  dayState: {
    day: 1,
    startedAt: null,
    endsAt: null,
    remainingMs: 0,
    activeDecks: { decision: [], combat: [], explore: [] },
    usedDecks: { decision: [], combat: [], explore: [] },
    currentPlayerIndex: 0,
    turnCounters: [],
    isTurnGateOpen: true,
    activeExploreInstance: null,
  },
  flags: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT_DAY": {
      const decks = dayDecksById[action.day];
      const now = Date.now();
      const rules = dayRulesById[action.day] ?? state.rules;
      const endsAt = now + rules.dayDurationMs;
      const turnCounters = action.players.map(p => ({
        playerId: p,
        decisionsLeft: rules.decisionsPerPlayer,
        combatsLeft: rules.combatsPerPlayer,
        exploresLeft: rules.exploresPerPlayer,
      }));
      return {
        ...state,
        rules,
        dayState: {
          day: action.day,
          startedAt: now,
          endsAt,
          remainingMs: rules.dayDurationMs,
          activeDecks: {
            decision: shuffle(decks.decisionIds),
            combat: shuffle(decks.combatIds),
            explore: shuffle(decks.exploreIds),
          },
          usedDecks: { decision: [], combat: [], explore: [] },
          currentPlayerIndex: 0,
          turnCounters,
          isTurnGateOpen: true,
          activeExploreInstance: null,
        },
      };
    }
    case "TICK": {
      if (!state.dayState.endsAt) return state;
      const remainingMs = Math.max(0, state.dayState.endsAt - action.nowMs);
      return { ...state, dayState: { ...state.dayState, remainingMs } };
    }
    case "OPEN_TURN_GATE":
      return { ...state, dayState: { ...state.dayState, currentPlayerIndex: action.index, isTurnGateOpen: true } };
    case "START_TURN":
      return { ...state, dayState: { ...state.dayState, isTurnGateOpen: false } };
    case "END_TURN": {
      const next = (state.dayState.currentPlayerIndex + 1) % state.dayState.turnCounters.length;
      return { ...state, dayState: { ...state.dayState, currentPlayerIndex: next, isTurnGateOpen: true } };
    }
    case "DRAW_CARD": {
      if (action.cardId == null) return state;
      return state;
    }
    case "MARK_USED": {
      const { deck, cardId } = action;
      const used = new Set(state.dayState.usedDecks[deck]);
      used.add(cardId);
      return {
        ...state,
        dayState: {
          ...state.dayState,
          usedDecks: { ...state.dayState.usedDecks, [deck]: Array.from(used) },
        },
      };
    }
    case "SPEND": {
      const { deck, playerId } = action;
      const key = deck === "decision" ? "decisionsLeft" : deck === "combat" ? "combatsLeft" : "exploresLeft";
      const updated = state.dayState.turnCounters.map(tc =>
        tc.playerId === playerId ? { ...tc, [key]: Math.max(0, (tc as any)[key] - 1) } : tc
      );
      return { ...state, dayState: { ...state.dayState, turnCounters: updated } };
    }
    case "START_EXPLORE":
      return { ...state, dayState: { ...state.dayState, activeExploreInstance: { id: action.id, startedAt: Date.now() } } };
    case "RESOLVE_EXPLORE":
      if (!state.dayState.activeExploreInstance) return state;
      if (state.dayState.activeExploreInstance.id !== action.id) return state;
      return { ...state, dayState: { ...state.dayState, activeExploreInstance: null } };
    case "ADVANCE_DAY": {
      const nextRules = dayRulesById[action.nextDay] ?? state.rules;
      const now = Date.now();
      const endsAt = now + nextRules.dayDurationMs;
      const decks = dayDecksById[action.nextDay];
      const players = state.dayState.turnCounters.map(t => t.playerId);
      const turnCounters = players.map(p => ({
        playerId: p,
        decisionsLeft: nextRules.decisionsPerPlayer,
        combatsLeft: nextRules.combatsPerPlayer,
        exploresLeft: nextRules.exploresPerPlayer,
      }));
      return {
        ...state,
        rules: nextRules,
        dayState: {
          day: action.nextDay,
          startedAt: now,
          endsAt,
          remainingMs: nextRules.dayDurationMs,
          activeDecks: {
            decision: shuffle(decks.decisionIds),
            combat: shuffle(decks.combatIds),
            explore: shuffle(decks.exploreIds),
          },
          usedDecks: { decision: [], combat: [], explore: [] },
          currentPlayerIndex: 0,
          turnCounters,
          isTurnGateOpen: true,
          activeExploreInstance: null,
        },
      };
    }
    case "SET_FLAG": {
      const { key, value } = action;
      return { ...state, flags: { ...state.flags, [key]: value } };
    }
    default:
      return state;
  }
}

const LevelCtx = createContext<LevelContextAPI | null>(null);

export const LevelProvider: React.FC<{
  children: React.ReactNode;
  onEvent?: (e: any) => void;
}> = ({ children, onEvent }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const t = setInterval(() => {
      dispatch({ type: "TICK", nowMs: Date.now() });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const api = useMemo<LevelContextAPI>(() => {
    const drawFrom = (deck: DeckId): number | null => {
      const arr = state.dayState.activeDecks[deck];
      if (!arr || arr.length === 0) return null;
      return arr[0];
    };

    const checkEndConditions = (): LevelEndReason | null => {
      if (state.dayState.remainingMs <= 0) return "time_out";
      const decksEmpty =
        state.dayState.activeDecks.decision.length === state.dayState.usedDecks.decision.length &&
        state.dayState.activeDecks.combat.length === state.dayState.usedDecks.combat.length &&
        state.dayState.activeDecks.explore.length === state.dayState.usedDecks.explore.length;
      if (decksEmpty) return "decks_exhausted";
      const sum = state.dayState.turnCounters.reduce(
        (acc, t) => acc + t.decisionsLeft + t.combatsLeft + t.exploresLeft,
        0
      );
      if (sum <= 0) return "turns_exhausted";
      return null;
    };

    return {
      dayState: state.dayState,
      flags: state.flags,
      rules: state.rules,

      initDay: (day, players) => {
        dispatch({ type: "INIT_DAY", day, players });
        onEvent?.({ type: "DAY_STARTED", day });
      },

      drawCard: (deck) => drawFrom(deck),

      markCardUsed: (deck, cardId) => {
        dispatch({ type: "MARK_USED", deck, cardId });
      },

      spendDecision: (playerId) => dispatch({ type: "SPEND", deck: "decision", playerId }),
      spendCombat: (playerId) => dispatch({ type: "SPEND", deck: "combat", playerId }),
      spendExplore: (playerId) => dispatch({ type: "SPEND", deck: "explore", playerId }),
      startExploreInstance: (id) => dispatch({ type: "START_EXPLORE", id }),
      resolveExploreInstance: (id) => dispatch({ type: "RESOLVE_EXPLORE", id }),

      openTurnGate: (playerIndex) => dispatch({ type: "OPEN_TURN_GATE", index: playerIndex }),
      startTurn: () => dispatch({ type: "START_TURN" }),
      endTurn: () => {
        dispatch({ type: "END_TURN" });
        const next = (state.dayState.currentPlayerIndex + 1) % state.dayState.turnCounters.length;
        const nextName = state.dayState.turnCounters[next]?.playerId ?? "Siguiente";
        onEvent?.({ type: "TURN_ENDED", nextPlayerName: nextName });
      },

      tick: (now) => dispatch({ type: "TICK", nowMs: now }),

      checkEndConditions,

      advanceToNextDay: (nextDay) => {
        const reason = checkEndConditions();
        dispatch({ type: "ADVANCE_DAY", nextDay });
        onEvent?.({ type: "DAY_ENDED", day: state.dayState.day, reason: reason ?? "time_out" });
        onEvent?.({ type: "DAY_STARTED", day: nextDay });
      },

      setFlag: (key, value) => dispatch({ type: "SET_FLAG", key, value }),
      onEvent,
    };
  }, [state, onEvent]);

  return <LevelCtx.Provider value={api}>{children}</LevelCtx.Provider>;
};

export const useLevel = () => {
  const ctx = useContext(LevelCtx);
  if (!ctx) throw new Error("useLevel must be used within LevelProvider");
  return ctx;
};
