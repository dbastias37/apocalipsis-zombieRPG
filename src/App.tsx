
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { setActivePlayerCompat } from "./compat/active-player-compat";
import { useTurn } from "./state/turnStore";
import { ITEMS_CATALOG } from "./data/items";
import { GAME_NOTES, GameNote } from "./data/notes";
import WelcomeOverlay from "./components/WelcomeOverlay";
import { useTypewriterQueue } from "./hooks/useTypewriterQueue";
import type { AmmoBox } from "./types/items";
import type { InventoryItem } from "./types/inventory";
import type { BackpackItem } from "./systems/supplies";
import {
  weaponFlavorFrom,
  hitPhraseByFlavor,
  MISS_MELEE,
  MISS_RANGED,
  TAIL_BLEED,
  TAIL_STUN,
  TAIL_INFECT,
  HEAL_LINES,
  FLEE_LINES,
  render,
  pick,
  ENEMY_COUNTER_20,
  renderCounter,
  counterEffectText,
} from "./data/combatPhrases";
import { WEAPONS } from "./data/weapons";
import {
  equipWeapon,
  getEquippedWeapon,
  getSelectedWeapon,
  isOutOfAmmoForEquipped,
  isRangedWeapon,
  canReloadEquipped,
} from "./systems/weapons";
import {
  getLoadedAmmo,
  setLoadedAmmo,
  spendAmmo,
  totalAmmoInInventory,
  toAmmoBox,
  toLooseAmmo,
  consumeAmmoFromPlayer,
  reloadWeaponMagazine,
  getMagazineCount,
} from "./systems/ammo";
import { getAvailableWeapons } from "./systems/combat/getAvailableWeapons";
import { withEnergy } from "./systems/actors";
import { consumeFoodFromPlayer } from "./systems/food";
import {
  consumeMedicineFromPlayer,
  addMedicineToCamp,
  isMed,
  medCount,
  setMedCount,
} from "./systems/medicine";
import {
  consumeFood,
  consumeMed,
  materializeFoodFromStock,
  moveFromStashToPlayer,
  materializeMedFromStock,
} from "./systems/inventory";
import { FOOD_CATALOG } from "./data/consumables";
import StockFoodModal from "./components/StockFoodModal";
import StockMedicineModal from "./components/StockMedicineModal";
import StockAmmoModal from "./components/StockAmmoModal";
import WeaponSelector from "./components/combat/WeaponSelector";
import BattleTicker from "./components/BattleTicker";
import InfectionFatalModal from "./components/overlays/InfectionFatalModal";
import HealAllyModal from "./components/overlays/HealAllyModal";
import DayEndModal from "./components/overlays/DayEndModal";
import AmmoWithdrawModal from "./components/overlays/AmmoWithdrawModal";
import AmmoReloadModal from "./components/overlays/AmmoReloadModal";
import OverlayRoot from "./components/overlays/OverlayRoot";
import CampTileButton from "./components/CampTileButton";
import { registerLogger, gameLog, registerTimeProvider } from "./utils/logger";
import { initLogger } from "./systems/logger";
import { DAY_LENGTH_MS, ACTION_TIME_COSTS } from "./config/time";
import { day1DecisionCards } from "./data/days/day1/decisionCards.day1";
import { day2DecisionCards } from "./data/days/day2/decisionCards.day2";
import { day3DecisionCards } from "./data/days/day3/decisionCards.day3";
import { day1ExplorationCards } from "./data/days/day1/explorationCards.day1";
import { day2ExplorationCards } from "./data/days/day2/explorationCards.day2";
import { day3ExplorationCards } from "./data/days/day3/explorationCards.day3";
import type { ExplorationCard } from "./data/explorationCards";
import type { DecisionCard } from "./data/decisionCards";
import {
  Conditions,
  hasCondition,
  addCondition,
  removeCondition,
  applyStartOfTurnConditions,
  applyEndOfTurnConditions,
  cureCondition,
} from "./systems/status";



const isMedkit = (it:any) => isMed(it) && (it.kind === "kit" || medCount(it) > 1);
// === Tipos ===
type Phase = "dawn" | "day" | "dusk" | "night";
type GameState = "menu" | "playing" | "paused" | "victory" | "gameover";
type CardType = "decision" | "combat";

type Attributes = { Fuerza: number; Destreza: number; Constitucion: number; Inteligencia: number; Carisma: number };
type Player = {
  id: string;
  name: string;
  profession: string;
  hp: number; hpMax: number;
  energy: number; energyMax: number;
  defense: number;
  status: "ok"|"wounded"|"infected"|"dead";
  inventory: any[];
  backpack?: BackpackItem[];
  attrs: Attributes;
  conditions?: Conditions;
  selectedWeaponId?: string;
  currentWeaponId?: string;
  ammoByWeapon?: Record<string, number>;
  backpackCapacity?: number;
};

type Enemy = {
  id: string;
  name: string;
  hp: number;
  hpMax: number;
  def: number;
  atk: number;
  special?: string;
  conditions?: Conditions;
};
type Resources = { food: number; water: number; medicine: number; fuel: number; ammo: number; materials: number; };
type Camp = { defense: number; comfort: number };

type BattlePlayerStats = {
  meleeHits: number;
  meleeMisses: number;
  rangedHits: number;
  rangedMisses: number;
  heals: number;
  points: number;
};
type BattleStats = {
  byPlayer: Record<string, BattlePlayerStats>;
  lootNames: string[];
};

type Card = {
  id: string;
  type: CardType;
  title: string;
  text: string;
  scene?: "almacen" | "callejon" | "azotea" | "carretera";
  choices?: { text: string; effect: Partial<Resources> & { morale?: number; threat?: number; spawnEnemies?: number } }[];
  difficulty?: number; // para cartas de combate opcional
};

type TimedEvent = {
  id: string;
  name: string;
  text: string;
  startedAt: number;
  durationMs: number;
  onExpire: () => void;
  onResolvePositive?: () => void;
};

// === Utilidades ===

// Activa el modo de contraataque (sin fase de turnos de enemigos)
const USE_COUNTERATTACK_MODE = true;

// Probabilidad de aturdir con armas melee y rangos de daño/coste
const MELEE_STUN_CHANCE = 0.30;        // 30% por golpe acertado
const MELEE_STUN_DMG_MIN = 1;
const MELEE_STUN_DMG_MAX = 4;
const ENERGY_COST_STUN_MIN = 4;
const ENERGY_COST_STUN_MAX = 7;
const ENERGY_COST_MELEE_HIT_NO_STUN = 2;

function uid() { return Math.random().toString(36).slice(2,10); }
function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n));}

function roll(times:number, faces:number, mod=0){
  let total=0; const rolls:number[]=[];
  for(let i=0;i<times;i++){ const r = Math.floor(Math.random()*faces)+1; total+=r; rolls.push(r); }
  return { rolls, natural: total, total: total+mod, modifier: mod };
}

function mod(score:number){ return Math.floor((score-10)/2); }

function rollInt(min:number,max:number){ return Math.floor(min + Math.random()*(max-min+1)); }

const WEAPON_ID_ALIASES: Record<string, string> = {
  pistol: "pistol9",
};

function resolveWeaponId(id: string): string {
  if (WEAPONS[id]) return id;
  return WEAPON_ID_ALIASES[id] ?? id;
}

function WeaponQuickBar({
  player,
  onSelect,
}: {
  player: Player;
  onSelect: (playerId: string, weaponId: string) => void;
}) {
  const options = getAvailableWeapons(player) ?? [];
  const selectedWeapon = getSelectedWeapon(player);
  const current = selectedWeapon?.id ?? player.currentWeaponId ?? player.selectedWeaponId ?? "fists";

  const dmg = (id: string) => {
    const resolved = resolveWeaponId(id);
    const weapon = WEAPONS[resolved];
    const dice = weapon?.damage;
    if (!dice) return "--";
    const min = dice.times * 1 + (dice.mod ?? 0);
    const max = dice.times * dice.faces + (dice.mod ?? 0);
    return `${min}-${max}`;
  };

  const safeOptions = options.length ? options : [{ id: "fists", label: "Puños", usable: true }];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "6px 0 10px 0" }}>
      {safeOptions.map((opt: any) => {
        const resolvedId = resolveWeaponId(opt.id);
        const weapon = WEAPONS[resolvedId];
        const fallbackName = weapon?.name ?? opt.name ?? resolvedId;
        const label = opt.label ?? `${fallbackName} · ${dmg(resolvedId)}`;
        const selected = resolvedId === resolveWeaponId(current);
        const unavailable = opt.usable === false;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(player.id, resolvedId)}
            aria-pressed={selected}
            className={`btn ${selected ? "btn-primary" : "btn-outline"} ${unavailable ? "opacity-60" : ""}`}
            style={{
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: selected ? 700 : 500,
              outline: selected ? "2px solid #6cf" : "none",
              cursor: "pointer",
              textAlign: "left",
              whiteSpace: "normal",
            }}
            title={opt.reason ?? fallbackName}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function maybeAmmoBox(){
  if (Math.random() < 0.35){
    const n = rollInt(6,12);
    return { id: crypto.randomUUID(), name: `Caja de munición (${n})`, type: "ammo_box", bullets: n } as AmmoBox;
  }
  return null;
}

function maybeEnemyAmmoDrop(){
  if (Math.random() < 0.30){
    const n = rollInt(3,8);
    return { id: crypto.randomUUID(), name: `Caja de munición (${n})`, type: "ammo_box", bullets: n } as AmmoBox;
  }
  return null;
}


const baseEnemies: Enemy[] = [
  { id: uid(), name: "Zombi Común", hp: 15, hpMax: 15, def: 10, atk: 2 },
  { id: uid(), name: "Corredor", hp: 10, hpMax: 10, def: 13, atk: 3 },
  { id: uid(), name: "Tanque", hp: 28, hpMax: 28, def: 8,  atk: 5 },
  { id: uid(), name: "Acechador", hp: 12, hpMax: 12, def: 15, atk: 4 },
];

// === Cartas (ejemplos; puedes ampliar) ===
function mapDecisionCards(cards: DecisionCard[]): Card[] {
  return cards.map(c => ({
    id: c.id,
    type: "decision" as const,
    title: c.title,
    text: c.text,
    choices: c.choices as any,
  }));
}

function getDecisionDeckForDay(d: number) {
  if (d === 3) return day3DecisionCards;
  if (d === 2) return day2DecisionCards;
  return day1DecisionCards;
}

function getExplorationDeckForDay(d: number): ExplorationCard[] {
  if (d === 3) return day3ExplorationCards ?? [];
  if (d === 2) return day2ExplorationCards ?? [];
  return day1ExplorationCards ?? [];
}

const combatDeckSeed: Card[] = [
  {
    id: uid(),
    type: "combat",
    title: "Callejón Estrecho",
    scene: "callejon",
    text: "Gritos al final del callejón. La acústica confunde a los muertos: se acercan desordenados.",
    difficulty: 12,
  },
  {
    id: uid(),
    type: "combat",
    title: "Almacén en Penumbra",
    scene: "almacen",
    text: "Palés volcados, sombras tensas. Algo se mueve entre estanterías metálicas.",
    difficulty: 14,
  },
];

type Reward = Partial<{
  food: number; water: number; materials: number; ammo: number; medicine: number; fuel: number; item: string;
}>;

interface ExplorationEvent {
  id: number;
  text: string;
  reward: Reward;
}

const EXPLORATION_EVENTS: ExplorationEvent[] = [
  { id: 1,  text: "Encuentras una despensa saqueada, aún quedan latas.", reward: { food: 3 } },
  { id: 2,  text: "Bidón medio lleno escondido bajo un auto.", reward: { fuel: 2 } },
  { id: 3,  text: "Botiquín empolvado en una farmacia abandonada.", reward: { medicine: 2 } },
  { id: 4,  text: "Caja de munición en un puesto militar caído.", reward: { ammo: 12 } },
  { id: 5,  text: "Chatarra útil para refuerzos.", reward: { materials: 6 } },
  { id: 6,  text: "Garrafa y agua embotellada aún potable.", reward: { water: 4 } },
  { id: 7,  text: "Rifle viejo aún funcional.", reward: { item: "Rifle", ammo: 6 } },
  { id: 8,  text: "Pistola oculta en una guantera.", reward: { item: "Pistola", ammo: 8 } },
  { id: 9,  text: "Cocina de campaña, útiles varios.", reward: { item: "Kit de cocina", food: 2 } },
  { id:10,  text: "Mochila robusta para cargar más.", reward: { item: "Mochila", materials: 2 } },
  { id:11,  text: "Hachas y herramientas dispersas.", reward: { item: "Hacha", materials: 3 } },
  { id:12,  text: "Tienda compacta y aislante.", reward: { item: "Toldo reforzado" } },
  { id:13,  text: "Mapa local con rutas seguras marcadas.", reward: { item: "Mapa", fuel: 1 } },
  { id:14,  text: "Baterías y linterna operativa.", reward: { item: "Linterna" } },
  { id:15,  text: "Gran caja de clavos y listones.", reward: { materials: 10 } },
  { id:16,  text: "Cantimploras y pastillas potabilizadoras.", reward: { water: 3, item: "Pastillas potabilizadoras" } },
  { id:17,  text: "Raciones militares en buen estado.", reward: { food: 5 } },
  { id:18,  text: "Medicamentos variados sin caducar.", reward: { medicine: 3 } },
  { id:19,  text: "Rollo de alambre y herramientas de sujeción.", reward: { materials: 7 } },
  { id:20,  text: "Munición calibre variado.", reward: { ammo: 15 } },
  { id:21,  text: "Combustible sifoneado de un generador.", reward: { fuel: 3 } },
  { id:22,  text: "Caja de pesca con útiles improvisables.", reward: { item: "Caja multiusos", food: 1 } },
  { id:23,  text: "Plancha de metal para blindaje.", reward: { materials: 8 } },
  { id:24,  text: "Cuaderno de notas útil para coordinar.", reward: { item: "Cuaderno" } },
  { id:25,  text: "Cuerda y mosquetones.", reward: { item: "Cuerda", materials: 2 } },
  { id:26,  text: "Guantes, linterna frontal, cinta.", reward: { item: "Kit de mantenimiento" } },
  { id:27,  text: "Latas escondidas bajo el piso.", reward: { food: 4 } },
  { id:28,  text: "Tambores con un poco de gasolina.", reward: { fuel: 2 } },
  { id:29,  text: "Caja médica sellada (suerte).", reward: { medicine: 4 } },
  { id:30,  text: "Pequeño arsenal olvidado.", reward: { ammo: 20, item: "Cuchillo táctico" } },
];

// === Componente principal ===
export default function App(){
  // Estado base
  const [state, setState] = useState<GameState>("menu");
  const [day, setDay] = useState<number>(1);
  React.useEffect(()=>{ (globalThis as any).__DAY = day; }, [day]);
  const [phase, setPhase] = useState<Phase>("dawn");
  const [clockMs, setClockMs] = useState<number>(DAY_LENGTH_MS);
  const clockMsRef = useRef(DAY_LENGTH_MS);
  const [timeRunning, setTimeRunning] = useState(true);

  const [morale, setMorale] = useState(60);
  const [threat, setThreat] = useState(10);
  const [resources, setResources] = useState<Resources>({ food: 15, water: 15, medicine: 6, fuel: 10, ammo: 30, materials: 12 });
  const [camp, setCamp] = useState<Camp>({ defense: 10, comfort: 10 });

  const [players, setPlayers] = useState<Player[]>([
    mkPlayer("Sarah", "Médica"),
    mkPlayer("Marcus", "Soldado"),
    mkPlayer("Elena", "Psicóloga"),
  ].map(p => {
    const table = { ...(p.ammoByWeapon ?? {}) };
    if (typeof table.pistol !== "number") table.pistol = 3; // 3 balas iniciales
    const inv = Array.isArray((p as any).inventory)
      ? (p as any).inventory
      : Array.isArray((p as any).backpack) ? (p as any).backpack : [];
    const { energy, energyMax } = p as any;
    return {
      ...p,
      energy: typeof energy === 'number' ? energy : 50,
      energyMax: typeof energyMax === 'number' ? energyMax : 100,
      equippedWeaponId: (p as any).equippedWeaponId ?? 'fists',
      selectedWeaponId: p.selectedWeaponId ?? "fists",
      currentWeaponId: p.currentWeaponId ?? p.selectedWeaponId ?? "fists",
      ammoByWeapon: table,
      backpack: inv,
      inventory: inv,
    };
  }));
  const [turnOrder, setTurnOrder] = useState<string[] | null>(null);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  // Mazo de cartas
  const [decisionDeck, setDecisionDeck] = useState<Card[]>(() => shuffle(mapDecisionCards(getDecisionDeckForDay(day))));
  const [explorationDeck, setExplorationDeck] = useState<ExplorationCard[]>(() => shuffle(getExplorationDeckForDay(day)));
  const [combatDeck, setCombatDeck] = useState<Card[]>(shuffle([...combatDeckSeed]));
  const [discardDecision, setDiscardDecision] = useState<Card[]>([]);
  const [discardCombat, setDiscardCombat] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card|null>(null);

  // Enemigos cuando hay combate
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  const [battleStats, setBattleStats] = useState<BattleStats>({ byPlayer: {}, lootNames: [] });
  const [dayStats, setDayStats] = useState({ damageDealt: 0, misses: 0, shotsFired: 0 });
  const [stats, setStats] = useState({ decisions:0, explorations:0, battles:0, kills:0 });

  // overlay de fin de día
  const [infectionDead, setInfectionDead] = useState<{id:string,name:string}|null>(null);
  const [showHealAlly, setShowHealAlly] = useState(false);
  const [showDayEnd, setShowDayEnd] = useState(false);
  const [showAmmoModal, setShowAmmoModal] = useState(false);
  const [showReloadModal, setShowReloadModal] = useState(false);
  const [dayEndLines, setDayEndLines] = useState<string[]>([]);
  const combatStartedRef = useRef(false);
  // Turnos
  const [isEnemyPhase, setIsEnemyPhase] = useState<boolean>(false);
  const [enemyIdx, setEnemyIdx] = useState<number>(0);
  const [actedThisRound, setActedThisRound] = useState<Record<string, boolean>>({});
  // Bloqueo de inputs de combate (por typewriter o "presiona Enter" pendiente)
  const [controlsLocked, setControlsLocked] = useState(false);

  // Cuando una acción del jugador requiere terminar con Enter, guardamos el "qué hacer después"
  const postActionContinueRef = useRef<null | (() => void)>(null);

  function touchPlayerStats(playerId: string) {
    setBattleStats(prev => {
      const bp = prev.byPlayer[playerId] ?? { meleeHits:0, meleeMisses:0, rangedHits:0, rangedMisses:0, heals:0, points:0 };
      return { ...prev, byPlayer: { ...prev.byPlayer, [playerId]: bp } };
    });
  }

  // ---- Refs para leer estado “fresco” dentro de callbacks/efectos ----
  const actedThisRoundRef = useRef<Record<string, boolean>>(actedThisRound);
  useEffect(()=>{ actedThisRoundRef.current = actedThisRound; }, [actedThisRound]);

  // Normalizador
  function norm(s?: string){ return String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase(); }

  // confirma recarga desde el modal
  function confirmReload(weaponId: string, bullets: number) {
    const pid = activePlayerId;
    if (!pid) return;
    setControlsLocked(true);
    let reloadLine: string | null = null;

    const player = players.find(p=>p.id===pid);
    if (!player) { setControlsLocked(false); return; }
    const wId = player.equippedWeaponId ?? player.selectedWeaponId ?? 'fists';
    if (wId !== weaponId) {
      pushBattle('Debes tener equipada la pistola para recargarla.');
      setShowReloadModal(false);
      setControlsLocked(false);
      return;
    }

    setPlayers(prev => prev.map(p => {
      if (p.id !== pid) return p;

      const weapon = WEAPONS[weaponId];
      const magSize = Math.max(0, Number(weapon?.magSize ?? 0));
      const curLoaded = getLoadedAmmo(p, weaponId);
      const freeSpace = Math.max(0, magSize - curLoaded);

      const desired = Math.max(0, Math.floor(bullets));
      const need = Math.min(desired, freeSpace);
      if (need <= 0) return p;

      const { player: afterConsume, taken } = consumeAmmoFromPlayer(p, need);
      if (taken <= 0) return p;

      const nextLoaded = Math.min(magSize, curLoaded + taken);
      const afterLoad = setLoadedAmmo(afterConsume, weaponId, nextLoaded);

      const table = { ...(afterLoad.ammoByWeapon ?? {}) };
      table[weaponId] = nextLoaded;

      reloadLine = `🔧 Recargas ${taken} munición(es) en ${weapon?.name ?? weaponId}.`;
      return { ...afterLoad, ammoByWeapon: table, selectedWeaponId: weaponId, currentWeaponId: weaponId };
    }));

    setShowReloadModal(false);

    if (reloadLine) {
      pushBattle(reloadLine);
    }

    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      advanceTurn();
    }));
  }

  const playersRef = useRef(players);
  useEffect(()=>{ playersRef.current = players; }, [players]);

  const turnOrderRef = useRef<string[]>(turnOrder ?? []);
  useEffect(()=>{ turnOrderRef.current = turnOrder ?? []; }, [turnOrder]);

  const activePlayerIdRef = useRef<string|null>(activePlayerId ?? null);
  useEffect(()=>{ activePlayerIdRef.current = activePlayerId ?? null; }, [activePlayerId]);

  const isEnemyPhaseRef = useRef(isEnemyPhase);
  useEffect(()=>{ isEnemyPhaseRef.current = isEnemyPhase; }, [isEnemyPhase]);

  const enemiesRef = useRef(enemies);
  useEffect(()=>{ enemiesRef.current = enemies; }, [enemies]);

  const tw = useTypewriterQueue();
  // compuerta única de continuación: solo avanza la cola
  const proceed = useCallback(() => {
    if (tw.typing) tw.skipTyping();
    else tw.continueNext(); // NO disparar continuación aquí
  }, [tw.typing, tw.skipTyping, tw.continueNext]);
  const overlayOpen = tw.typing || tw.hasPending;

  useEffect(() => {
    const empty = !tw.hasPending && !tw.typing;
    if (empty && postActionContinueRef.current) {
      const fn = postActionContinueRef.current;
      postActionContinueRef.current = null;
      setControlsLocked(false);
      // microtask para no bloquear el render
      queueMicrotask(() => {
        try { fn(); } catch (e) { console.error(e); }
      });
    }
  }, [tw.hasPending, tw.typing]);

  useEffect(() => {
    const overlayOpen = tw.typing || tw.hasPending;
    if (!overlayOpen || tw.typing || !tw.current) return;
    const len = tw.current.text.length;
    const base = 600, perChar = 25, cap = 2000;
    const ms = Math.min(cap, base + perChar * len);
    const t = setTimeout(proceed, ms);
    return () => clearTimeout(t);
  }, [tw.typing, tw.hasPending, tw.current?.id, proceed]);

  // helper para pushear mensajes al panel y registrarlos en el log
  function pushBattle(text: string, onDone?: () => void){
    const clean = text
      .replace(/\s*\n+\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    tw.push({ text: clean, onDone });
    gameLog(clean);
  }

  function endPlayerActionAwaitEnter(next: () => void) {
    const pid = activePlayerIdRef.current;
    if (pid) {
      setActedThisRound(m => ({ ...(m || {}), [pid]: true }));
    }
    postActionContinueRef.current = next;
    // Si no hay nada que mostrar, continuar ya
    if (!tw.typing && !tw.hasPending) {
      const fn = postActionContinueRef.current;
      postActionContinueRef.current = null;
      setControlsLocked(false);
      queueMicrotask(() => { try { fn?.(); } catch (e) { console.error(e); } });
    } else {
      // Hay mensajes → el efecto de “drain” ejecutará la continuación
      setControlsLocked(true);
    }
  }

  function playerCanActNow(): boolean {
    // No puede actuar en fase de enemigos, ni si hay lock activo, ni si ya actuó
    const pid = activePlayerIdRef.current;
    if (!pid || isEnemyPhaseRef.current) return false;
    if (controlsLocked) return false;
    if (actedThisRoundRef.current?.[pid]) return false;
    return true;
  }

  function finalizeTurnWithEndConditions(next: () => void){
    const apId = activePlayerIdRef.current;
    if (!apId) { next(); return; }
    const ap = (playersRef.current ?? []).find(p => p.id === apId);
    if (!ap) { next(); return; }

    const end = applyEndOfTurnConditions(ap, (msg)=>{ pushBattle?.(msg); });
    if (end.hpDelta || end.newConditions) {
      updatePlayer(ap.id, {
        hp: Math.max(0, ap.hp + (end.hpDelta || 0)),
        conditions: end.newConditions
      });
    }
    next();
  }

  function startPlayerActionOrBlock(): boolean {
    if (!playerCanActNow()) return false;
    // Bloquear inputs mientras se emite el log de resultado de la acción
    setControlsLocked(true);
    return true;
  }

  function endTurnNow(penaltyMs: number = 0) {
    if (!isEnemyPhaseRef.current && activePlayerIdRef.current) {
      setActedThisRound(m => ({ ...(m || {}), [activePlayerIdRef.current as string]: true }));
    }
    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      if (penaltyMs > 0) timePenalty(penaltyMs);
      advanceTurn();
    }));
  }

  const [foundNotes, setFoundNotes] = useState<GameNote[]>([]);
  const [explorationActive, setExplorationActive] = useState<boolean>(false);

  const handleCloseCard = useCallback(() => {
    setCurrentCard(null);
    setExplorationActive(false);
  }, []);

  // Evento con cuenta regresiva
  const [timedEvent, setTimedEvent] = useState<TimedEvent|null>(null);

  // Registro de narrativa
  const [logs, setLogs] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [activeCampTab, setActiveCampTab] = useState<"inv" | "camp" | "rep">("inv");
  const gameLogRef = useRef<HTMLElement | null>(null);

  const pushLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, msg].slice(-200));
  }, []);

  const pushNotification = useCallback((msg: string) => {
    setNotifications(prev => [...prev, msg].slice(-50));
  }, []);

  const handleQuickEquip = useCallback(
    (playerId: string, weaponId: string) => {
      const resolvedId = resolveWeaponId(weaponId);
      if (!WEAPONS[resolvedId]) return;
      setPlayers(list =>
        list.map(p => {
          if (p.id !== playerId) return p;
          const updated = equipWeapon(p, resolvedId);
          if (updated === p && (p.equippedWeaponId ?? p.currentWeaponId ?? p.selectedWeaponId) !== resolvedId) {
            return p;
          }
          return {
            ...updated,
            equippedWeaponId: resolvedId,
            currentWeaponId: resolvedId,
            selectedWeaponId: resolvedId,
          };
        }),
      );
    },
    [setPlayers],
  );

  // Registrar logger global
  useEffect(() => {
    registerLogger(pushLog);
    registerTimeProvider(() => formatTime(clockMsRef.current));
  }, [pushLog]);

  useEffect(() => {
    if (state === "playing" || state === "paused") {
      initLogger();
    }
  }, [state]);

  useEffect(() => {
    clockMsRef.current = clockMs;
  }, [clockMs]);

  // Cita visible

  const alivePlayers = players.filter(p => p.status !== "dead");
  const aliveEnemies = enemies;
  const turn = useTurn();
  const isCombat = turn.phase !== "out_of_combat";
  const combatActorId = isCombat ? turn.currentActorId() : null;
  const activePlayer = isCombat
    ? turn.players.find(p => p.id === combatActorId) ?? null
    : players.find(p => p.id === (activePlayerId ?? "")) ?? null;
  useEffect(() => {
    setActivePlayerCompat(activePlayer);
  }, [activePlayer?.id]);
  const activeDown = !!activePlayer && activePlayer.hp <= 0;
  const canAttackWithSelected = (() => {
    const p = activePlayer;
    if (!p) return false;
    const w = getEquippedWeapon(p);
    if (w.type === 'firearm') {
      return getMagazineCount(p, w.id) > 0;
    }
    return true;
  })();

  const activePlayerState = activePlayer
    ? players.find(pl => pl.id === activePlayer.id) ?? activePlayer
    : null;

  const weaponOptions = useMemo(() => {
    if (!activePlayerState) return [] as { id: string; label: string; usable: boolean }[];
    try {
      const opts = getAvailableWeapons(activePlayerState) ?? [];
      const dmg = (weaponId: string) => {
        const weapon = WEAPONS[weaponId];
        const dice = weapon?.damage;
        if (!dice) return "--";
        const min = dice.times * 1 + (dice.mod ?? 0);
        const max = dice.times * dice.faces + (dice.mod ?? 0);
        return `${min}-${max}`;
      };
      const mapped = opts.map((opt: any) => {
        const resolvedId = resolveWeaponId(opt.id);
        const weapon = WEAPONS[resolvedId];
        const fallbackName = weapon?.name ?? opt.name ?? resolvedId;
        const label = opt.label ?? `${fallbackName} · ${dmg(resolvedId)}`;
        return {
          id: resolvedId,
          label,
          usable: opt.usable !== false,
        };
      });
      if (!mapped.length) {
        return [{ id: "fists", label: "Puños", usable: true }];
      }
      return mapped;
    } catch {
      return [] as { id: string; label: string; usable: boolean }[];
    }
  }, [activePlayerState, players]);

  const equippedWeapon = activePlayerState ? getEquippedWeapon(activePlayerState) : null;
  const currentWeaponId = activePlayerState
    ? resolveWeaponId(
        equippedWeapon?.id ??
        activePlayerState.currentWeaponId ??
        activePlayerState.selectedWeaponId ??
        "fists",
      )
    : "";

  const canEatOutOfCombat = !isCombat && !isEnemyPhase && !!activePlayerState && (resources?.food ?? 0) > 0;
  const canHealOutOfCombat =
    !isCombat &&
    !!activePlayerState &&
    activePlayerState.hp < activePlayerState.hpMax &&
    (resources?.medicine ?? 0) > 0;
  const canEndTurnAction = !isEnemyPhase && !!activePlayerState;
  const combatActive = currentCard?.type === "combat" && isCombat;
  const timeProgressValue = progressPercent(clockMs);
  const clockLabel = formatTime(clockMs);
  const phaseIcon = phase === "dawn" ? "🌅" : phase === "day" ? "☀️" : phase === "dusk" ? "🌆" : "🌙";
  const handlePauseToggle = useCallback(() => {
    if (state === "paused") {
      setState("playing");
      setTimeRunning(true);
      return;
    }
    if (timeRunning) {
      setTimeRunning(false);
      setState("paused");
    } else {
      setState("playing");
      setTimeRunning(true);
    }
  }, [state, timeRunning]);

  useEffect(() => {
    if (!activePlayer) return;
    const statePlayer = players.find(pl => pl.id === activePlayer.id) ?? activePlayer;
    const w = getSelectedWeapon(statePlayer);
    if (isRangedWeapon(w) && getLoadedAmmo(statePlayer, w.id) <= 0) {
      const opts = getAvailableWeapons(statePlayer);
      const hasKnife = !!opts.find(o => o.id === "knife");
      const fallback = hasKnife ? "knife" : "fists";
      const cur = statePlayer.currentWeaponId ?? statePlayer.selectedWeaponId ?? "fists";
      const equippedId = statePlayer.equippedWeaponId ?? cur;
      if (cur !== fallback || equippedId !== fallback) {
        setPlayers(list =>
          list.map(pl => {
            if (pl.id !== statePlayer.id) return pl;
            const updated = equipWeapon(pl, fallback);
            return {
              ...updated,
              currentWeaponId: fallback,
              selectedWeaponId: fallback,
            };
          }),
        );
        const currentName = w?.name ?? w?.id ?? "arma actual";
        const fallbackName = WEAPONS[fallback]?.name ?? fallback;
        pushBattle(`⚠️ Sin munición en ${currentName}. Cambias automáticamente a ${fallbackName}.`);
      }
    }
  }, [activePlayer, players]);

  useEffect(() => {
    setDecisionDeck(shuffle(mapDecisionCards(getDecisionDeckForDay(day))));
    setExplorationDeck(shuffle(getExplorationDeckForDay(day)));
  }, [day]);

  useEffect(() => {
    if (isEnemyPhase) return;
    const alive = players.filter(p => p.status !== "dead");
    setActedThisRound(() => {
      const flags: Record<string, boolean> = {};
      alive.forEach(p => { flags[p.id] = false; });
      return flags;
    });
    if (!activePlayerId && alive.length > 0) {
      setActivePlayerId(alive[0].id);
    } else if (activePlayerId && !alive.some(p => p.id === activePlayerId)) {
      setActivePlayerId(alive[0]?.id ?? null);
    }
  }, [players, isEnemyPhase]);

  useEffect(()=>{
    const t = setInterval(()=>{
      const now = Date.now();
      const ps = playersRef.current ?? [];
      for (const p of ps){
        const inf = p.conditions?.infected;
        if (inf?.expiresAtMs && now >= inf.expiresAtMs && p.hp > 0){
          updatePlayer(p.id, { hp: 0, conditions: removeCondition(p.conditions,'infected') });
          setMorale(m => Math.max(0, Math.round(m * 0.70)));
          setInfectionDead({ id: p.id, name: p.name });
          break;
        }
      }
    }, 1000);
    return ()=>clearInterval(t);
  }, []);

  // Reloj del día
  useEffect(()=>{
    if(state!=="playing") return;
    const id = window.setInterval(()=>{
      if(!timeRunning) return;
      setClockMs(ms=>{
        const next = ms - 1000;
        if(next <= 0){ endOfDay('timer'); return DAY_LENGTH_MS; }
        return next;
      });
    }, 1000);
    return ()=> clearInterval(id);
  }, [state, timeRunning]);

  // Resolver eventos con countdown
  const nowRef = useRef<number>(Date.now());
  useEffect(()=>{
    const id = window.setInterval(()=>{
      nowRef.current = Date.now();
      if(timedEvent){
        const elapsed = nowRef.current - timedEvent.startedAt;
        if(elapsed >= timedEvent.durationMs){
          gameLog(`⏳ El evento "${timedEvent.name}" venció y se resuelve automáticamente.`);
          timedEvent.onExpire();
          setTimedEvent(null);
        }
      }
    }, 500);
    return ()=> clearInterval(id);
  }, [timedEvent]);

  // Reglas de fin de partida por moral
  useEffect(()=>{
    if(morale <= 0 && state==="playing"){
      gameLog("💀 La moral llegó a 0%. El grupo pierde la voluntad de vivir.");
      setState("gameover");
    }
  }, [morale, state]);

  function mkPlayer(name:string, profession:string): Player{
    const attrs: Attributes = { Fuerza: 12, Destreza: 12, Constitucion: 13, Inteligencia: 11, Carisma: 11 };
    const hpMax = attrs.Constitucion*2 + 5;
    return {
      id: uid(),
      name, profession,
      hp: hpMax, hpMax,
      energy: 10, energyMax: 10,
      defense: 10 + mod(attrs.Destreza),
      status: "ok",
      inventory: ["Navaja"],
      conditions: {},
      attrs,
      selectedWeaponId: 'fists',
      currentWeaponId: 'fists',
      equippedWeaponId: 'fists',
      ammoByWeapon: {},
      backpackCapacity: 8,
    };
  }

  function start(){
    setState("playing");
    setLogs([]);
    setFoundNotes([]);
    setExplorationActive(false);
    gameLog(`📝 Día ${day}: El mundo ya no es el mismo.`);
  }

  function logMsg(s:string){
    if (typeof pushBattle === "function") pushBattle(s);
    else gameLog(s);
  }

  function formatTime(ms:number){
    let total = Math.max(0, ms/1000|0);
    const h = (total/3600|0).toString().padStart(2,"0");
    total %= 3600;
    const m = (total/60|0).toString().padStart(2,"0");
    return `${h}:${m}`;
  }

  function progressPercent(ms:number){
    return clamp(100 - (ms/DAY_LENGTH_MS)*100, 0, 100);
  }

  function makeDaySummaryLines(): string[] {
    const lines: string[] = [];
    lines.push("— RESUMEN DEL DÍA —");
    lines.push(`Decisiones tomadas: ${stats.decisions ?? 0}`);
    lines.push(`Exploraciones realizadas: ${stats.explorations ?? 0}`);
    lines.push(`Enfrentamientos: ${stats.battles ?? 0}`);
    lines.push(`Enemigos abatidos: ${stats.kills ?? 0}`);
    lines.push(`Cambios de recursos — Comida:${resources.food ?? 0} Agua:${resources.water ?? 0} Med:${resources.medicine ?? 0}`);
    return lines;
  }

  function nextPhase(ph:Phase): Phase {
    if(ph==="dawn") return "day";
    if(ph==="day") return "dusk";
    if(ph==="dusk") return "night";
    return "dawn";
  }

  function nextDay(force:boolean=false){
    // Si no es de noche y no es forzado, avanzamos a la siguiente fase
    if(phase!=="night" && !force){
      const newPhase = nextPhase(phase);
      setPhase(newPhase);
    gameLog(phaseChangeText(newPhase));
      // efectos por fase
      if(newPhase==="night"){
        setThreat(t=>t+8);
        gameLog("🌙 La noche incrementa el peligro. (+Amenaza)");
      }else if(newPhase==="dawn"){
        setThreat(t=>Math.max(10, t-4));
        setMorale(m=>clamp(m+2,0,100));
      }
      return;
    }

    // Pasar la noche o fin de día
    const newDay = day+1;
    setDay(newDay);
    setPhase("dawn");
    setClockMs(DAY_LENGTH_MS);
    gameLog(`📅 Comienza el Día ${newDay}.`);

    // Resolución nocturna
    nightResolution();
    // Recuperación ligera
    setPlayers(ps=>ps.map(p => p.status!=="dead"
      ? withEnergy(p, (p.energy ?? 0) + 1)
      : p
    ));
    // Consumo base
    const alive = players.filter(p=>p.status!=="dead").length;
    setResources(r => ({
      ...r,
      food: Math.max(0, r.food - alive),
      water: Math.max(0, r.water - alive),
    }));
    if(resources.food <= 0){
      setMorale(m=>clamp(m-8,0,100));
      gameLog("⚠️ Hambre en el campamento mina la moral.");
    }
    if(resources.water <= 0){
      setMorale(m=>clamp(m-10,0,100));
      gameLog("⚠️ Falta de agua provoca disputas y enfermedad.");
    }
  }

  function phaseChangeText(ph:Phase){
    const map = {
      dawn: "🌅 Amanecer: esperanza tenue.",
      day: "☀️ Pleno día: se revelan peligros y oportunidades.",
      dusk: "🌆 Atardecer: sombras que se alargan.",
      night: "🌙 Noche: los muertos se mueven con hambre."
    } as Record<Phase,string>;
    return map[ph];
  }

  function passNight(){
    gameLog("⏭️ Deciden aguantar hasta el amanecer...");
    endOfDay('manual');
  }

  function endOfDay(reason:'deck'|'timer'|'manual'='manual'){
    if(day===1 || day===2){
      setDayEndLines(makeDaySummaryLines());
      setShowDayEnd(true);
      setControlsLocked(true);
      setTimeRunning(false);
      return;
    }
    setDiscardDecision([]);
    if(reason==='deck') gameLog("El mazo se agotó. La jornada termina y el grupo descansa.");

    if(phase !== 'night'){
      setThreat(t=>t+10);
      gameLog("La noche cae. La amenaza aumenta.");
      setPhase('night');
    }

    const upcoming = day + 1;
    nextDay(true);
    gameLog(`=== DÍA ${upcoming} COMIENZA (${reason === 'deck' ? 'mazo agotado' : reason === 'timer' ? 'fin del tiempo' : 'continuación'}) ===`);
    setMorale(m=>clamp(m+3,0,100));
  }

  // ——— Decks ———
  function drawDecision(){
    let deck = [...decisionDeck];
    if(deck.length===0 && discardDecision.length>0){
      deck = shuffle(discardDecision);
      setDiscardDecision([]);
    }
    if(deck.length===0){ endOfDay('deck'); return; }
    const card = deck[0];
    setDecisionDeck(deck.slice(1));
    setCurrentCard(card);
  }
  function drawCombat(){
    let deck = [...combatDeck];
    if(deck.length===0 && discardCombat.length>0){
      deck = shuffle(discardCombat);
      setDiscardCombat([]);
    }
    if(deck.length===0){ gameLog("No quedan cartas de combate."); return; }
    const card = deck[0];
    setCombatDeck(deck.slice(1));
    setCurrentCard(card);
    // activar enemigos según dificultad (simple)
    const count = Math.max(1, Math.floor((card.difficulty||12)/6));
    const spawned = Array.from({length: count}, ()=>cloneEnemy(baseEnemies[Math.floor(Math.random()*baseEnemies.length)]));
    setEnemies(spawned);
    gameLog(`⚔️ ¡Encuentro! (${spawned.length} enemigos)`);
  }
  function shuffleDecks(){
    setDecisionDeck(shuffle(decisionDeck));
    setCombatDeck(shuffle(combatDeck));
    gameLog("🔀 Barajas los mazos restantes.");
    pushNotification("🔀 Mazos rebarajados.");
  }
  function recycleDiscards(){
    setDecisionDeck(d=>[...d, ...shuffle(discardDecision)]);
    setCombatDeck(d=>[...d, ...shuffle(discardCombat)]);
    setDiscardDecision([]);
    setDiscardCombat([]);
    gameLog("♻️ Reintegras descartes a los mazos.");
    pushNotification("♻️ Descartes reintegrados en los mazos.");
  }

  function resolveChoice(choice: NonNullable<Card["choices"]>[number]){
    if (isEnemyPhase) return;
    if (!activePlayer) return;
    const actor = activePlayer;
    if (actedThisRound[actor.id]) return;
    setStats(s => ({ ...s, decisions: s.decisions + 1 }));
    // aplicar efectos
    const {
      morale: dm,
      threat: dt,
      zombies,
      spawnEnemies: spawnFromEffectCount,
      advanceMs,
      ...res
    } = (choice?.effect ?? {}) as any;
    if (dm) setMorale(m => clamp(m + dm, 0, 100));
    if (dt) setThreat(t => Math.max(0, t + dt));
    const rDelta = res as Partial<Resources>;
    if (Object.keys(rDelta).length) {
      setResources(r => {
        const next = { ...r };
        (Object.keys(rDelta) as (keyof Resources)[]).forEach(k => {
          next[k] = Math.max(0, (r[k] ?? 0) + (rDelta[k] as number));
        });
        return next;
      });
    }

    // Avance de tiempo desde la decisión
    if (typeof advanceMs === 'number' && advanceMs > 0) {
      setClockMs(ms => Math.max(0, ms - advanceMs));
    }

    // Zombis/combate forzado a partir de la carta
    const toSpawn =
      (typeof zombies === 'number' ? zombies : 0) +
      (typeof spawnFromEffectCount === 'number' ? spawnFromEffectCount : 0);

    if (toSpawn > 0) {
      // OJO: esta es la FUNCIÓN del juego, no el campo del effect
      spawnEnemies(toSpawn);
      setBattleStats({ byPlayer: {}, lootNames: [] });
      if (currentCard) {
        // Mantener la carta abierta, pero ya como combate
        setCurrentCard({ ...currentCard, type: "combat" });
      }
      gameLog(`⚔️ Tu decisión provocó un combate (${toSpawn}).`);
    }

    // narrativa
    gameLog(`📖 Decisión tomada: ${choice.text}`);

    // descartar carta o mantener si abre combate
    if (currentCard) {
      if (typeof toSpawn === 'number' && toSpawn > 0) {
        // mantener la carta actual convertida a 'combat'
      } else {
        if (currentCard.type === "decision") setDiscardDecision(d => [currentCard, ...d]);
        else setDiscardCombat(d => [currentCard, ...d]);
        handleCloseCard();
      }
    }
    endTurnNow(ACTION_TIME_COSTS.decision);
  }

  // ——— Combate muy simplificado ———
  function cloneEnemy(e: Enemy): Enemy{ return { ...e, id: uid() }; }
  function spawnEnemies(count:number){
    const spawned = Array.from({length: count}, ()=>cloneEnemy(baseEnemies[Math.floor(Math.random()*baseEnemies.length)]));
    setEnemies(spawned);
    setStats(s => ({ ...s, battles: s.battles + 1 }));
    combatStartedRef.current = true;
  }

  type CounterEffect = 'hit'|'bleeding'|'stunned'|'infected';

  function pickCounterEffect(): CounterEffect {
    const r = Math.random();
    if (r < 0.35) return 'bleeding';
    if (r < 0.55) return 'stunned';
    if (r < 0.70) return 'infected';
    return 'hit';
  }

  function applyDamageToPlayer(playerId:string, dmg:number, enemy:Enemy){
    const p = playersRef.current?.find(x=>x.id===playerId);
    if(!p) return;
    const hp = Math.max(0, p.hp - dmg);
    updatePlayer(playerId, { hp });
    if (hp <= 0) {
      updatePlayer(playerId, { status: "dead" });
      gameLog(`💀 ${p.name} cae para no levantarse jamás.`);
    }
  }

  function applyDamageToEnemy(enemyId: string, dmg: number, actor: Player){
    const enemy = enemiesRef.current?.find(e => e.id === enemyId);
    if (!enemy) return;
    const newHp = enemy.hp - dmg;
    const afterEnemies = (enemiesRef.current ?? []).map(e => e.id === enemyId ? { ...e, hp: newHp } : e).filter(e => e.hp > 0);
    setEnemies(afterEnemies);
    enemiesRef.current = afterEnemies;

    if (newHp <= 0) {
      gameLog(`✅ ${enemy.name} cae hecho trizas.`);
      setThreat(t => Math.max(0, t - 2));
      setStats(s => ({ ...s, kills: s.kills + 1 }));
      const tier = tierByEnemy(enemy);
      if (Math.random() < 0.6) {
        const drop = randomWeaponNameByTier(tier as any);
        const res = tryAddToBackpack(actor.id, drop);
        gameLog(`🧷 ${enemy.name} suelta ${drop}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
        setBattleStats(prev => ({ ...prev, lootNames: [...prev.lootNames, drop] }));
      }
      if (Math.random() < 0.05) {
        const name = "Ampliación de Mochila (+4)";
        const res = tryAddToBackpack(actor.id, name);
        gameLog(`🎁 Encuentras ${name}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
        setBattleStats(prev => ({ ...prev, lootNames: [...prev.lootNames, name] }));
      }
        const ammoDrop = maybeEnemyAmmoDrop();
        if (ammoDrop){
          const bp = [...(actor.inventory ?? []), ammoDrop];
          updatePlayer(actor.id, { inventory: bp });
          gameLog(`${actor.name} encuentra ${ammoDrop.name}.`);
          setBattleStats(prev => ({ ...prev, lootNames: [...prev.lootNames, ammoDrop.name] }));
        }
    }
  }
  function performAttack(enemyId: string){
    if (controlsLocked || isEnemyPhase) return;
    if (!startPlayerActionOrBlock()) return;
    if (!activePlayer) { setControlsLocked(false); return; }
    const actor = activePlayer;
    const enemy = enemies.find(e=>e.id===enemyId);
    if(!enemy){ setControlsLocked(false); return; }

    const w = getEquippedWeapon(actor);
    const flavor = weaponFlavorFrom(w.id, w.name, w.type === 'firearm' ? 'ranged' : 'melee');
    const isRanged = w.type === 'firearm';
    const isMelee = w?.type === "melee";

    if (isRanged && isOutOfAmmoForEquipped(actor)) {
      const line = `${actor.name} intenta disparar ${w.name}, pero no tiene munición cargada.`;
      pushBattle(line);
      endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
        timePenalty(ACTION_TIME_COSTS.battle);
        advanceTurn();
      }));
      return;
    }
    if (isRanged) {
      const { player: updated } = spendAmmo(actor, w.id, 1);
      setPlayers(ps => ps.map(p => p.id === actor.id ? updated : p));
    }

    const atkRoll = roll(1,20, mod(actor.attrs.Fuerza) + (isRanged ? 4 : 0));
    const hit = atkRoll.total >= enemy.def || atkRoll.natural===20;

    touchPlayerStats(actor.id);
    setBattleStats(prev => {
      const bp = prev.byPlayer[actor.id] ?? { meleeHits:0, meleeMisses:0, rangedHits:0, rangedMisses:0, heals:0, points:0 };
      const next = { ...bp };
      if (isRanged) {
        if (hit) next.rangedHits++; else next.rangedMisses++;
      } else {
        if (hit) next.meleeHits++; else next.meleeMisses++;
      }
      next.points = (next.meleeHits + next.rangedHits) * 2 + next.heals * 1;
      return { ...prev, byPlayer: { ...prev.byPlayer, [actor.id]: next } };
    });

    if(!hit){
      const missPool = isRanged ? MISS_RANGED : MISS_MELEE;
      const missLine = render(pick(missPool), { P: actor.name, E: enemy.name, W: w.name });
      pushBattle(missLine);
      setDayStats(s=>({
        ...s,
        misses: s.misses + 1,
        shotsFired: s.shotsFired + (isRanged ? 1 : 0),
      }));
      if (hasCondition(enemy.conditions, 'stunned')) {
        pushBattle(`${enemy.name} intenta reaccionar, pero está aturdido y no contraataca.`);
        endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
          timePenalty(ACTION_TIME_COSTS.battle);
          advanceTurn();
        }));
        return;
      }
      const eff = pickCounterEffect();
      const dmg = Math.floor(1 + Math.random()*10);
      const effText = counterEffectText(eff);

      applyDamageToPlayer(actor.id, dmg, enemy);

      if (eff === 'bleeding') {
        updatePlayer(actor.id, { conditions: addCondition(actor.conditions, { id:'bleeding', persistent:true }) });
      } else if (eff === 'stunned') {
        updatePlayer(actor.id, { conditions: addCondition(actor.conditions, { id:'stunned', turnsLeft:1 }) });
      } else if (eff === 'infected') {
        updatePlayer(actor.id, { conditions: addCondition(actor.conditions, { id:'infected', persistent:true, expiresAtMs: Date.now()+120000 }) });
      }

      const line = renderCounter(
        ENEMY_COUNTER_20[Math.floor(Math.random()*ENEMY_COUNTER_20.length)],
        { A: enemy.name, P: actor.name, D: dmg, EFF: effText }
      );
      pushBattle(line);

      if (eff === 'bleeding') {
        pushBattle(`🩸 Estado aplicado a ${actor.name}: Sangrado. Recomendación: curar antes de que siga perdiendo PV.`);
      } else if (eff === 'stunned') {
        pushBattle(`😵 Estado aplicado a ${actor.name}: Aturdido. Perderá su próximo turno.`);
      } else if (eff === 'infected') {
        pushBattle(`🧪 Estado aplicado a ${actor.name}: Infección. Debe usar medicina antes de 2:00 min.`);
      }

      endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
        timePenalty(ACTION_TIME_COSTS.battle);
        advanceTurn();
      }));
      return;
    }

    if (isMelee) {
      const willStun = Math.random() < MELEE_STUN_CHANCE;
      if (willStun) {
        const stunDmg = Math.floor(MELEE_STUN_DMG_MIN + Math.random() * (MELEE_STUN_DMG_MAX - MELEE_STUN_DMG_MIN + 1));
        const newHp = enemy.hp - stunDmg;
        applyDamageToEnemy(enemy.id, stunDmg, actor);
        openCombatEndIfCleared();
        if (newHp > 0) {
          const prevC = enemy.conditions ?? {};
          const newC = addCondition(prevC, { id: 'stunned', turnsLeft: 1 });
          updateEnemy(enemy.id, { conditions: newC });
        }
        const cost = Math.floor(ENERGY_COST_STUN_MIN + Math.random() * (ENERGY_COST_STUN_MAX - ENERGY_COST_STUN_MIN + 1));
        updatePlayer(actor.id, { energy: Math.max(0, (actor.energy ?? 100) - cost) });
        pushBattle(`💫 ${actor.name} aturde a ${enemy.name} con ${w.name} (−${stunDmg} PV).`);
        pushBattle(`⚡ ${actor.name} gasta ${cost} de energía.`);
        setDayStats(s=>({ ...s, damageDealt: s.damageDealt + stunDmg, shotsFired: s.shotsFired + (isRanged ? 1 : 0) }));
        endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
          timePenalty(ACTION_TIME_COSTS.battle);
          advanceTurn();
        }));
        return;
      } else {
        updatePlayer(actor.id, { energy: Math.max(0, (actor.energy ?? 100) - ENERGY_COST_MELEE_HIT_NO_STUN) });
        pushBattle(`⚡ ${actor.name} gasta ${ENERGY_COST_MELEE_HIT_NO_STUN} de energía.`);
      }
    }
    const dmg = roll(w.damage?.times || 1, w.damage?.faces || 6, (isRanged ? 0 : mod(actor.attrs.Fuerza)) + (w.damage?.mod || 0)).total;
    applyDamageToEnemy(enemy.id, dmg, actor);
    openCombatEndIfCleared();

    const base = render(pick(hitPhraseByFlavor(flavor)), { P: actor.name, E: enemy.name, W: w.name, D: dmg });
    let tails: string[] = [];
    if (w.type === "melee" && flavor === "melee_blade" && Math.random() < 0.28) tails.push(render(pick(TAIL_BLEED), { P: actor.name, E: enemy.name, W: w.name }));
    if (w.type === "melee" && flavor === "melee_blunt" && Math.random() < 0.18) tails.push(render(pick(TAIL_STUN), { P: actor.name, E: enemy.name, W: w.name }));
    if (w.type === "ranged" && Math.random() < 0.08) tails.push(render(pick(TAIL_BLEED), { P: actor.name, E: enemy.name, W: w.name }));
    if (Math.random() < 0.03) tails.push(render(pick(TAIL_INFECT), { P: actor.name, E: enemy.name, W: w.name }));
    const line = (base + (tails.length ? " " + tails.join(" ") : "")).replace(/\s+/g, " ").trim();
    pushBattle(line);

    setDayStats(s=>({
      ...s,
      damageDealt: s.damageDealt + dmg,
      shotsFired: s.shotsFired + (isRanged ? 1 : 0),
    }));

    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      timePenalty(ACTION_TIME_COSTS.battle);
      advanceTurn();
    }));
  }

  function maybeInflictStatusFromEnemyHit(enemy: any, target: Player, dmg: number): string[] {
    const applied: string[] = [];
    if (dmg <= 0) return applied;

    const INFECT_P = 0.28, BLEED_P = 0.22, STUN_P = 0.15;
    let c = target.conditions ?? {};

    if (!hasCondition(c,'infected') && Math.random() < INFECT_P) {
      c = addCondition(c, { id:'infected', persistent:true });
      applied.push("infected");
    }
    if (!hasCondition(c,'bleeding') && Math.random() < BLEED_P) {
      const t = 2 + Math.floor(Math.random()*2);
      c = addCondition(c, { id:'bleeding', turnsLeft:t, intensity:1 });
      applied.push("bleeding");
    }
    if (!hasCondition(c,'stunned') && Math.random() < STUN_P) {
      const t = 1 + Math.floor(Math.random()*2);
      c = addCondition(c, { id:'stunned', turnsLeft:t });
      applied.push("stunned");
    }
    updatePlayer(target.id, { conditions: c });
    return applied;
  }

  function runEnemyTurnRound(idx = 0) {
    setEnemyIdx(idx);
    const enemy = aliveEnemies[idx];
    if (!enemy) {
      // No hay enemigo en idx -> terminar fase enemigos
      finishEnemyPhase();
      return;
    }

    // El enemigo intenta golpear a cada jugador vivo (1 golpe por jugador)
    for (const target of alivePlayers) {
      const atkRoll = roll(1,20, 2);
      if (atkRoll.total >= target.defense) {
        const dmg = roll(1,6,2).total;
        updatePlayer(target.id, { hp: Math.max(0, target.hp - dmg) });
        let line = `${enemy.name} golpea a ${target.name} (−${dmg}).`;
        const applied = maybeInflictStatusFromEnemyHit(enemy, target, dmg);
        if (applied.includes("bleeding")) line += " Deja sangrando al objetivo.";
        if (applied.includes("stunned"))  line += " El objetivo queda aturdido.";
        if (applied.includes("infected")) line += " Posible infección en el objetivo.";
        line = line.replace(/\s+/g," ").trim();
        pushBattle(line);
        if (target.hp - dmg <= 0) {
          updatePlayer(target.id, { status: "dead" });
          pushBattle(`💀 ${target.name} cae para no levantarse jamás.`);
        }
      } else {
        const missLine = `${enemy.name} falla al atacar a ${target.name}.`;
        pushBattle(missLine);
      }
    }

    pushBattle(`El enemigo ${enemy.name} ha terminado su turno`, () => {
      const nextEnemyIdx = idx + 1;
      if (nextEnemyIdx < aliveEnemies.length) {
        runEnemyTurnRound(nextEnemyIdx);
      } else {
        finishEnemyPhase();
      }
    });
  }

  
function finishEnemyPhase() {
  // Registrar fin de fase
  pushBattle?.("El enemigo ha terminado su turno.");

  if ((enemiesRef.current ?? []).every(e => e.hp <= 0)) {
    openCombatEndIfCleared();
    return;
  }

  // ➊ NUEVO: los enemigos aturdidos "despiertan" al iniciar la nueva ronda
  decayEnemyStunsOneRoundWithLog();

  // Resetear banderas de turno de jugadores vivos
  const alive = (playersRef.current ?? []).filter(p => p.hp > 0);
  setActedThisRound(() => {
    const flags: Record<string, boolean> = {};
    alive.forEach(p => { flags[p.id] = false; });
    return flags;
  });

  // Salir de la fase de enemigos
  setIsEnemyPhase(false);

  // Entregar turno al primer jugador vivo según el orden
  const order = (turnOrderRef.current?.length ? turnOrderRef.current : alive.map(p => p.id));
  const firstId = order.find(pid => alive.some(p => p.id === pid)) ?? (alive[0]?.id ?? null);
  setActivePlayerId(firstId ?? null);

  if (firstId) {
    const pl = alive.find(p => p.id === firstId)!;
    const start = applyStartOfTurnConditions(pl, (msg)=>{ pushBattle?.(msg); });
    if (start.newConditions) updatePlayer(pl.id, { conditions: start.newConditions });
    if (start.hpDelta) {
      const hp = clamp(pl.hp + start.hpDelta, 0, pl.hpMax);
      updatePlayer(pl.id, { hp, ...(hp<=0 ? { status:"dead" } : {}) });
      if (hp <= 0) {
        gameLog(`💀 ${pl.name} cae para no levantarse jamás.`);
        setActedThisRound(m => ({ ...(m || {}), [pl.id]: true }));
        requestAnimationFrame(() => advanceTurn());
        return;
      }
    }
    if (start.skipAction) {
      activePlayerIdRef.current = pl.id;
      finalizeTurnWithEndConditions(() => {
        setActedThisRound(m => ({ ...(m || {}), [pl.id]: true }));
        requestAnimationFrame(() => advanceTurn());
      });
      return;
    }
    pushBattle?.(`— Turno de ${pl.name} —`);
  }
}


  function defend(){
    if (controlsLocked || isEnemyPhase) return;
    if (!startPlayerActionOrBlock()) return;
    if (!activePlayer) { setControlsLocked(false); return; }
    const actor = activePlayer;
    updatePlayer(actor.id, { defense: actor.defense + 3 });
    pushBattle(`${actor.name} se cubre entre los escombros (+DEF temporal).`);
    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      timePenalty(ACTION_TIME_COSTS.defend);
      advanceTurn();
    }));
  }

  function healSelf(){
    if (controlsLocked || isEnemyPhase) return;
    if (!activePlayer) return;
    const actor = activePlayer;
    if (!startPlayerActionOrBlock()) return;
    const p = actor;
    const isInf = hasCondition(p.conditions,'infected');
    const isBle = hasCondition(p.conditions,'bleeding');

    if (actor.hp >= actor.hpMax && !isInf && !isBle) {
      pushBattle("PV al máximo");
      endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
        timePenalty(ACTION_TIME_COSTS.heal);
        advanceTurn();
      }));
      return;
    }

    let state: any = { players, camp: { stash, resources } };

    if (isInf) {
      let med: any = p.inventory?.find((it: any) => it.type === 'med');
      if (!med && (resources.medicine ?? 0) <= 0) {
        pushBattle(`${p.name} necesita medicina para curar la infección.`);
        endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
          timePenalty(ACTION_TIME_COSTS.heal);
          advanceTurn();
        }));
        return;
      }
      const prevHp = p.hp;
      if (!med) {
        state = materializeMedFromStock(state, 1, 'medicine');
        const newItemId = state.camp.stash[state.camp.stash.length - 1].id;
        state = moveFromStashToPlayer(state, p.id, newItemId);
        med = { id: newItemId };
      }
      state = consumeMed(state, p.id, med.id);
      const updated = state.players.find((pl: any) => pl.id === p.id);
      const playersNext = state.players.map((pl: any) =>
        pl.id === p.id ? { ...updated, hp: prevHp, conditions: removeCondition(updated.conditions,'infected') } : pl
      );
      state = { ...state, players: playersNext };
      setPlayers(state.players);
      setStash(state.camp.stash);
      setResources(state.camp.resources);
      pushBattle(`${p.name} usa medicina y supera la infección.`);
      endPlayerActionAwaitEnter(()=> finalizeTurnWithEndConditions(() => {
        timePenalty(ACTION_TIME_COSTS.heal);
        advanceTurn();
      }));
      return;
    }

    if (isBle) {
      updatePlayer(p.id, { conditions: removeCondition(p.conditions,'bleeding') });
      pushBattle(`${p.name} detiene la hemorragia y se estabiliza.`);
      endPlayerActionAwaitEnter(()=> finalizeTurnWithEndConditions(() => {
        timePenalty(ACTION_TIME_COSTS.heal);
        advanceTurn();
      }));
      return;
    }

    let med: any = p.inventory?.find((it: any) => it.type === 'med');
    if (!med && (resources.medicine ?? 0) <= 0) {
      pushBattle(`Sin medicina suficiente.`);
      endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
        timePenalty(ACTION_TIME_COSTS.heal);
        advanceTurn();
      }));
      return;
    }

    const prevHp = p.hp;
    if (!med) {
      state = materializeMedFromStock(state, 1, 'medicine');
      const newItemId = state.camp.stash[state.camp.stash.length - 1].id;
      state = moveFromStashToPlayer(state, p.id, newItemId);
      med = { id: newItemId };
    }
    state = consumeMed(state, p.id, med.id);
    const updated = state.players.find((pl: any) => pl.id === p.id);
    const healAmt = (updated?.hp ?? 0) - prevHp;
    setPlayers(state.players);
    setStash(state.camp.stash);
    setResources(state.camp.resources);
    pushBattle(render(pick(HEAL_LINES), { P: actor.name, V: healAmt }));
    touchPlayerStats(actor.id);
    setBattleStats(prev => {
      const bp = prev.byPlayer[actor.id] ?? { meleeHits:0, meleeMisses:0, rangedHits:0, rangedMisses:0, heals:0, points:0 };
      const next = { ...bp, heals: bp.heals + 1 };
      next.points = (next.meleeHits + next.rangedHits) * 2 + next.heals * 1;
      return { ...prev, byPlayer: { ...prev.byPlayer, [actor.id]: next } };
    });
    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      timePenalty(ACTION_TIME_COSTS.heal);
      advanceTurn();
    }));
  }

  function flee(){
    if (controlsLocked || isEnemyPhase) return;
    if (enemies.length===0) return;
    if (!activePlayer) return;
    const actor = activePlayer;
    if (!startPlayerActionOrBlock()) return;
    const fr = roll(1,20, mod(actor.attrs.Destreza));
    pushBattle(render(pick(FLEE_LINES), { P: actor.name }));
    const tookHit = Math.random() < 0.3;
    if(fr.total>=15){
      gameLog("🏃 Huyen por pasillos colapsados. ¡Escape exitoso!");
      pushBattle(`${actor.name} ha escapado.`);
      setEnemies([]);
      handleCloseCard();
      setMorale(m=>clamp(m-3,0,100));
    } else {
      gameLog("⚠️ El escape falla, te rodean por un momento.");
      pushBattle(`${actor.name} no logra escapar.`);
    }
    if(tookHit){
      updatePlayer(actor.id, { hp: Math.max(0, actor.hp - 5) });
      gameLog(`💥 ${actor.name} sufre rasguños al huir (-5 PV).`);
    }
    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      timePenalty(ACTION_TIME_COSTS.flee);
      advanceTurn();
    }));
  }

  function grantCombatRewards() {
    setResources(r => ({
      ...r,
      food:(r.food??0)+1, water:(r.water??0)+1, medicine:(r.medicine??0)+1,
      fuel:(r.fuel??0)+1, ammo:(r.ammo??0)+1, materials:(r.materials??0)+1,
    }));
  }
  function handleCombatEnd() {
    combatStartedRef.current = false;
    grantCombatRewards();
    setBattleStats({ byPlayer: {}, lootNames: [] });

    if (currentCard?.type === "combat") {
      setDiscardCombat(d => currentCard ? [currentCard, ...d] : d);
      handleCloseCard();
    }

    if (isEnemyPhaseRef.current) {
      setIsEnemyPhase(false);
    }

    const alive = (playersRef.current ?? []).filter(p => p.hp > 0);
    const order = (turnOrderRef.current?.length ? turnOrderRef.current : alive.map(p => p.id));
    const firstId = order.find(pid => alive.some(p => p.id === pid)) ?? (alive[0]?.id ?? null);
    setActedThisRound(() => {
      const flags: Record<string, boolean> = {};
      alive.forEach(p => flags[p.id] = false);
      return flags;
    });
    setActivePlayerId(firstId ?? null);
    setControlsLocked(false);
  }

  function openCombatEndIfCleared() {
    if (!combatStartedRef.current) return;
    const aliveEnemies = (enemiesRef.current ?? []).filter(e => e.hp > 0);
    const inCombat = currentCard?.type === "combat" || isEnemyPhaseRef.current;
    if (inCombat && aliveEnemies.length === 0) {
      handleCombatEnd();
    }
  }

  function alivePlayersList() {
    return (playersRef.current ?? []).filter(p => p.hp > 0);
  }

  function nextUnactedPlayerId(currentId: string | null) {
    const alive = alivePlayersList();
    if (alive.length === 0) return null;

    const order = (turnOrderRef.current?.length ? turnOrderRef.current : alive.map(p => p.id));
    const acted = actedThisRoundRef.current;

    const startIdx = currentId ? Math.max(0, order.indexOf(currentId)) : -1;
    for (let step = 1; step <= order.length; step++) {
      const idx = (startIdx + step) % order.length;
      const pid = order[idx];
      const p = alive.find(ap => ap.id === pid);
      if (p && !acted[pid]) return pid;
    }
    return null;
  }

  function allPlayersActedThisRound() {
    const alive = alivePlayersList();
    const acted = actedThisRoundRef.current;
    return alive.length > 0 && alive.every(p => acted[p.id]);
  }

  
function advanceTurn() {
  // No reasignar jugadores si estamos en fase de enemigos
  if (isEnemyPhaseRef.current) return;

  const currentId = activePlayerIdRef.current ?? null;

  // 0) Asegurar marca de "ya actuó" para el jugador activo si no está marcada
  if (currentId) {
    setActedThisRound(prev => {
      if (prev && prev[currentId]) return prev;
      return { ...(prev || {}), [currentId]: true };
    });
  }

  // Calculamos localmente si todos actuaron (usando la marca anterior)
  const aliveNow = (playersRef.current ?? []).filter(p => p.hp > 0);
  const order = (turnOrderRef.current?.length ? turnOrderRef.current : aliveNow.map(p => p.id));
  let localActed = { ...(actedThisRoundRef.current || {}) };
  if (currentId) localActed[currentId] = true;
  const everyoneActed = aliveNow.length > 0 && aliveNow.every(p => !!localActed[p.id]);

  // 1) Si todos actuaron -> fase enemigos (salvo modo contraataque)
  if (everyoneActed) {
    if (!USE_COUNTERATTACK_MODE) {
      setIsEnemyPhase(true);
      setActivePlayerId(null);
      pushBattle?.("Prepárate: enemigos al ataque.");
      pushBattle?.("— Fase de Enemigos —");
      runEnemyTurnRound();
      return;
    } else {
      setActedThisRound(() => {
        const flags: Record<string, boolean> = {};
        aliveNow.forEach(p => { flags[p.id] = false; });
        return flags;
      });
      decayEnemyStunsOneRoundWithLog();
      localActed = {};
    }
  }

  // 2) Buscar siguiente jugador vivo que no haya actuado
  const startIdx = currentId ? Math.max(0, order.indexOf(currentId)) : -1;
  let nextId: string | null = null;
  for (let step = 1; step <= order.length; step++) {
    const idx = (startIdx + step) % order.length;
    const pid = order[idx];
    const p = aliveNow.find(ap => ap.id === pid);
    if (p && !localActed[pid]) { nextId = pid; break; }
  }
  if (!nextId) {
    // fallback defensivo
    setIsEnemyPhase(true);
    setActivePlayerId(null);
    pushBattle?.("Prepárate: enemigos al ataque.");
    pushBattle?.("— Fase de Enemigos —");
    runEnemyTurnRound();
    return;
  }

  // 3) Activar turno del siguiente jugador y aplicar condiciones de inicio
  setActivePlayerId(prev => prev === nextId ? prev : nextId);
  const pl = aliveNow.find(p => p.id === nextId);
  if (pl) {
    const start = applyStartOfTurnConditions(pl, (msg)=>{ pushBattle?.(msg); });
    if (start.newConditions) updatePlayer(pl.id, { conditions: start.newConditions });
    if (start.hpDelta) {
      const hp = clamp(pl.hp + start.hpDelta, 0, pl.hpMax);
      updatePlayer(pl.id, { hp, ...(hp<=0 ? { status:"dead" } : {}) });
      if (hp <= 0) {
        gameLog(`💀 ${pl.name} cae para no levantarse jamás.`);
        requestAnimationFrame(() => advanceTurn());
        return;
      }
    }
    if (start.skipAction) {
      setActedThisRound(m => ({ ...(m || {}), [pl.id]: true }));
      requestAnimationFrame(() => advanceTurn());
      return;
    }
    pushBattle?.(`— Turno de ${pl.name} —`);
  }
}


  function updatePlayer(id:string, patch: Partial<Player>){
    setPlayers(ps=> ps.map(p => p.id===id ? {...p, ...patch} : p));
  }

  function updateEnemy(enemyId: string, patch: Partial<Enemy>) {
    setEnemies(arr => arr.map(e => e.id === enemyId ? { ...e, ...patch } : e));
  }

  // Reduce en 1 la duración de "stunned" de cada enemigo al inicio de una nueva ronda de jugadores.
  // Si un enemigo deja de estar aturdido (y sigue vivo), lo registramos en el log.
  function decayEnemyStunsOneRoundWithLog() {
    const prev = enemiesRef.current ?? [];
    const next = prev.map(e => {
      const st = e.conditions?.stunned;
      if (!st) return e;
      const tl = typeof st.turnsLeft === 'number' ? st.turnsLeft - 1 : 0;
      if (tl <= 0) {
        const nc = { ...(e.conditions ?? {}) };
        delete nc.stunned;
        return { ...e, conditions: nc };
      }
      return { ...e, conditions: { ...(e.conditions ?? {}), stunned: { ...st, turnsLeft: tl } } };
    });

    // Log de "se despierta" para quienes lo perdieron y siguen vivos
    const woke: string[] = [];
    for (let i = 0; i < prev.length; i++) {
      const wasStunned = !!prev[i].conditions?.stunned;
      const nowStunned = !!next[i].conditions?.stunned;
      if (wasStunned && !nowStunned && (next[i].hp ?? 1) > 0) {
        woke.push(next[i].name);
      }
    }

    setEnemies(next);

    if (woke.length) {
      woke.forEach(n => {
        const line = `💤 ${n} se sacude y recupera el sentido.`;
        pushBattle?.(line);
        gameLog(line);
      });
    }
  }

  function getItemById(id?: string) {
    return ITEMS_CATALOG.find(it => it.id === id);
  }

  function discoverRandomNote(prob = 0.2) {
    if (Math.random() > prob) return;
    const undiscovered = GAME_NOTES.filter(n => !foundNotes.some(f => f.id === n.id));
    if (undiscovered.length === 0) return;
    const note = undiscovered[Math.floor(Math.random() * undiscovered.length)];
    setFoundNotes(prev => [...prev, note]);
    gameLog(`Encuentras una nota: “${note.title}”${note.hintLocation ? ` (pista: ${note.hintLocation})` : ''}`);
  }

  function followNote(noteId: number) {
    const note = foundNotes.find(n => n.id === noteId);
    if (!note || note.resolved) return;

    if (note.leadType === 'combat') {
      const base = note.leadDifficulty ?? 1;
      const count = base + Math.floor(Math.random() * 2);
      spawnEnemies(count);
      setBattleStats({ byPlayer: {}, lootNames: [] });
      setCurrentCard({ id: uid(), type: 'combat', title: 'Sigues la pista', text: 'Un peligro acecha.' });
      setExplorationActive(true);
      gameLog(`Sigues la pista hacia ${note.hintLocation ?? 'un lugar incierto'}: ¡${count} enemigos!`);
    } else if (note.leadType === 'cache') {
      const r = note.rewards || {};
      setResources(prev => ({
        ...prev,
        food: (prev.food || 0) + (r.food || 0),
        water: (prev.water || 0) + (r.water || 0),
        materials: (prev.materials || 0) + (r.materials || 0),
        ammo: (prev.ammo || 0) + (r.ammo || 0),
        medicine: (prev.medicine || 0) + (r.medicine || 0),
        fuel: (prev.fuel || 0) + (r.fuel || 0),
      }));
      if (r.itemId) {
        const vivos = players.filter(p => p.status !== 'dead');
        if (vivos.length > 0) {
          const pick = vivos[Math.floor(Math.random() * vivos.length)];
          const idx = players.findIndex(p => p.id === pick.id);
          const item = getItemById(r.itemId);
          if (item) updatePlayer(pick.id, { inventory: [...players[idx].inventory, item.name] });
        }
      }
      setFoundNotes(prev => prev.map(n => n.id === noteId ? { ...n, resolved: true } : n));
      gameLog(`Sigues la pista: ${note.hintLocation ?? 'ubicación secreta'} — caché encontrado.`);
    } else {
      gameLog("Esta nota no contiene pista accionable.");
    }
  }

  useEffect(() => {
    if (explorationActive && enemies.length === 0 && !currentCard) {
      setExplorationActive(false);
      gameLog("Evento de exploración resuelto.");
    }
  }, [enemies.length, currentCard, explorationActive]);

  // ——— Acciones fuera de combate ———
  function exploreArea(){
    if(explorationActive){
      gameLog("Ya hay una exploración/evento activo. Resuélvelo primero.");
      return;
    }
    setExplorationActive(true);
    setStats(s => ({ ...s, explorations: s.explorations + 1 }));

    if(explorationDeck.length > 0){
      const [card, ...rest] = explorationDeck;
      setExplorationDeck(rest);
      if(card.advanceMs) timePenalty(card.advanceMs/1000);
      else timePenalty(ACTION_TIME_COSTS.explore);
      if(card.loot){
        const r = card.loot;
        setResources(prev => ({
          ...prev,
          food: (prev.food || 0) + (r.food || 0),
          water: (prev.water || 0) + (r.water || 0),
          materials: (prev.materials || 0) + (r.materials || 0),
          ammo: (prev.ammo || 0) + (r.ammo || 0),
          medicine: (prev.medicine || 0) + (r.medicine || 0),
          fuel: (prev.fuel || 0) + (r.fuel || 0),
        }));
      }
      if(card.threat) setThreat(t=>Math.max(0, t + card.threat));
      if(card.zombies && card.zombies>0){
        spawnEnemies(card.zombies);
        setBattleStats({ byPlayer: {}, lootNames: [] });
        setCurrentCard({ id: uid(), type: "combat", title: card.title, text: card.text });
        gameLog(`Exploración interrumpida: ${card.title}`);
        if (!isEnemyPhaseRef.current && activePlayerIdRef.current) {
          setActedThisRound(m => ({ ...m, [activePlayerIdRef.current as string]: true }));
        }
        finalizeTurnWithEndConditions(() => {
          advanceTurn();
        });
        return;
      }
      gameLog(`🔎 ${card.title}`);
      gameLog(card.text);
      discoverRandomNote(0.25);
      return;
    }

    timePenalty(60 + Math.floor(Math.random()*60));

    const roll = Math.random();
    if(roll < 0.2){
      const count = 1 + Math.floor(Math.random()*3);
      spawnEnemies(count);
      setBattleStats({ byPlayer: {}, lootNames: [] });
      setCurrentCard({ id: uid(), type: "combat", title: "Encuentro inesperado", text: "Durante la exploración aparecen enemigos." });
      gameLog(`Exploración interrumpida: ¡${count} enemigos!`);
      if (!isEnemyPhaseRef.current && activePlayerIdRef.current) {
        setActedThisRound(m => ({ ...m, [activePlayerIdRef.current as string]: true }));
      }
      finalizeTurnWithEndConditions(() => {
        advanceTurn();
      });
      return;
    }

    const ev = EXPLORATION_EVENTS[Math.floor(Math.random()*EXPLORATION_EVENTS.length)];
    const r = ev.reward || {};

    setResources(prev => ({
      ...prev,
      food: (prev.food || 0) + (r.food || 0),
      water: (prev.water || 0) + (r.water || 0),
      materials: (prev.materials || 0) + (r.materials || 0),
      ammo: (prev.ammo || 0) + (r.ammo || 0),
      medicine: (prev.medicine || 0) + (r.medicine || 0),
      fuel: (prev.fuel || 0) + (r.fuel || 0),
    }));

    discoverRandomNote(0.25);

    if (r.item) {
      const holderId = activePlayer?.id;
      if (holderId) {
        const res = tryAddToBackpack(holderId, r.item);
        gameLog(`🔎 Encuentras ${r.item}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
      } else {
        setStash(s=>[...s, r.item]);
        gameLog(`🔎 Encuentras ${r.item}. Guardado en el alijo.`);
      }
    }

    (function maybeFindWeaponOnExploration(playerId?: string){
      // 25% chance arma mid-tier
      if (Math.random() < 0.25) {
        const drop = randomWeaponNameByTier('mid');
        if (playerId) {
          const res = tryAddToBackpack(playerId, drop);
          gameLog(`🧰 En la exploración hallas ${drop}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
        } else {
          setStash(s=>[...s, drop]);
          gameLog(`🧰 En la exploración hallas ${drop}. Guardado en el alijo.`);
        }
      }
      // 3% chance de ampliación de mochila (si la usas)
      const BP_UP = "Ampliación de Mochila (+4)";
      if (Math.random() < 0.03) {
        if (playerId) {
          const res = tryAddToBackpack(playerId, BP_UP);
          gameLog(`🎒 Encuentras ${BP_UP}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
        } else {
          setStash(s=>[...s, BP_UP]);
          gameLog(`🎒 Encuentras ${BP_UP}. Guardado en el alijo.`);
        }
      }
    })(activePlayer?.id);

    const ammoBox = maybeAmmoBox();
    if (ammoBox){
      const holderId = activePlayer?.id;
      if(holderId){
        const p = players.find(pl=>pl.id===holderId);
        const bp = [...(p?.inventory ?? []), ammoBox];
        updatePlayer(holderId, { inventory: bp });
        gameLog(`🧰 En la exploración hallas ${ammoBox.name}. Guardado en tu mochila.`);
      } else {
        setStash(s=>[...s, ammoBox.name]);
        gameLog(`🧰 En la exploración hallas ${ammoBox.name}. Guardado en el alijo.`);
      }
    }

    gameLog(`${ev.text} — Recompensa obtenida.`);
    setExplorationActive(false);
    if (!isEnemyPhaseRef.current && activePlayerIdRef.current) {
      setActedThisRound(m => ({ ...m, [activePlayerIdRef.current as string]: true }));
    }
    finalizeTurnWithEndConditions(() => {
      advanceTurn();
    });
  }

  function spawnTimedEvent(){
    const id = uid();
    const dur = 90_000; // 90s
    const ev: TimedEvent = {
      id,
      name: "Sirena distante",
      text: "Una sirena en la zona industrial atrae curiosos... y no-muertos.",
      startedAt: Date.now(),
      durationMs: dur,
      onExpire: () => {
        setThreat(t=>t+6);
        setMorale(m=>clamp(m-3,0,100));
        gameLog("🚨 La sirena atrajo una horda lejana (+Amenaza, -Moral).");
      },
      onResolvePositive: () => {
        setResources(r=>({...r, materials: r.materials+2, fuel: r.fuel+1}));
        gameLog("🛠️ Neutralizan la sirena y recuperan piezas (+2 materiales, +1 combustible).");
      }
    };
    setTimedEvent(ev);
    gameLog("⏳ Evento activado: una barra indica el tiempo para resolverlo.");
  }

  function resolveTimedEventPositively(){
    if(!timedEvent) return;
    timedEvent.onResolvePositive?.();
    setTimedEvent(null);
    timePenalty(40);
  }

  function timePenalty(seconds:number){
    const ms = seconds*1000;
    clockMsRef.current = Math.max(0, clockMsRef.current - ms);
    setClockMs(prev=> Math.max(0, prev - ms));
  }

  useEffect(()=>{
    console.debug("[state] state:", state, "timeRunning:", timeRunning, "day:", day);
  }, [state, timeRunning, day]);

  // ——— Inventario ———
  function toBaseItem(name:string): InventoryItem{ return { id: crypto.randomUUID(), name, type:'misc' }; }
  const [stash, setStash] = useState<InventoryItem[]>([
    "Pistola","Botiquín","Linterna","Cuerda","Chatarra"].map(toBaseItem)
  );

  // Capacidad de mochila
  function backpackUsed(p: Player){ return p.inventory.length; }
  function backpackCap(p: Player){ return p.backpackCapacity ?? 8; }

  // Añadir item intentando mochila y si no cabe, al alijo (stash)
  function tryAddToBackpack(playerId: string, itemName: string): {added:boolean, to:'backpack'|'stash'} {
    const item = toBaseItem(itemName);
    const p = players.find(pp=>pp.id===playerId);
    if(!p){ setStash(s=>[...s, item]); return {added:true, to:'stash'}; }
    if (backpackUsed(p) < backpackCap(p)) {
      updatePlayer(playerId, { inventory: [...p.inventory, item] });
      return { added:true, to:'backpack' };
    } else {
      setStash(s=>[...s, item]);
      return { added:true, to:'stash' };
    }
  }

  // Loot por tier
  const LOW_TIER = ['Navaja','Cuchillo','Bate de madera','Garrote','Botella rota','Destornillador grande','Hondita'];
  const MID_TIER = ['Tubo de metal','Bate con clavos','Machete','Pala','Llave inglesa','Barra palanca','Sierra manual','Pistola','Ballesta'];
  const HIGH_TIER = ['Hacha','Maza casera','Katana','Cañería pesada','Hacha de bombero','Rifle','Escopeta','Subfusil (SMG)'];

  function randomFrom(arr:string[]){ return arr[Math.floor(Math.random()*arr.length)]; }
  function tierByEnemy(enemy:{hpMax:number; atk:number; def:number}){
    const score = (enemy.hpMax||0) + (enemy.atk||0)*3 + (enemy.def||0)*2;
    if (score >= 40) return 'high';
    if (score >= 22) return 'mid';
    return 'low';
  }
  function randomWeaponNameByTier(tier:'low'|'mid'|'high'){
    if (tier==='high') return randomFrom(HIGH_TIER);
    if (tier==='mid')  return randomFrom(MID_TIER);
    return randomFrom(LOW_TIER);
  }

  function giveItemToPlayer(playerId:string, item:InventoryItem){
    const p = players.find(pp=>pp.id===playerId);
    if(!p) return;
    if (backpackUsed(p) >= backpackCap(p)) { gameLog(`La mochila de ${p.name} está llena.`); return; }
    setStash(s=> s.filter(it=>it.id!==item.id));
    setPlayers(ps=> ps.map(pl => pl.id===playerId ? {...pl, inventory:[...pl.inventory, item]} : pl));
    gameLog(`📦 Traslado: se entregó "${item.name}" al inventario del jugador ${p.name}.`);
  }
  function takeItemFromPlayer(playerId:string, item:any){
    const p = players.find(pp=>pp.id===playerId);
    if(!p) return;
    const idx = p.inventory.findIndex(it=> it===item || (typeof it==='object' && typeof item==='object' && it.id===item.id));
    if(idx<0) return;
    const inv = [...p.inventory];
    const removed = inv.splice(idx,1)[0];
    setPlayers(ps=> ps.map(pl => pl.id===playerId ? {...pl, inventory: inv} : pl));
    const add = typeof removed === 'object' ? removed : toBaseItem(String(removed));
    setStash(s=> [...s, add]);
    gameLog(`📦 Traslado: ${p.name} devolvió "${add.name}" al alijo.`);
  }

  function consumeFoodForPlayer(playerId:string, _itemId:string){
    const idx = players.findIndex(p=>p.id===playerId);
    if(idx<0) return;
    const res = consumeFoodFromPlayer(players[idx],1);
    setPlayers(ps=> ps.map((p,i)=> i===idx ? res.player : p));
  }

  function consumeMedForPlayer(playerId:string, _itemId:string){
    const idx = players.findIndex(p=>p.id===playerId);
    if(idx<0) return;
    const res = consumeMedicineFromPlayer(players[idx],1);
    setPlayers(ps=> ps.map((p,i)=> i===idx ? res.player : p));
  }

  // consumeFoodItem: usa el sistema de inventario unificado.
  function consumeFoodItem(label?: string, energyGain?: number) {
    if (controlsLocked || isEnemyPhase) return;
    if (!activePlayer) return;

    const p = activePlayer;
    if (!playerCanActNow()) return;
    if (!startPlayerActionOrBlock()) return;

    let state: any = { players, camp: { stash, resources } };
    const prevEnergy = p.energy ?? 0;

    let invFood = p.inventory?.find((it: any) => it.type === "food");
    if (invFood) {
      state = consumeFood(state, p.id, invFood.id);
    } else if ((resources?.food ?? 0) > 0) {
      state = materializeFoodFromStock(state, 1, FOOD_CATALOG[0].id);
      const newItemId = state.camp.stash[state.camp.stash.length - 1].id;
      state = moveFromStashToPlayer(state, p.id, newItemId);
      invFood = state.players.find((pl: any)=>pl.id===p.id)?.inventory.find((it:any)=>it.id===newItemId);
      state = consumeFood(state, p.id, newItemId);
    } else {
      pushBattle("🍞 No quedan alimentos en el campamento.");
      endTurnNow(ACTION_TIME_COSTS.heal);
      return;
    }

    const updated = state.players.find((pl: any) => pl.id === p.id);
    setPlayers(state.players);
    setStash(state.camp.stash);
    setResources(state.camp.resources);

    const consumedName = invFood?.name ?? label;
    const name = consumedName ? ` ${consumedName}` : "";
    const delta = (updated?.energy ?? 0) - prevEnergy;
    pushBattle(`🍽️ ${p.name} come${name} (+${delta} energía).`);

    endTurnNow(ACTION_TIME_COSTS.heal);
  }

  function handleWithdrawBoxes(count:number){
    if(!count || count<=0) return;
    setResources(r=>{
      const next = { ...r, ammo: Math.max(0, (r.ammo||0) - count*15) };
      return next;
    });
    try { setStash?.((s:InventoryItem[])=>[...s, ...Array(count).fill(0).map(()=>toAmmoBox(15))]); } catch {}
    pushLog?.(`📦 Sacas ${count} ${count===1?'caja':'cajas'} de munición (${count*15} municiones) del depósito.`);
    setShowAmmoModal(false);
  }

  function handleWithdrawBullets(count:number){
    if(!count || count<=0) return;
    setResources(r=>{
      const next = { ...r, ammo: Math.max(0, (r.ammo||0) - count) };
      return next;
    });
    try { setStash?.((s:InventoryItem[])=>[...s, toLooseAmmo(count)]); } catch {}
    pushLog?.(`🔫 Sacas ${count} ${count===1?'munición':'municiones'} del depósito.`);
    setShowAmmoModal(false);
  }

  function removePlayer(id:string){
    const p = players.find(x=>x.id===id);
    if(!p) return;
    if(!confirm(`Eliminar a ${p.name} de forma permanente?`)) return;
    setPlayers(ps => ps.filter(x=>x.id!==id));
    gameLog(`🩸 ${p.name} abandona la historia para siempre.`);
    setMorale(m=>clamp(m-6,0,100));
  }

  // ——— UI ———
  if(state==="menu"){
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Apocalipsis Zombie RPG</h1>
          <p className="mt-3 text-neutral-300">Sistema ligero con mazos, tiempo real y supervivencia.</p>
          <div className="mt-10 space-x-3">
            <button className="btn btn-red text-white" onClick={start}>Comenzar</button>
            <button
              className="btn btn-ghost"
              onClick={()=>{
                setTimeRunning(false);
                setState("paused");
              }}
            >
              Entrar en Pausa
            </button>
          </div>
          <div className="mt-16 text-neutral-400 text-sm">
            <p>Consejo: las acciones consumen tiempo del día. La noche es peligrosa.</p>
          </div>
        </div>
      </div>
    );
  }

  if(state==="gameover"){
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-7xl font-black text-red-600 mb-4">GAME OVER</h1>
          <p className="text-neutral-300">La voluntad se quebró. Queda el silencio.</p>
          <button className="mt-8 btn btn-red text-white" onClick={()=>location.reload()}>Reiniciar</button>
        </div>
      </div>
    );
  }

  if(state==="victory"){
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-black to-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-7xl font-black text-green-500 mb-4">¡VICTORIA!</h1>
          <p className="text-neutral-300">Un nuevo amanecer parece posible.</p>
          <button className="mt-8 btn btn-green text-white" onClick={()=>location.reload()}>Menú</button>
        </div>
      </div>
    );
  }

  // HUD superior
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950">
      <main
        id="appRoot"
        className="min-h-screen w-full grid gap-3 p-3 grid-cols-12 grid-rows-[auto_auto_auto_auto_auto_auto_auto_auto_auto] text-neutral-100"
      >
        <section
          id="topHead"
          className="col-span-12 flex flex-wrap items-center gap-4 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3"
        >
          <div id="dayInfo" className="flex items-center gap-2 text-lg font-semibold">
            <span>📅 Día {day}</span>
            <span>{phaseIcon} {phase}</span>
          </div>
          <div
            id="moraleInfo"
            className="flex flex-wrap items-center gap-3 text-sm text-neutral-300"
          >
            <span>💭 Moral {morale}%</span>
            <span className="text-red-300">⚠️ Amenaza {threat}</span>
            <span className="tabular-nums text-neutral-400">🕒 {clockLabel}</span>
          </div>
          <div className="flex-1 min-w-[180px]">
            <div id="timeProgress" className="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                id="timeProgressFill"
                className="h-full bg-neutral-200"
                style={{ width: `${timeProgressValue}%` }}
              />
            </div>
          </div>
          <button
            id="btnPausePlay"
            className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
            onClick={handlePauseToggle}
          >
            {timeRunning && state !== "paused" ? "⏸️" : "▶️"}
          </button>
        </section>

        <section
          id="cardsSection"
          className="col-span-12 space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4"
        >
          <div
            id="cardsBoard"
            className="min-h-[140px] space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4"
          >
            {currentCard ? (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-neutral-100">Resolviendo: {currentCard.title}</h3>
                <p className="text-sm text-neutral-300">{currentCard.text}</p>
              </div>
            ) : (
              <NoCardActions
                onExplore={exploreArea}
                onPassNight={passNight}
                phase={phase}
                explorationActive={explorationActive}
              />
            )}
            {timedEvent && (
              <div className="rounded-lg border border-red-800/30 bg-red-950/40 p-3">
                <TimedEventBanner
                  event={timedEvent}
                  now={nowRef.current}
                  onResolve={resolveTimedEventPositively}
                />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button id="btnDrawDecision" className="btn" onClick={drawDecision}>
              Sacar carta (decisión)
            </button>
            <button id="btnDrawCombat" className="btn" onClick={drawCombat}>
              Sacar carta (combate)
            </button>
            <button id="btnReshuffle" className="btn" onClick={shuffleDecks}>
              Rebarajar
            </button>
            <button id="btnReintegrateDiscards" className="btn" onClick={recycleDiscards}>
              Reintegrar descartes
            </button>
          </div>
        </section>

        <section id="exploreLootModal" className={clsx("col-span-12", currentCard ? "" : "hidden")}>
          {currentCard && (
            <div className="fixed inset-0 z-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              <div className="relative z-50 w-full max-w-3xl mx-4">
                <CardView
                  card={currentCard}
                  onResolveChoice={resolveChoice}
                  enemies={enemies}
                  battleLines={logs}
                  onAttack={performAttack}
                  onDefend={defend}
                  onHeal={healSelf}
                  onHealAlly={() => {
                    setShowHealAlly(true);
                    setControlsLocked(true);
                  }}
                  onFlee={flee}
                  onEat={() => consumeFoodItem()}
                  controlsLocked={controlsLocked}
                  isEnemyPhase={isEnemyPhase}
                  canAttackWithSelected={canAttackWithSelected}
                  activeDown={activeDown}
                  activePlayer={activePlayer}
                  onEquipWeapon={handleQuickEquip}
                  canHeal={!!activePlayer && activePlayer.hp < activePlayer.hpMax && resources.medicine > 0}
                  canEat={!isEnemyPhase && (resources?.food ?? 0) > 0 && !!activePlayer}
                  onClose={() => {
                    if (currentCard.type === "decision") setDiscardDecision(d => [currentCard, ...d]);
                    else setDiscardCombat(d => [currentCard, ...d]);
                    handleCloseCard();
                    endTurnNow(ACTION_TIME_COSTS.decision);
                  }}
                />
              </div>
            </div>
          )}
        </section>

        <section id="combatPanel" className={clsx("col-span-12", combatActive ? "" : "hidden")}>
          {combatActive && (
            <CombatPanel
              battleLines={logs}
              enemies={enemies}
              onAttack={performAttack}
              onDefend={defend}
              onHeal={healSelf}
              onHealAlly={() => {
                setShowHealAlly(true);
                setControlsLocked(true);
              }}
              onFlee={flee}
              controlsLocked={controlsLocked}
              isEnemyPhase={isEnemyPhase}
              canAttackWithSelected={canAttackWithSelected}
              activeDown={activeDown}
              activePlayer={activePlayer}
              onEquipWeapon={handleQuickEquip}
              canHeal={!!activePlayer && activePlayer.hp < activePlayer.hpMax && resources.medicine > 0}
              onEat={() => consumeFoodItem()}
              canEat={!isEnemyPhase && !!activePlayer && (resources?.food ?? 0) > 0}
            />
          )}
        </section>

        <section
          id="gameLog"
          ref={(el) => {
            gameLogRef.current = el;
            if (el) initLogger();
          }}
          className="col-span-12 h-48 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 text-sm"
        />

        <section id="controlRow" className="col-span-12 grid grid-cols-12 gap-3">
          <div
            id="weaponsTab"
            className="col-span-12 md:col-span-8 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4"
          >
            <label htmlFor="weaponSelect" className="mb-2 block text-sm text-neutral-300">
              Arma equipada
            </label>
            <select
              id="weaponSelect"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
              value={currentWeaponId}
              onChange={(e) => {
                const next = e.target.value;
                if (!activePlayerState || !next) return;
                handleQuickEquip(activePlayerState.id, next);
              }}
              disabled={!activePlayerState || weaponOptions.length === 0}
            >
              {weaponOptions.map((opt) => (
                <option key={opt.id} value={opt.id} disabled={!opt.usable}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-wrap items-end justify-end gap-2">
            <button
              id="btnEat"
              className="btn"
              onClick={() => consumeFoodItem()}
              disabled={!canEatOutOfCombat}
            >
              Comer
            </button>
            <button
              id="btnHeal"
              className="btn"
              onClick={() => healSelf()}
              disabled={!canHealOutOfCombat}
            >
              Curarse
            </button>
            <button
              id="btnEndTurn"
              className="btn-primary"
              onClick={() => endTurnNow(0)}
              disabled={!canEndTurnAction}
            >
              Terminar turno
            </button>
          </div>
        </section>

        <PartyPanel
          players={players}
          onUpdatePlayer={updatePlayer}
          onRemove={removePlayer}
          activePlayerId={activePlayerId ?? undefined}
          isEnemyPhase={isEnemyPhase}
          resources={resources}
          setResources={setResources}
          consumeFoodForPlayer={consumeFoodForPlayer}
          consumeMedForPlayer={consumeMedForPlayer}
          activePlayer={activePlayer}
          setPlayers={setPlayers}
        />

        <NotesPanel notes={foundNotes} onFollowNote={followNote} />

        <CampTabs
          activeTab={activeCampTab}
          onSelectTab={setActiveCampTab}
          inventoryState={{
            stash,
            players,
            giveItem: giveItemToPlayer,
            takeItem: takeItemFromPlayer,
          }}
          campState={{
            resources,
            setResources,
            stash,
            setStash,
            camp,
            setCamp,
          }}
        />

        <section
          id="notificationsLog"
          className="col-span-12 h-28 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 text-sm space-y-2"
        >
          {notifications.length === 0 ? (
            <p className="text-neutral-500">Sin notificaciones de sistema.</p>
          ) : (
            notifications.map((note, idx) => (
              <div key={`${idx}-${note}`} className="rounded bg-neutral-800/60 px-3 py-1">
                {note}
              </div>
            ))
          )}
        </section>
      </main>

      {state === "paused" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-neutral-700 bg-neutral-900 p-8">
            <h2 className="text-2xl font-bold text-red-400">Pausado</h2>
            <button
              className="btn btn-red text-white w-full"
              onClick={() => {
                setState("playing");
                setTimeRunning(true);
              }}
            >
              Reanudar
            </button>
          </div>
        </div>
      )}
      <HealAllyModal
        open={showHealAlly}
        players={players}
        onPick={(targetId)=>{
          setShowHealAlly(false);
          const actor = players.find(p=>p.id===activePlayerId);
          const target = players.find(p=>p.id===targetId);
          if(!actor || !target){ setControlsLocked(false); return; }

          setControlsLocked(true);

          const inf = hasCondition(target.conditions,'infected');
          const ble = hasCondition(target.conditions,'bleeding');

          if (inf) {
            let state: any = { players, camp: { stash, resources } };
            let med = actor.inventory?.find((it:any)=>it.type==='med');
            if (!med) {
              const stock = Number(state.camp.resources?.medicine ?? 0);
              if (stock <= 0) {
                pushBattle(`${actor.name} intenta curar a ${target.name}, pero no hay medicina.`);
                if (ble) {
                  updatePlayer(target.id, { conditions: removeCondition(target.conditions,'bleeding') });
                  pushBattle(`${actor.name} logra detener la hemorragia de ${target.name}.`);
                  endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
                    timePenalty(25);
                    advanceTurn();
                  }));
                } else {
                  endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
                    timePenalty(10);
                    advanceTurn();
                  }));
                }
                return;
              }
              state = materializeMedFromStock(state, 1, 'medicine');
              const newItemId = state.camp.stash[state.camp.stash.length - 1].id;
              state = moveFromStashToPlayer(state, actor.id, newItemId);
              med = { id: newItemId } as any;
            }
            const prevHpActor = actor.hp;
            state = consumeMed(state, actor.id, med.id);
            const updatedActor = state.players.find((p:any)=>p.id===actor.id);
            const playersNext = state.players.map((p:any)=>{
              if(p.id===actor.id) return { ...updatedActor, hp: prevHpActor };
              if(p.id===target.id) return { ...p, conditions: removeCondition(removeCondition(p.conditions,'infected'),'bleeding') };
              return p;
            });
            state = { ...state, players: playersNext };
            setPlayers(state.players);
            setStash(state.camp.stash);
            setResources(state.camp.resources);
            pushBattle(`${actor.name} administra medicina a ${target.name} y supera la infección.`);
            if (ble) {
              pushBattle(`Además, ${actor.name} consigue detener la hemorragia de ${target.name}.`);
            }
            endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
              timePenalty(30);
              advanceTurn();
            }));
            return;
          }

          if (ble) {
            updatePlayer(target.id, { conditions: removeCondition(target.conditions,'bleeding') });
            pushBattle(`${actor.name} detiene la hemorragia de ${target.name}.`);
            endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
              timePenalty(20);
              advanceTurn();
            }));
            return;
          }

          pushBattle(`${actor.name} verifica a ${target.name}: no requiere curación ahora.`);
          endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
            timePenalty(10);
            advanceTurn();
          }));
        }}
        onClose={()=>{ setShowHealAlly(false); setControlsLocked(false); }}
      />
      <InfectionFatalModal
        open={!!infectionDead}
        playerName={infectionDead?.name ?? ""}
        onClose={() => setInfectionDead(null)}
      />
      <DayEndModal
        open={showDayEnd}
        lines={dayEndLines}
        onNextDay={() => {
          const upcoming = day + 1;
          setShowDayEnd(false);
          setControlsLocked(false);
          setTimeRunning(true);
          setStats({ decisions:0, explorations:0, battles:0, kills:0 });
          nextDay(true);
          setDay(upcoming);
          setClockMs(DAY_LENGTH_MS);
          setDecisionDeck(shuffle(mapDecisionCards(getDecisionDeckForDay(upcoming))));
          setExplorationDeck(shuffle(getExplorationDeckForDay(upcoming)));
          gameLog(`— Comienza el Día ${upcoming} —`);
        }}
      />
      <AmmoWithdrawModal
        isOpen={showAmmoModal}
        ammo={totalAmmoInInventory(players.find(p=>p.id===activePlayerId)?.inventory)}
        onClose={()=>setShowAmmoModal(false)}
        onWithdrawBoxes={handleWithdrawBoxes}
        onWithdrawBullets={handleWithdrawBullets}
      />
      <AmmoReloadModal
        isOpen={showReloadModal}
        player={players.find(p=>p.id===activePlayerId) || null}
        onClose={()=>setShowReloadModal(false)}
        onConfirm={confirmReload}
      />
      <OverlayRoot overlayOpen={overlayOpen} proceed={proceed} />
      <WelcomeOverlay />
    </div>
  );
}

function HeaderHUD(props:{
  day:number; phase:Phase; clock:string; progress:number;
  morale:number; threat:number;
  timeRunning:boolean; setTimeRunning:(b:boolean)=>void;
  onPause:()=>void;
}){
  const phaseIcon = props.phase==="dawn"?"🌅":props.phase==="day"?"☀️":props.phase==="dusk"?"🌆":"🌙";
  const dangerColor = props.threat>50?"text-red-400":props.threat>25?"text-yellow-400":"text-green-400";
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-black via-neutral-950/95 to-transparent backdrop-blur-md border-b border-red-900/40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">🧟 Apocalipsis</h1>
          <span className="badge">📅 Día {props.day}</span>
          <span className="badge">{phaseIcon} {props.phase}</span>
          <span className={clsx("badge", dangerColor)}>⚠️ {props.threat}</span>
          <span className="badge">💭 {props.morale}%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48 h-3 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-yellow-400" style={{width: `${props.progress}%`}}/>
          </div>
          <span className="tabular-nums">{props.clock}</span>
          <button className="btn btn-ghost" onClick={()=>props.setTimeRunning(!props.timeRunning)}>
            {props.timeRunning?"⏸️":"▶️"}
          </button>
          <button className="btn btn-ghost" onClick={props.onPause}>⏯️</button>
        </div>
      </div>
    </header>
  );
}

function DeckControls(props: { onDrawDecision:()=>void; onDrawCombat:()=>void; onShuffle:()=>void; onRecycle:()=>void }){
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-purple text-white" onClick={props.onDrawDecision}>🎴 Sacar Carta (Decisión)</button>
      <button className="btn btn-red text-white" onClick={props.onDrawCombat}>🩸 Sacar Carta (Combate)</button>
      <div className="flex-1" />
      <button className="btn btn-ghost" onClick={props.onShuffle}>🔀 Barajar</button>
      <button className="btn btn-ghost" onClick={props.onRecycle}>♻️ Reintegrar descartes</button>
    </div>
  );
}

function CardView(props:{
  card: Card;
  onResolveChoice: (choice: NonNullable<Card["choices"]>[number])=>void;
  onClose: ()=>void;
  enemies: Enemy[];
  battleLines: string[];
  onAttack: (id:string)=>void;
  onDefend: ()=>void;
  onHeal: ()=>void;
  onHealAlly: ()=>void;
  onFlee: ()=>void;
  controlsLocked: boolean;
  isEnemyPhase: boolean;
  canAttackWithSelected: boolean;
  activeDown: boolean;
  activePlayer: Player | null;
  onEquipWeapon: (playerId: string, weaponId: string) => void;
  canHeal: boolean;
  onEat: ()=>void;
  canEat: boolean;
}){
  const isDecision = props.card.type==="decision";
  return (
    <div className={clsx("card p-6 animate-fade-in", isDecision?"card-purple":"card-red")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold">{props.card.title}</h3>
          <p className="text-neutral-300 mt-1">{props.card.text}</p>
          {!isDecision && props.card.scene && (
            <div className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
              Escenario: {props.card.scene}
            </div>
          )}
          {!isDecision && typeof props.card.difficulty === 'number' && (
            <div className="mt-1 text-xs text-neutral-500">Dificultad estimada: {props.card.difficulty}</div>
          )}
        </div>
        <button className="btn btn-ghost" onClick={props.card.type==='combat'?props.onFlee:props.onClose}>✖</button>
      </div>

      {isDecision && props.card.choices && (
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {props.card.choices.map((c,i)=>(
            <button key={i} className="btn" onClick={()=>props.onResolveChoice(c)}>
              → {c.text}
            </button>
          ))}
        </div>
      )}

      {!isDecision && (
        <div className="mt-5 space-y-3 text-sm text-neutral-300">
          <p>Gestiona el enfrentamiento desde el panel de combate. Esta carta sirve como referencia narrativa.</p>
          <div className="flex justify-end">
            <button className="btn" onClick={props.onFlee}>Abandonar combate</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PartyPanel({
  players,
  onUpdatePlayer,
  onRemove,
  activePlayerId,
  isEnemyPhase,
  resources,
  setResources,
  consumeFoodForPlayer,
  consumeMedForPlayer,
  activePlayer,
  setPlayers,
}:{
  players: Player[];
  onUpdatePlayer: (id: string, patch: Partial<Player>) => void;
  onRemove: (id: string) => void;
  activePlayerId?: string;
  isEnemyPhase: boolean;
  resources: Resources;
  setResources: React.Dispatch<React.SetStateAction<Resources>>;
  consumeFoodForPlayer: (playerId: string, itemId: string) => void;
  consumeMedForPlayer: (playerId: string, itemId: string) => void;
  activePlayer: Player | null;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}){
  const alive = players.filter(p=>p.status!=="dead");
  const [selected, setSelected] = useState<string | null>(alive[0]?.id ?? null);
  useEffect(()=>{
    if(selected && !players.find(p=>p.id===selected)){ setSelected(alive[0]?.id ?? null); }
  }, [players]);

  return (
    <>
      <section
        id="survivorsPanel"
        className="col-span-12 grid gap-3 md:grid-cols-3 lg:grid-cols-4"
      >
        {players.map(p=>{
          const isDown = p.hp <= 0;
          const isBleeding = hasCondition(p.conditions,'bleeding');
          const isInfected = hasCondition(p.conditions,'infected');
          const isStunned = hasCondition(p.conditions,'stunned');
          const inf = p.conditions?.infected;
          const left = inf?.expiresAtMs ? Math.max(0, inf.expiresAtMs - Date.now()) : 0;
          const mm = String(Math.floor(left/60000)).padStart(2,'0');
          const ss = String(Math.floor((left%60000)/1000)).padStart(2,'0');
          return (
            <div
              key={p.id}
              className={[
                "rounded-xl border p-3 transition bg-neutral-900/60 border-neutral-800 text-sm",
                (!isEnemyPhase && p.id === activePlayerId) ? "ring-2 ring-emerald-400 animate-pulse" : "",
                isDown ? "saturate-0 grayscale opacity-80" : "",
                isBleeding && !isDown ? "border-red-500/60" : "",
                isInfected && !isDown ? "border-emerald-400/60" : "",
              ].join(" ")}
            >
              <input
                className="w-full border-b border-neutral-700 bg-transparent text-sm font-semibold leading-tight outline-none focus:border-red-500"
                value={p.name}
                onChange={(e)=>onUpdatePlayer(p.id,{ name: e.target.value })}
              />
              <div className="h-px bg-white/10 mt-1" />
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {isDown ? (
                  <span className="rounded bg-zinc-700/80 px-2 py-0.5 text-xs text-zinc-100">Fuera de combate</span>
                ) : (
                  <>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs">Vivo</span>
                    {isBleeding && <span className="rounded bg-red-600/80 px-2 py-0.5 text-xs">Sangrando</span>}
                    {isInfected && <span className="rounded bg-emerald-600/80 px-2 py-0.5 text-xs">Infectado</span>}
                    {isStunned && <span className="rounded bg-zinc-500/80 px-2 py-0.5 text-xs">Aturdido</span>}
                  </>
                )}
              </div>
              {isInfected && !isDown && (
                <div className="mt-1 text-xs opacity-80">
                  Tiempo para curarse: {mm}:{ss}
                </div>
              )}
              <p className="text-xs text-neutral-400">{p.profession}</p>
              <div className="mt-2 space-y-2">
                <Bar label="PV" current={p.hp} max={p.hpMax} color="green" />
                <Bar label="Energía" current={p.energy} max={p.energyMax} color="blue" />
              </div>
              <div className="mt-1 text-xs text-neutral-400">
                Mochila: {p.inventory.length}/{p.backpackCapacity ?? 8}
              </div>
              <div className="mt-2 flex gap-2">
                <button className="btn" onClick={()=>setSelected(p.id)}>Ver</button>
                {p.status!=="dead" && (
                  <button className="btn btn-red text-white" onClick={()=>onRemove(p.id)}>Eliminar</button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <aside
        id="survivorDetails"
        className={clsx(
          "col-span-12 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4",
          selected ? "" : "hidden",
        )}
      >
        <h3 className="mb-3 text-lg font-semibold">Detalles</h3>
        {selected ? (
          <>
            <Details
              player={players.find(p=>p.id===selected)!}
              onUpdate={(patch)=>onUpdatePlayer(selected, patch)}
              addMedicine={(n)=>{
                const st = addMedicineToCamp({ resources }, n);
                setResources(st.resources);
              }}
              consumeFood={consumeFoodForPlayer}
              consumeMed={consumeMedForPlayer}
            />
            {activePlayer && getEquippedWeapon(activePlayer).type==='firearm' && canReloadEquipped(activePlayer) && (
              <button
                className="mt-3 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                onClick={()=>setPlayers(list => list.map(p => p.id===activePlayer.id ? reloadWeaponMagazine(p, getEquippedWeapon(activePlayer).id) : p))}
                title="Recargar arma"
              >
                🔧 Recargar arma
              </button>
            )}
          </>
        ) : (
          <p className="text-neutral-500">Selecciona un personaje para ver sus detalles.</p>
        )}
      </aside>
    </>
  );
}
function Details({player, onUpdate, addMedicine, consumeFood: onConsumeFood, consumeMed: onConsumeMed}:{player:Player; onUpdate:(patch:Partial<Player>)=>void; addMedicine:(n:number)=>void; consumeFood:(pid:string,itemId:string)=>void; consumeMed:(pid:string,itemId:string)=>void;}){
  const [medkitOpen, setMedkitOpen] = useState(false);
  const [medkitTake, setMedkitTake] = useState(1);

  const selWeapon = getEquippedWeapon(player);
  const isFirearm = selWeapon.type === 'firearm';
  const loaded = isFirearm ? getMagazineCount(player, selWeapon.id) : 0;
  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div>DEF: {player.defense}</div>
        <div>Inventario: {player.inventory.length}</div>
        <div>Estado: {player.status}</div>
      </div>
      <div className="text-xs mt-2">
        Arma actual: {selWeapon.name} · Daño {selWeapon.dice} {isFirearm ? `· Munición ${loaded}/${selWeapon.magSize}` : ''}
      </div>
      <div>
        <h4 className="text-neutral-400 text-xs mt-2">Objetos</h4>
        <div className="flex flex-wrap gap-1 mt-1">
          {player.inventory.length===0 ? <span className="text-neutral-500 text-xs">Vacío</span> :
            player.inventory.map((it,i)=>{
              const name = typeof it === 'string' ? it : it?.name;
              return <span key={i} className="px-2 py-1 bg-neutral-800 rounded text-xs">{name}</span>;
            })
          }
        </div>
      <div className="text-xs opacity-80 mt-1">
        Cajas de munición en mochila: {totalAmmoInInventory(player.inventory)}
      </div>
    </div>

      {player.inventory.some((it:any)=>typeof it==='object' && it.type==='food') && (
        <button className="mt-2 px-3 py-2 rounded-lg bg-neutral-800" onClick={()=>{
          const foods = player.inventory.filter((it:any)=>typeof it==='object' && it.type==='food');
          const choice = foods.length===1 ? 0 : (parseInt(prompt('Elige alimento:\n'+foods.map((f,i)=>`${i+1}. ${f.name}`).join('\n'))||'1',10)-1);
          const sel = foods[choice];
          if(sel) onConsumeFood(player.id, sel.id);
        }}>Comer</button>
      )}
      {player.inventory.some((it:any)=>typeof it==='object' && it.type==='med') && (
        <button className="mt-2 ml-2 px-3 py-2 rounded-lg bg-neutral-800" onClick={()=>{
          const meds = player.inventory.filter((it:any)=>typeof it==='object' && it.type==='med');
          const choice = meds.length===1 ? 0 : (parseInt(prompt('Elige medicina:\n'+meds.map((f,i)=>`${i+1}. ${f.name}`).join('\n'))||'1',10)-1);
          const sel = meds[choice];
          if(sel) onConsumeMed(player.id, sel.id);
        }}>Curarse</button>
      )}

      {/* Botón de Botiquín (verde breath neon) */}
      {player.inventory.some(isMedkit) && (
        <>
          <button
            className="mt-2 px-3 py-2 rounded-xl font-bold text-black bg-green-400 animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:shadow-[0_0_30px_rgba(34,197,94,0.9)]"
            onClick={()=> setMedkitOpen(true)}
            title="Abrir botiquín"
          >
            🩹 Botiquín (detalle)
          </button>
          {medkitOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setMedkitOpen(false)} />
              <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-6 bg-zinc-900/95 border border-green-500/40 shadow-[0_0_25px_rgba(34,197,94,0.5)]">
                <h4 className="text-lg font-bold text-green-400">Botiquín — Detalle</h4>
                <p className="text-sm text-neutral-300 mt-1">Toca + o – para elegir cuántas medicinas extraer.</p>
                <div className="mt-3 p-3 rounded-xl bg-neutral-800">
                  {(() => {
                    // tomar el primer botiquín
                    const idx = player.inventory.findIndex(isMedkit);
                    const it = player.inventory[idx];
                    const total = medCount(it);
                    return (
                      <div className="space-y-2">
                        <div className="text-sm">Tiene <b>{total}</b> medicinas dentro.</div>
                        <div className="flex items-center gap-3">
                          <button className="px-3 py-2 rounded-lg border border-white/10" onClick={()=> setMedkitTake(n=> Math.max(1, n-1))}>−</button>
                          <div className="min-w-[3rem] text-center text-lg">{medkitTake}</div>
                          <button className="px-3 py-2 rounded-lg border border-white/10" onClick={()=> setMedkitTake(n=> Math.min(total, n+1))}>+</button>
                        </div>
                        <button
                          className="mt-2 w-full px-3 py-2 rounded-xl font-bold bg-green-500/90 hover:bg-green-500 text-black"
                          onClick={()=>{
                            const variants = [
                              "Usaste el botiquín y recuperaste +{N} medicina.",
                              "Botiquín abierto: extraes {N} dosis curativas.",
                              "Desabrochaste el botiquín: obtienes {N} medicinas.",
                              "Con calma, sacas {N} medicamentos del botiquín.",
                              "El botiquín rinde: {N} unidades a la reserva.",
                              "Retiras {N} medicinas para el campamento.",
                              "Abres el botiquín y añades {N} al stock médico.",
                              "Extraes {N} del botiquín. La esperanza crece.",
                              "Del botiquín tomas {N} dosis. Registro actualizado.",
                              "El cierre se abre: {N} medicinas extraídas.",
                              "Revisas vendajes y tomas {N} medicinas.",
                              "Organizas el botiquín y agregas {N} a la reserva.",
                              "Sacas {N} pastillas y frascos del botiquín.",
                              "El equipo médico gana {N} gracias al botiquín.",
                              "Del kit sanitario extraes {N} medicinas útiles."
                            ];
                            const idxMk = player.inventory.findIndex(isMedkit);
                            if(idxMk<0) return;
                            const item = player.inventory[idxMk];
                            const total = medCount(item);
                            const take = Math.min(medkitTake, total);
                            // actualizar inventario del jugador
                            const left = total - take;
                            const newItem = left>0 ? setMedCount(item, left) : null;
                            onUpdate({
                              inventory: player.inventory.map((x,i)=> i===idxMk ? (newItem ?? undefined) : x).filter(Boolean) as any[]
                            });
                            // actualizar recursos del campamento
                            addMedicine(take);
                            // logs: abrir y uso
                            gameLog("🟢 Abriste el botiquín.");
                            const msg = variants[Math.floor(Math.random()*variants.length)].replace("{N}", String(take));
                            gameLog(`🩹 ${msg}`);
                            // cerrar modal
                            setMedkitOpen(false);
                          }}
                        >
                          Sacar medicina
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InventoryTabPanel({stash, players, giveItem, takeItem}:{stash:InventoryItem[]; players:Player[]; giveItem:(id:string,item:InventoryItem)=>void; takeItem:(id:string,item:any)=>void}){
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id ?? "");
  useEffect(()=>{
    if(!players.find(p=>p.id===selectedPlayer) && players[0]) setSelectedPlayer(players[0].id);
  }, [players]);
  const player = players.find(p=>p.id===selectedPlayer);
  return (
    <div className="card bg-neutral-900 border-neutral-800 p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-neutral-400">Selecciona:</span>
        <select className="bg-neutral-800 rounded px-2 py-1" value={selectedPlayer} onChange={e=>setSelectedPlayer(e.target.value)}>
          {players.map(p=>(<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
      </div>
      {!player ? <p className="text-neutral-500">Sin jugador</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm text-neutral-400 mb-1">Alijo del Campamento</h4>
            <div className="flex flex-wrap gap-2">
              {stash.length===0 ? <span className="text-xs text-neutral-500">Vacío</span> :
                stash.map((it)=>(
                  <button key={it.id} className="btn btn-ghost" onClick={()=>giveItem(player.id,it)}>{it.name} ➜</button>
                ))
              }
            </div>
          </div>
          <div>
            <h4 className="text-sm text-neutral-400 mb-1">Inventario de {player.name}</h4>
            <div className="flex flex-wrap gap-2">
              {player.inventory.length===0 ? <span className="text-xs text-neutral-500">Vacío</span> :
                player.inventory.map((it,i)=>(
                  <button key={i} className="btn btn-ghost" onClick={()=>takeItem(player.id,it)}>⟵ {typeof it==='string'? it : it.name}</button>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotesPanel({notes, onFollowNote}:{notes:GameNote[]; onFollowNote:(id:number)=>void}){
  return (
    <section
      id="notesPanel"
      className="col-span-12 rounded-lg border border-neutral-800 bg-neutral-900/40 p-6"
    >
      <h3 className="text-xl font-bold mb-4">🗒️ Notas encontradas</h3>
      {notes.length === 0 ? (
        <p className="text-neutral-500">Aún no has encontrado notas.</p>
      ) : (
        <div className="space-y-3">
          {notes.map(n => (
            <div key={n.id} className="rounded-xl border border-neutral-800/80 bg-neutral-900/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold">{n.title}</h4>
                  <p className="mt-1 text-sm text-neutral-300">{n.body}</p>
                  {n.hintLocation && (
                    <p className="mt-1 text-xs text-neutral-400">
                      Pista: <span className="text-neutral-200">{n.hintLocation}</span>
                    </p>
                  )}
                </div>
                {n.leadType && !n.resolved ? (
                  <button
                    onClick={() => onFollowNote(n.id)}
                    className="btn btn-primary text-neutral-900"
                  >
                    Seguir pista
                  </button>
                ) : (
                  <span className="text-xs text-green-400">✓ Resuelta</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CampTabs({
  activeTab,
  onSelectTab,
  inventoryState,
  campState,
}:{
  activeTab: "inv" | "camp" | "rep";
  onSelectTab: (tab:"inv"|"camp"|"rep")=>void;
  inventoryState: { stash: InventoryItem[]; players: Player[]; giveItem:(id:string,item:InventoryItem)=>void; takeItem:(id:string,item:any)=>void; };
  campState: {
    resources: Resources;
    setResources: React.Dispatch<React.SetStateAction<Resources>>;
    stash: InventoryItem[];
    setStash: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    camp: Camp;
    setCamp: React.Dispatch<React.SetStateAction<Camp>>;
  };
}){
  return (
    <section id="campTabs" className="col-span-12 rounded-lg border border-neutral-800 bg-neutral-900/40">
      <div className="flex border-b border-neutral-800">
        {(
          [
            { key: "inv" as const, label: "Inventario & Alijo" },
            { key: "camp" as const, label: "Campamento" },
            { key: "rep" as const, label: "Reparaciones" },
          ]
        ).map(tab => (
          <button
            key={tab.key}
            data-tab={tab.key}
            className={clsx("tab flex-1 text-left", activeTab === tab.key ? "active" : "")}
            onClick={()=>onSelectTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div id="tabContent" className="p-4 space-y-4">
        <div data-tabpanel="inv" className={activeTab === "inv" ? "" : "hidden"}>
          <InventoryTabPanel
            stash={inventoryState.stash}
            players={inventoryState.players}
            giveItem={inventoryState.giveItem}
            takeItem={inventoryState.takeItem}
          />
        </div>
        <div data-tabpanel="camp" className={activeTab === "camp" ? "" : "hidden"}>
          <CampResourcesTab
            resources={campState.resources}
            setResources={campState.setResources}
            stash={campState.stash}
            setStash={campState.setStash}
          />
        </div>
        <div data-tabpanel="rep" className={activeTab === "rep" ? "" : "hidden"}>
          <CampRepair
            resources={campState.resources}
            camp={campState.camp}
            setResources={campState.setResources}
            setCamp={campState.setCamp}
          />
        </div>
      </div>
    </section>
  );
}

function CampRepair({resources, camp, setResources, setCamp}:{resources:Resources; camp:Camp; setResources:React.Dispatch<React.SetStateAction<Resources>>; setCamp:React.Dispatch<React.SetStateAction<Camp>>}){
  const canRepairDefense = resources.materials >= 3 && camp.defense < 20;
  const canRepairComfort = resources.materials >= 2 && camp.comfort < 20;

  const repairDefense = () => {
    if(!canRepairDefense) return;
    setResources(prev => ({ ...prev, materials: prev.materials - 3 }));
    setCamp(prev => ({ ...prev, defense: Math.min(20, prev.defense + 2) }));
    gameLog("Reparación: +2 Defensa (coste 3 materiales)");
  };

  const repairComfort = () => {
    if(!canRepairComfort) return;
    setResources(prev => ({ ...prev, materials: prev.materials - 2 }));
    setCamp(prev => ({ ...prev, comfort: Math.min(20, prev.comfort + 2) }));
    gameLog("Reparación: +2 Comodidad (coste 2 materiales)");
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
      <h3 className="text-2xl font-bold mb-4">🛠️ Reparaciones del Campamento</h3>
      <p className="text-sm text-neutral-400 mb-4">
        Usa materiales para restaurar Defensa y Comodidad dañadas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={repairDefense}
          disabled={!canRepairDefense}
          className={`px-4 py-3 rounded-xl font-bold transition-all ${
            canRepairDefense ? 'bg-blue-900 hover:bg-blue-800' : 'bg-neutral-800 opacity-50 cursor-not-allowed'
          }`}
        >
          🛡️ Reparar Defensa (+2) — Coste: 3 🔨
        </button>

        <button
          onClick={repairComfort}
          disabled={!canRepairComfort}
          className={`px-4 py-3 rounded-xl font-bold transition-all ${
            canRepairComfort ? 'bg-green-900 hover:bg-green-800' : 'bg-neutral-800 opacity-50 cursor-not-allowed'
          }`}
        >
          🛏️ Reparar Comodidad (+2) — Coste: 2 🔨
        </button>
      </div>
    </div>
  );
}

const RESOURCE_CAPS: Record<keyof Resources, number> = {
  food: 50,
  water: 50,
  medicine: 20,
  fuel: 30,
  ammo: 120,
  materials: 40,
};

function CampResourcesTab({resources, setResources, stash, setStash}:{resources:Resources; setResources:React.Dispatch<React.SetStateAction<Resources>>; stash:InventoryItem[]; setStash:React.Dispatch<React.SetStateAction<InventoryItem[]>>}){
  const [openModal, setOpenModal] = useState<null | "food" | "medicine" | "ammo">(null);
  const total = Object.values(resources).reduce((a,b)=>a+b,0);
  const state = { camp: { resources, stash } };
  const setState = (next:any) => { setResources(next.camp.resources); setStash(next.camp.stash); };
  const labels: Record<keyof Resources, string> = {
    food: "Comida",
    water: "Agua",
    medicine: "Medicina",
    fuel: "Combustible",
    ammo: "Munición",
    materials: "Materiales",
  };
  const icons: Record<keyof Resources, string> = {
    food: "🍖",
    water: "💧",
    medicine: "💊",
    fuel: "⛽",
    ammo: "🔫",
    materials: "🔨",
  };
  const stockable: Record<string, true> = { food: true, medicine: true, ammo: true };
  return (
    <>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
        <ul className="space-y-3">
          {(Object.keys(resources) as (keyof Resources)[]).map(key => {
            const value = resources[key];
            const cap = RESOURCE_CAPS[key] ?? Math.max(1, value);
            const pct = Math.min(100, Math.round((value / Math.max(cap, 1)) * 100));
            return (
              <li key={key} className="flex items-center gap-4">
                <div className="flex w-32 items-center gap-2 text-sm text-neutral-200">
                  <span>{icons[key]}</span>
                  <span>{labels[key]}</span>
                </div>
                <div className="flex-1 h-2 rounded bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-neutral-200" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-16 text-right text-sm tabular-nums text-neutral-300">{value}</span>
                {stockable[key] ? (
                  <button
                    className="btn"
                    onClick={()=>setOpenModal(key as "food"|"medicine"|"ammo")}
                  >
                    Gestionar
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-neutral-500">Total almacenado: {total}</p>
      </div>
      <StockFoodModal isOpen={openModal === 'food'} onClose={()=>setOpenModal(null)} state={state} setState={setState} />
      <StockMedicineModal isOpen={openModal === 'medicine'} onClose={()=>setOpenModal(null)} state={state} setState={setState} />
      <StockAmmoModal isOpen={openModal === 'ammo'} onClose={()=>setOpenModal(null)} state={state} setState={setState} />
    </>
  );
}

function NoCardActions({
  onExplore,
  onPassNight,
  phase,
  explorationActive,
}: {
  onExplore: () => void;
  onPassNight: () => void;
  phase: Phase;
  explorationActive: boolean;
}) {
  return (
    <div className="card flex flex-wrap items-center gap-3 border-neutral-800 bg-neutral-900 p-6">
      <button
        onClick={onExplore}
        disabled={explorationActive}
        className={`px-6 py-3 rounded-xl font-bold transition-all ${
          explorationActive ? "bg-neutral-800 cursor-not-allowed opacity-60" : "bg-red-900 hover:bg-red-800"
        }`}
      >
        🧭 Explorar {explorationActive ? "(en curso...)" : "(saqueo y riesgo)"}
      </button>
      {(phase === "dusk" || phase === "night") && (
        <button className="btn btn-red text-white" onClick={onPassNight}>
          🌙 Pasar la noche
        </button>
      )}
      {(phase === "dawn" || phase === "day") && (
        <span className="text-sm text-neutral-400">El sol aún ofrece margen para actuar...</span>
      )}
    </div>
  );
}

function Bar({label, current, max, color}:{label:string; current:number; max:number; color:"green"|"blue"}){
  const pct = clamp((current/max)*100, 0, 100);
  const bg = color==="green"?"from-green-600 to-green-400":"from-blue-600 to-blue-400";
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <span className={current<max/3?"text-red-400 font-bold":""}>{current}/{max}</span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div className={clsx("h-full bg-gradient-to-r", bg)} style={{width:`${pct}%`}}/>
      </div>
    </div>
  );
}

function LogPanel({log}:{log:string[]}){
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el = ref.current;
    if(el) el.scrollTop = el.scrollHeight;
  }, [log.length]);
  return (
    <div className="card bg-neutral-900 border-neutral-800 p-6">
      <h3 className="text-xl font-bold mb-4">📜 Registro</h3>
      <div ref={ref} className="max-h-72 overflow-y-auto scrollbar-hide space-y-2">
        {log.length===0 ? <p className="text-neutral-500">Sin eventos aún.</p> :
          log.map((l,i)=>(<div key={i} className="p-2 bg-neutral-800/60 rounded">{l}</div>))
        }
      </div>
    </div>
  );
}

// === Helpers ===
function shuffle<T>(arr:T[]):T[]{
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
  return a;
}