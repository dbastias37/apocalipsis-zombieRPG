
import React, { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { ITEMS_CATALOG } from "./data/items";
import { GAME_NOTES, GameNote } from "./data/notes";
import WelcomeOverlay from "./components/WelcomeOverlay";
import CombatLogPanel from "./components/CombatLogPanel";
import { useTypewriterQueue } from "./hooks/useTypewriterQueue";
import type { AmmoBox, BackpackItem } from "./types/items";
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
import { getSelectedWeapon, isRangedWeapon } from "./systems/weapons";
import {
  listAmmoBoxes,
  listAmmoboxes,
  reloadSelectedWeapon,
  getLoadedAmmo,
  spendAmmo,
  totalAmmoInInventory,
} from "./systems/ammo";
import WeaponPicker from "./components/WeaponPicker";
import CombatEndSummary from "./components/overlays/CombatEndSummary";
import InfectionFatalModal from "./components/overlays/InfectionFatalModal";
import HealAllyModal from "./components/overlays/HealAllyModal";
import DayEndModal from "./components/overlays/DayEndModal";
import { day1DecisionCards } from "./data/days/day1/decisionCards.day1";
import { day2DecisionCards } from "./data/days/day2/decisionCards.day2";
import { day2ExplorationCards } from "./data/days/day2/explorationCards.day2";
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
const DAY_LENGTH_MIN = 35;
const DAY_LENGTH_MS = DAY_LENGTH_MIN * 60 * 1000;

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
  if (d === 2) return day2DecisionCards;
  return day1DecisionCards;
}

function getExplorationDeckForDay(d: number): ExplorationCard[] {
  if (d === 2) return day2ExplorationCards;
  return [];
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
  const [phase, setPhase] = useState<Phase>("dawn");
  const [clockMs, setClockMs] = useState<number>(DAY_LENGTH_MS);
  const [timeRunning, setTimeRunning] = useState(true);

  const [morale, setMorale] = useState(60);
  const [threat, setThreat] = useState(10);
  const [resources, setResources] = useState<Resources>({ food: 15, water: 15, medicine: 6, fuel: 10, ammo: 30, materials: 12 });
  const [camp, setCamp] = useState<Camp>({ defense: 10, comfort: 10 });

  const [players, setPlayers] = useState<Player[]>([
    mkPlayer("Sarah", "Médica"),
    mkPlayer("Marcus", "Soldado"),
    mkPlayer("Elena", "Psicóloga"),
  ].map(p => ({
    ...p,
    energy: p.energy ?? 100,
    energyMax: p.energyMax ?? 100,
    selectedWeaponId: p.selectedWeaponId ?? "fists",
    ammoByWeapon: p.ammoByWeapon ?? {},
  })));
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

  // overlay de fin de combate y fin de día
  const [showCombatEnd, setShowCombatEnd] = useState(false);
  const [combatEndLines, setCombatEndLines] = useState<string[]>([]);
  const [infectionDead, setInfectionDead] = useState<{id:string,name:string}|null>(null);
  const [showHealAlly, setShowHealAlly] = useState(false);
  const [showDayEnd, setShowDayEnd] = useState(false);
  const [dayEndLines, setDayEndLines] = useState<string[]>([]);

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
  // helper para pushear mensajes al panel
  function pushBattle(text: string, onDone?: () => void){
    const clean = text
      .replace(/\s*\n+\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    tw.push({ text: clean, onDone });
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

    const end = applyEndOfTurnConditions(ap, (msg)=>{ pushBattle?.(msg); pushLog?.(msg); });
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

  function endPlayerActionAwaitEnter(next: () => void) {
    const pid = activePlayerIdRef.current;
    if (pid) {
      setActedThisRound(m => ({ ...(m || {}), [pid]: true }));
    }
    // Guardar la continuación (llamada al presionar Enter en el panel)
    postActionContinueRef.current = next;
    // controlsLocked se mantiene true hasta que onContinue lo libere
  }

  const [foundNotes, setFoundNotes] = useState<GameNote[]>([]);
  const [explorationActive, setExplorationActive] = useState<boolean>(false);

  // Evento con cuenta regresiva
  const [timedEvent, setTimedEvent] = useState<TimedEvent|null>(null);

  // Registro de narrativa
  const [log, setLog] = useState<string[]>([]);

  // Cita visible

  const alivePlayers = players.filter(p => p.status !== "dead");
  const aliveEnemies = enemies;
  const activePlayer = activePlayerId ? players.find(p => p.id === activePlayerId) ?? null : null;
  const activeDown = !!activePlayer && activePlayer.hp <= 0;
  const canAttackWithSelected = (() => {
    const p = activePlayer;
    if (!p) return false;
    const w = getSelectedWeapon(p);
    if (isRangedWeapon(w)) {
      return getLoadedAmmo(p, w.id) > 0;
    }
    return true;
  })();

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
          pushLog(`⏳ El evento "${timedEvent.name}" venció y se resuelve automáticamente.`);
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
      pushLog("💀 La moral llegó a 0%. El grupo pierde la voluntad de vivir.");
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
      ammoByWeapon: {},
      backpackCapacity: 8,
    };
  }

  function start(){
    setState("playing");
    setLog([`📝 Día ${day}: El mundo ya no es el mismo.`]);
    setFoundNotes([]);
    setExplorationActive(false);
  }

  function pushLog(entry:string){
    setLog(prev => [entry, ...prev].slice(0,200));
  }

  function logMsg(s:string){
    if (typeof pushBattle === "function") pushBattle(s);
    if (typeof pushLog === "function") pushLog(s);
  }

  function formatTime(ms:number){
    let total = Math.max(0, ms/1000|0);
    const h = (total/3600|0).toString().padStart(2,"0");
    total %= 3600;
    const m = (total/60|0).toString().padStart(2,"0");
    const s = (total%60).toString().padStart(2,"0");
    return `${h}:${m}:${s}`;
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
      pushLog(phaseChangeText(newPhase));
      // efectos por fase
      if(newPhase==="night"){
        setThreat(t=>t+8);
        pushLog("🌙 La noche incrementa el peligro. (+Amenaza)");
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
    pushLog(`📅 Comienza el Día ${newDay}.`);

    // Resolución nocturna
    nightResolution();
    // Recuperación ligera
    setPlayers(ps=>ps.map(p => p.status!=="dead"
      ? {...p, energy: clamp(p.energy+1,0,p.energyMax)}
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
      pushLog("⚠️ Hambre en el campamento mina la moral.");
    }
    if(resources.water <= 0){
      setMorale(m=>clamp(m-10,0,100));
      pushLog("⚠️ Falta de agua provoca disputas y enfermedad.");
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
    pushLog("⏭️ Deciden aguantar hasta el amanecer...");
    endOfDay('manual');
  }

  function endOfDay(reason:'deck'|'timer'|'manual'='manual'){
    if(day===1){
      setDayEndLines(makeDaySummaryLines());
      setShowDayEnd(true);
      setControlsLocked(true);
      setTimeRunning(false);
      return;
    }
    setDiscardDecision([]);
    if(reason==='deck') pushLog("El mazo se agotó. La jornada termina y el grupo descansa.");

    if(phase !== 'night'){
      setThreat(t=>t+10);
      pushLog("La noche cae. La amenaza aumenta.");
      setPhase('night');
    }

    const upcoming = day + 1;
    nextDay(true);
    pushLog(`=== DÍA ${upcoming} COMIENZA (${reason === 'deck' ? 'mazo agotado' : reason === 'timer' ? 'fin del tiempo' : 'continuación'}) ===`);
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
    if(deck.length===0){ pushLog("No quedan cartas de combate."); return; }
    const card = deck[0];
    setCombatDeck(deck.slice(1));
    setCurrentCard(card);
    // activar enemigos según dificultad (simple)
    const count = Math.max(1, Math.floor((card.difficulty||12)/6));
    const spawned = Array.from({length: count}, ()=>cloneEnemy(baseEnemies[Math.floor(Math.random()*baseEnemies.length)]));
    setEnemies(spawned);
    pushLog(`⚔️ ¡Encuentro! (${spawned.length} enemigos)`);
  }
  function shuffleDecks(){
    setDecisionDeck(shuffle(decisionDeck));
    setCombatDeck(shuffle(combatDeck));
    pushLog("🔀 Barajas los mazos restantes.");
  }
  function recycleDiscards(){
    setDecisionDeck(d=>[...d, ...shuffle(discardDecision)]);
    setCombatDeck(d=>[...d, ...shuffle(discardCombat)]);
    setDiscardDecision([]);
    setDiscardCombat([]);
    pushLog("♻️ Reintegras descartes a los mazos.");
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
      pushLog(`⚔️ Tu decisión provocó un combate (${toSpawn}).`);
    }

    // narrativa
    pushLog(`📖 Decisión tomada: ${choice.text}`);

    // descartar carta o mantener si abre combate
    if (currentCard) {
      if (typeof toSpawn === 'number' && toSpawn > 0) {
        // mantener la carta actual convertida a 'combat'
      } else {
        if (currentCard.type === "decision") setDiscardDecision(d => [currentCard, ...d]);
        else setDiscardCombat(d => [currentCard, ...d]);
        setCurrentCard(null);
      }
    }
    if (!isEnemyPhaseRef.current && activePlayerIdRef.current) {
      setActedThisRound(m => ({ ...m, [activePlayerIdRef.current as string]: true }));
    }
    finalizeTurnWithEndConditions(() => {
      timePenalty(45);
      advanceTurn();
    });
  }

  // ——— Combate muy simplificado ———
  function cloneEnemy(e: Enemy): Enemy{ return { ...e, id: uid() }; }
  function spawnEnemies(count:number){
    const spawned = Array.from({length: count}, ()=>cloneEnemy(baseEnemies[Math.floor(Math.random()*baseEnemies.length)]));
    setEnemies(spawned);
    setStats(s => ({ ...s, battles: s.battles + 1 }));
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
      pushLog(`💀 ${p.name} cae para no levantarse jamás.`);
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
      pushLog(`✅ ${enemy.name} cae hecho trizas.`);
      setThreat(t => Math.max(0, t - 2));
      setStats(s => ({ ...s, kills: s.kills + 1 }));
      const tier = tierByEnemy(enemy);
      if (Math.random() < 0.6) {
        const drop = randomWeaponNameByTier(tier as any);
        const res = tryAddToBackpack(actor.id, drop);
        pushLog(`🧷 ${enemy.name} suelta ${drop}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
        setBattleStats(prev => ({ ...prev, lootNames: [...prev.lootNames, drop] }));
      }
      if (Math.random() < 0.05) {
        const name = "Ampliación de Mochila (+4)";
        const res = tryAddToBackpack(actor.id, name);
        pushLog(`🎁 Encuentras ${name}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
        setBattleStats(prev => ({ ...prev, lootNames: [...prev.lootNames, name] }));
      }
      const ammoDrop = maybeEnemyAmmoDrop();
      if (ammoDrop){
        const bp = [...(actor.backpack ?? []), ammoDrop];
        updatePlayer(actor.id, { backpack: bp });
        pushLog(`${actor.name} encuentra ${ammoDrop.name}.`);
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

    const w = getSelectedWeapon(actor);
    const flavor = weaponFlavorFrom(w.id, w.name, w.type);
    const isRanged = isRangedWeapon(w);
    const isMelee = w?.type === "melee";

    if (isRanged) {
      const loaded = getLoadedAmmo(actor, w.id);
      if (loaded <= 0) {
        const line = `${actor.name} intenta disparar ${w.name}, pero no tiene munición cargada.`;
        pushBattle(line);
        pushLog(line);
        endPlayerActionAwaitEnter(() => {});
        return;
      }
      const { player: updated, ok } = spendAmmo(actor, w.id, 1);
      if (!ok) {
        const line = `${actor.name} no logra disparar: el arma está vacía.`;
        pushBattle(line);
        pushLog(line);
        endPlayerActionAwaitEnter(() => {});
        return;
      }
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
      pushLog(missLine);
      setDayStats(s=>({
        ...s,
        misses: s.misses + 1,
        shotsFired: s.shotsFired + (isRanged ? 1 : 0),
      }));
      if (hasCondition(enemy.conditions, 'stunned')) {
        pushBattle(`${enemy.name} intenta reaccionar, pero está aturdido y no contraataca.`);
        endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
          timePenalty(45);
          advanceTurn();
        }));
        return;
      }
      endPlayerActionAwaitEnter(() => {
        // Genera contraataque
        const eff = pickCounterEffect(); // define o reutiliza tu helper
        const dmg = Math.floor(1 + Math.random()*10); // 1..10
        const effText = counterEffectText(eff);

        // Aplica daño al jugador activo
        applyDamageToPlayer(actor.id, dmg, enemy);

        // Aplica estado si corresponde
        if (eff === 'bleeding') {
          updatePlayer(actor.id, { conditions: addCondition(actor.conditions, { id:'bleeding', persistent:true }) });
        } else if (eff === 'stunned') {
          updatePlayer(actor.id, { conditions: addCondition(actor.conditions, { id:'stunned', turnsLeft:1 }) });
        } else if (eff === 'infected') {
          updatePlayer(actor.id, { conditions: addCondition(actor.conditions, { id:'infected', persistent:true, expiresAtMs: Date.now()+120000 }) });
        }

        // Línea principal del contraataque (20 variantes)
        const line = renderCounter(
          ENEMY_COUNTER_20[Math.floor(Math.random()*ENEMY_COUNTER_20.length)],
          { A: enemy.name, P: actor.name, D: dmg, EFF: effText }
        );
        pushBattle(line);

        // Línea extra de estado para dejar rastro claro
        if (eff === 'bleeding') {
          pushBattle(`🩸 Estado aplicado a ${actor.name}: Sangrado. Recomendación: curar antes de que siga perdiendo PV.`);
        } else if (eff === 'stunned') {
          pushBattle(`😵 Estado aplicado a ${actor.name}: Aturdido. Perderá su próximo turno.`);
        } else if (eff === 'infected') {
          pushBattle(`🧪 Estado aplicado a ${actor.name}: Infección. Debe usar medicina antes de 2:00 min.`);
        }

        // Enter final → fin de turno + registro de sangrado
        postActionContinueRef.current = () => finalizeTurnWithEndConditions(() => {
          timePenalty(45);
          advanceTurn();
        });
      });
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
          timePenalty(45);
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
    pushLog(line);

    setDayStats(s=>({
      ...s,
      damageDealt: s.damageDealt + dmg,
      shotsFired: s.shotsFired + (isRanged ? 1 : 0),
    }));

    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      timePenalty(45);
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
        pushLog(line);
        if (target.hp - dmg <= 0) {
          updatePlayer(target.id, { status: "dead" });
          pushLog(`💀 ${target.name} cae para no levantarse jamás.`);
        }
      } else {
        const missLine = `${enemy.name} falla al atacar a ${target.name}.`;
        pushBattle(missLine);
        pushLog(missLine);
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
    const start = applyStartOfTurnConditions(pl, (msg)=>{ pushBattle?.(msg); pushLog?.(msg); });
    if (start.newConditions) updatePlayer(pl.id, { conditions: start.newConditions });
    if (start.hpDelta) {
      const hp = clamp(pl.hp + start.hpDelta, 0, pl.hpMax);
      updatePlayer(pl.id, { hp, ...(hp<=0 ? { status:"dead" } : {}) });
      if (hp <= 0) {
        pushLog(`💀 ${pl.name} cae para no levantarse jamás.`);
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
    pushLog(`🛡️ ${actor.name} se cubre entre los escombros (+DEF temporal).`);
    pushBattle(`${actor.name} se cubre entre los escombros (+DEF temporal).`);
    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      timePenalty(45);
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

    if (isInf) {
      if ((resources.medicine ?? 0) <= 0) {
        pushBattle(`${p.name} necesita medicina para curar la infección.`);
        endPlayerActionAwaitEnter(()=>{});
        return;
      }
      setResources(r => ({ ...r, medicine: Math.max(0, (r.medicine ?? 0) - 1) }));
      updatePlayer(p.id, { conditions: removeCondition(p.conditions,'infected') });
      pushBattle(`${p.name} usa medicina y supera la infección.`);
      endPlayerActionAwaitEnter(()=> finalizeTurnWithEndConditions(() => {
        timePenalty(30);
        advanceTurn();
      }));
      return;
    }

    if (isBle) {
      updatePlayer(p.id, { conditions: removeCondition(p.conditions,'bleeding') });
      pushBattle(`${p.name} detiene la hemorragia y se estabiliza.`);
      endPlayerActionAwaitEnter(()=> finalizeTurnWithEndConditions(() => {
        timePenalty(20);
        advanceTurn();
      }));
      return;
    }

    if(resources.medicine<=0) {
      pushBattle(`Sin medicina suficiente.`);
      endPlayerActionAwaitEnter(()=>{});
      return;
    }
    const healAmt = Math.min(10, actor.hpMax - actor.hp);
    updatePlayer(actor.id, { hp: clamp(actor.hp+10, 0, actor.hpMax) });
    setResources(r=>({...r, medicine: Math.max(0, r.medicine-1)}));
    pushBattle(render(pick(HEAL_LINES), { P: actor.name, V: healAmt }));
    touchPlayerStats(actor.id);
    setBattleStats(prev => {
      const bp = prev.byPlayer[actor.id] ?? { meleeHits:0, meleeMisses:0, rangedHits:0, rangedMisses:0, heals:0, points:0 };
      const next = { ...bp, heals: bp.heals + 1 };
      next.points = (next.meleeHits + next.rangedHits) * 2 + next.heals * 1;
      return { ...prev, byPlayer: { ...prev.byPlayer, [actor.id]: next } };
    });
    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      timePenalty(45);
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
    if(fr.total>=15){
      pushLog("🏃 Huyen por pasillos colapsados. ¡Escape exitoso!");
      pushBattle(`${actor.name} ha escapado.`);
      setEnemies([]);
      setCurrentCard(null);
      setMorale(m=>clamp(m-3,0,100));
    } else {
      pushLog("⚠️ El escape falla, te rodean por un momento.");
      pushBattle(`${actor.name} no logra escapar.`);
    }
    endPlayerActionAwaitEnter(() => finalizeTurnWithEndConditions(() => {
      timePenalty(45);
      advanceTurn();
    }));
  }

  function computeCombatSummaryLines(): string[] {
    let mh=0, mm=0, rh=0, rm=0, heals=0, bestId:string|null=null, bestPts=-1;
    const nameById: Record<string,string> = {}; players.forEach(p=>nameById[p.id]=p.name);

    Object.entries(battleStats.byPlayer).forEach(([pid, st])=>{
      mh+=st.meleeHits; mm+=st.meleeMisses; rh+=st.rangedHits; rm+=st.rangedMisses; heals+=st.heals;
      if (st.points>bestPts){ bestPts=st.points; bestId=pid; }
    });
    const bestName = bestId ? (nameById[bestId] || "Jugador") : "Nadie";
    const loot = battleStats.lootNames ?? [];
    const lines: string[] = [];
    lines.push("— RESUMEN DEL ENFRENTAMIENTO —");
    lines.push(`Golpes directos: ${mh}`);
    lines.push(`Golpes fallidos: ${mm}`);
    lines.push(`Curaciones: ${heals}`);
    lines.push(`Disparos efectivos: ${rh}`);
    lines.push(`Disparos fallidos: ${rm}`);
    lines.push(`Mejor jugador de la batalla: ${bestName} (${Math.max(0,bestPts) || 0} pts)`);
    if (loot.length){
      const map: Record<string,number> = {};
      loot.forEach(n => map[n] = (map[n]||0)+1);
      lines.push("Botín:");
      Object.entries(map).forEach(([n,c]) => lines.push(`  • ${n} x${c}`));
    } else {
      lines.push("Botín: —");
    }
    lines.push("Recompensas: +1 Comida, +1 Agua, +1 Medicina, +1 Fuel, +1 Munición, +1 Materiales.");
    const total = mh*2 + rh*2 + heals;
    lines.push(`Total de puntos del grupo: ${total}`);
    return lines;
  }

  function grantCombatRewards() {
    setResources(r => ({
      ...r,
      food:(r.food??0)+1, water:(r.water??0)+1, medicine:(r.medicine??0)+1,
      fuel:(r.fuel??0)+1, ammo:(r.ammo??0)+1, materials:(r.materials??0)+1,
    }));
  }

  function openCombatEndIfCleared() {
    const aliveEnemies = (enemiesRef.current ?? []).filter(e=>e.hp>0);
    const inCombat = currentCard?.type === "combat" || isEnemyPhaseRef.current;
    if (!showCombatEnd && inCombat && aliveEnemies.length === 0) {
      setCombatEndLines(computeCombatSummaryLines());
      setShowCombatEnd(true);
      setControlsLocked(true);
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
    const start = applyStartOfTurnConditions(pl, (msg)=>{ pushBattle?.(msg); pushLog?.(msg); });
    if (start.newConditions) updatePlayer(pl.id, { conditions: start.newConditions });
    if (start.hpDelta) {
      const hp = clamp(pl.hp + start.hpDelta, 0, pl.hpMax);
      updatePlayer(pl.id, { hp, ...(hp<=0 ? { status:"dead" } : {}) });
      if (hp <= 0) {
        pushLog(`💀 ${pl.name} cae para no levantarse jamás.`);
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
        pushLog?.(line);
      });
    }
  }

  function setPlayerSelectedWeapon(playerId: string, weaponId: string) {
    updatePlayer(playerId, { selectedWeaponId: weaponId });
  }
  function backpackWeapons(p: Player) {
    return p.inventory
      .map(name => WEAPONS.find(w => w.name === name || w.id === name))
      .filter((w): w is any => !!w);
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
    pushLog(`Encuentras una nota: “${note.title}”${note.hintLocation ? ` (pista: ${note.hintLocation})` : ''}`);
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
      pushLog(`Sigues la pista hacia ${note.hintLocation ?? 'un lugar incierto'}: ¡${count} enemigos!`);
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
      pushLog(`Sigues la pista: ${note.hintLocation ?? 'ubicación secreta'} — caché encontrado.`);
    } else {
      pushLog("Esta nota no contiene pista accionable.");
    }
  }

  useEffect(() => {
    if (explorationActive && enemies.length === 0 && !currentCard) {
      setExplorationActive(false);
      pushLog("Evento de exploración resuelto.");
    }
  }, [enemies.length, currentCard, explorationActive]);

  // ——— Acciones fuera de combate ———
  function exploreArea(){
    if(explorationActive){
      pushLog("Ya hay una exploración/evento activo. Resuélvelo primero.");
      return;
    }
    setExplorationActive(true);
    setStats(s => ({ ...s, explorations: s.explorations + 1 }));

    if(explorationDeck.length > 0){
      const [card, ...rest] = explorationDeck;
      setExplorationDeck(rest);
      if(card.advanceMs) timePenalty(card.advanceMs/1000);
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
        pushLog(`Exploración interrumpida: ${card.title}`);
        if (!isEnemyPhaseRef.current && activePlayerIdRef.current) {
          setActedThisRound(m => ({ ...m, [activePlayerIdRef.current as string]: true }));
        }
        finalizeTurnWithEndConditions(() => {
          advanceTurn();
        });
        return;
      }
      pushLog(`🔎 ${card.title}`);
      pushLog(card.text);
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
      pushLog(`Exploración interrumpida: ¡${count} enemigos!`);
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
        pushLog(`🔎 Encuentras ${r.item}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
      } else {
        setStash(s=>[...s, r.item]);
        pushLog(`🔎 Encuentras ${r.item}. Guardado en el alijo.`);
      }
    }

    (function maybeFindWeaponOnExploration(playerId?: string){
      // 25% chance arma mid-tier
      if (Math.random() < 0.25) {
        const drop = randomWeaponNameByTier('mid');
        if (playerId) {
          const res = tryAddToBackpack(playerId, drop);
          pushLog(`🧰 En la exploración hallas ${drop}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
        } else {
          setStash(s=>[...s, drop]);
          pushLog(`🧰 En la exploración hallas ${drop}. Guardado en el alijo.`);
        }
      }
      // 3% chance de ampliación de mochila (si la usas)
      const BP_UP = "Ampliación de Mochila (+4)";
      if (Math.random() < 0.03) {
        if (playerId) {
          const res = tryAddToBackpack(playerId, BP_UP);
          pushLog(`🎒 Encuentras ${BP_UP}. Guardado en ${res.to === 'backpack' ? "tu mochila" : "el alijo"}.`);
        } else {
          setStash(s=>[...s, BP_UP]);
          pushLog(`🎒 Encuentras ${BP_UP}. Guardado en el alijo.`);
        }
      }
    })(activePlayer?.id);

    const ammoBox = maybeAmmoBox();
    if (ammoBox){
      const holderId = activePlayer?.id;
      if(holderId){
        const p = players.find(pl=>pl.id===holderId);
        const bp = [...(p?.backpack ?? []), ammoBox];
        updatePlayer(holderId, { backpack: bp });
        pushLog(`🧰 En la exploración hallas ${ammoBox.name}. Guardado en tu mochila.`);
      } else {
        setStash(s=>[...s, ammoBox.name]);
        pushLog(`🧰 En la exploración hallas ${ammoBox.name}. Guardado en el alijo.`);
      }
    }

    pushLog(`${ev.text} — Recompensa obtenida.`);
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
        pushLog("🚨 La sirena atrajo una horda lejana (+Amenaza, -Moral).");
      },
      onResolvePositive: () => {
        setResources(r=>({...r, materials: r.materials+2, fuel: r.fuel+1}));
        pushLog("🛠️ Neutralizan la sirena y recuperan piezas (+2 materiales, +1 combustible).");
      }
    };
    setTimedEvent(ev);
    pushLog("⏳ Evento activado: una barra indica el tiempo para resolverlo.");
  }

  function resolveTimedEventPositively(){
    if(!timedEvent) return;
    timedEvent.onResolvePositive?.();
    setTimedEvent(null);
    timePenalty(40);
  }

  function timePenalty(seconds:number){
    setClockMs(ms=> Math.max(0, ms - seconds*1000));
  }

  useEffect(()=>{
    console.debug("[state] state:", state, "timeRunning:", timeRunning, "day:", day);
  }, [state, timeRunning, day]);

  // ——— Inventario ———
  const [stash, setStash] = useState<string[]>(["Pistola","Botiquín","Linterna","Cuerda","Chatarra"]);

  // Capacidad de mochila
  function backpackUsed(p: Player){ return p.inventory.length; }
  function backpackCap(p: Player){ return p.backpackCapacity ?? 8; }

  // Añadir item intentando mochila y si no cabe, al alijo (stash)
  function tryAddToBackpack(playerId: string, itemName: string): {added:boolean, to:'backpack'|'stash'} {
    const p = players.find(pp=>pp.id===playerId);
    if(!p){ setStash(s=>[...s, itemName]); return {added:true, to:'stash'}; }
    if (backpackUsed(p) < backpackCap(p)) {
      updatePlayer(playerId, { inventory: [...p.inventory, itemName] });
      return { added:true, to:'backpack' };
    } else {
      setStash(s=>[...s, itemName]);
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

  function giveItemToPlayer(playerId:string, item:string){
    if(!stash.includes(item)) return;
    const p = players.find(pp=>pp.id===playerId);
    if(!p) return;
    if (backpackUsed(p) >= backpackCap(p)) { pushLog(`La mochila de ${p.name} está llena.`); return; }
    setStash(s=>{
      const idx = s.indexOf(item);
      const copy = [...s]; copy.splice(idx,1); return copy;
    });
    setPlayers(ps=> ps.map(p => p.id===playerId ? {...p, inventory: [...p.inventory, item]} : p));
  }
  function takeItemFromPlayer(playerId:string, item:string){
    setPlayers(ps=> ps.map(p => {
      if(p.id!==playerId) return p;
      const idx = p.inventory.indexOf(item);
      if(idx<0) return p;
      const inv = [...p.inventory]; inv.splice(idx,1);
      return {...p, inventory: inv};
    }));
    setStash(s=> [...s, item]);
  }

  function removePlayer(id:string){
    const p = players.find(x=>x.id===id);
    if(!p) return;
    if(!confirm(`Eliminar a ${p.name} de forma permanente?`)) return;
    setPlayers(ps => ps.filter(x=>x.id!==id));
    pushLog(`🩸 ${p.name} abandona la historia para siempre.`);
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
      <HeaderHUD
        day={day} phase={phase} clock={formatTime(clockMs)} progress={progressPercent(clockMs)}
        morale={morale} threat={threat}
        timeRunning={timeRunning} setTimeRunning={setTimeRunning}
        onPause={()=>setState("paused")}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Zonas principales */}
        <DeckControls
          onDrawDecision={drawDecision} onDrawCombat={drawCombat}
          onShuffle={shuffleDecks} onRecycle={recycleDiscards}
        />

        {currentCard ? (
          <CardView
            card={currentCard}
            onResolveChoice={resolveChoice}
            enemies={enemies}
            onAttack={performAttack}
            onDefend={defend}
            onHeal={healSelf}
            onHealAlly={() => { setShowHealAlly(true); setControlsLocked(true); }}
            onFlee={flee}
            controlsLocked={controlsLocked}
            isEnemyPhase={isEnemyPhase}
            canAttackWithSelected={canAttackWithSelected}
            activeDown={activeDown}
            onClose={()=>{
              if(currentCard.type==="decision") setDiscardDecision(d=>[currentCard, ...d]);
              else setDiscardCombat(d=>[currentCard, ...d]);
              setCurrentCard(null);
            }}
          />
        ) : (
          <NoCardActions onExplore={exploreArea} onPassNight={passNight} phase={phase} explorationActive={explorationActive} />
        )}

        {timedEvent && (
          <TimedEventBanner
            event={timedEvent}
            now={nowRef.current}
            onResolve={resolveTimedEventPositively}
          />
        )}

        {activePlayer && (
          <WeaponPicker
            player={activePlayer}
            backpack={backpackWeapons(activePlayer)}
            onSelect={(wid) => setPlayerSelectedWeapon(activePlayer.id, wid)}
          />
        )}
        <CombatLogPanel
          text={tw.text}
          typing={tw.typing}
          onEnter={() => tw.typing ? tw.skipTyping() : tw.continueNext()}
          onTypingChange={(typing) => {
            // Si hay una postAcción pendiente, el lock se mantiene, sino depende del typing
            setControlsLocked(!!postActionContinueRef.current || typing);
          }}
          onContinue={() => {
            const fn = postActionContinueRef.current;
            postActionContinueRef.current = null;
            setControlsLocked(false);
            if (typeof fn === "function") fn();
          }}
          currentActor={activePlayer?.name ?? (isEnemyPhase ? enemies[enemyIdx]?.name : undefined)}
        />

        <PartyPanel
          players={players}
          onUpdatePlayer={updatePlayer}
          onRemove={removePlayer}
          activePlayerId={activePlayerId ?? undefined}
          isEnemyPhase={isEnemyPhase}
        />

        <InventoryPanel
          stash={stash}
          players={players}
          giveItem={giveItemToPlayer}
          takeItem={takeItemFromPlayer}
          foundNotes={foundNotes}
          followNote={followNote}
        />

        <CampRepair
          resources={resources}
          camp={camp}
          setResources={setResources}
          setCamp={setCamp}
          pushLog={pushLog}
        />

        <CampPanel resources={resources} setResources={setResources} />

        <LogPanel log={log} />
      </main>

      {state==="paused" && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="p-8 rounded-2xl border border-neutral-700 bg-neutral-900 max-w-md w-full space-y-4">
            <h2 className="text-2xl font-bold text-red-400">Pausado</h2>
            <button className="btn btn-red text-white w-full" onClick={()=>{
              setState("playing");
              // reanudar queda en control del botón de play/pausa del HUD, no forzamos timeRunning
            }}>Continuar</button>
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

          const inf = hasCondition(target.conditions,'infected');
          const ble = hasCondition(target.conditions,'bleeding');

          if (inf) {
            setResources(r=>{
              const meds = r.medicine ?? 0;
              if (meds <= 0) {
                pushBattle(`${actor.name} intenta curar a ${target.name}, pero no hay medicina.`);
                if (ble) {
                  updatePlayer(target.id, { conditions: removeCondition(target.conditions,'bleeding') });
                  pushBattle(`${actor.name} logra detener la hemorragia de ${target.name}.`);
                  postActionContinueRef.current = ()=> finalizeTurnWithEndConditions(() => {
                    timePenalty(25);
                    advanceTurn();
                    setControlsLocked(false);
                  });
                } else {
                  postActionContinueRef.current = ()=> finalizeTurnWithEndConditions(() => {
                    timePenalty(10);
                    advanceTurn();
                    setControlsLocked(false);
                  });
                }
                return r;
              }
              const nr = { ...r, medicine: Math.max(0, meds - 1) };
              updatePlayer(target.id, { conditions: removeCondition(target.conditions,'infected') });
              pushBattle(`${actor.name} administra medicina a ${target.name} y supera la infección.`);
              if (ble) {
                updatePlayer(target.id, { conditions: removeCondition(target.conditions,'bleeding') });
                pushBattle(`Además, ${actor.name} consigue detener la hemorragia de ${target.name}.`);
              }
              postActionContinueRef.current = ()=> finalizeTurnWithEndConditions(() => {
                timePenalty(30);
                advanceTurn();
                setControlsLocked(false);
              });
              return nr;
            });
            return;
          }

          if (ble) {
            updatePlayer(target.id, { conditions: removeCondition(target.conditions,'bleeding') });
            pushBattle(`${actor.name} detiene la hemorragia de ${target.name}.`);
            postActionContinueRef.current = ()=> finalizeTurnWithEndConditions(() => {
              timePenalty(20);
              advanceTurn();
              setControlsLocked(false);
            });
            return;
          }

          pushBattle(`${actor.name} verifica a ${target.name}: no requiere curación ahora.`);
          postActionContinueRef.current = ()=> finalizeTurnWithEndConditions(() => {
            timePenalty(10);
            advanceTurn();
            setControlsLocked(false);
          });
        }}
        onClose={()=>{ setShowHealAlly(false); setControlsLocked(false); }}
      />
      <CombatEndSummary
        open={showCombatEnd}
        lines={combatEndLines}
        onFinish={() => {
          setShowCombatEnd(false);
          setControlsLocked(false);
          grantCombatRewards();

          setBattleStats({ byPlayer: {}, lootNames: [] });

          if (currentCard?.type === "combat") {
            setDiscardCombat(d => currentCard ? [currentCard, ...d] : d);
            setCurrentCard(null);
          }

          if (isEnemyPhase) {
            setIsEnemyPhase(false);
          }

          const alive = players.filter(p => p.hp > 0);
          const order = (turnOrder?.length ? turnOrder : alive.map(p => p.id));
          const firstId = order.find(pid => alive.some(p => p.id === pid)) ?? (alive[0]?.id ?? null);
          setActedThisRound(() => {
            const flags: Record<string,boolean> = {};
            alive.forEach(p => flags[p.id] = false);
            return flags;
          });
          setActivePlayerId(firstId ?? null);
        }}
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
          setShowDayEnd(false);
          setControlsLocked(false);
          setTimeRunning(true);
          setStats({ decisions:0, explorations:0, battles:0, kills:0 });
          nextDay(true);
          pushLog("— Comienza el Día 2 —");
        }}
      />
      <WelcomeOverlay />
    </div>
  );
}

// === Subcomponentes ===
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
  onAttack: (id:string)=>void;
  onDefend: ()=>void;
  onHeal: ()=>void;
  onHealAlly: ()=>void;
  onFlee: ()=>void;
  controlsLocked: boolean;
  isEnemyPhase: boolean;
  canAttackWithSelected: boolean;
  activeDown: boolean;
}){
  const isDecision = props.card.type==="decision";
  return (
    <div className={clsx("card p-6 animate-fade-in", isDecision?"card-purple":"card-red")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold">{props.card.title}</h3>
          <p className="text-neutral-300 mt-1">{props.card.text}</p>
        </div>
        <button className="btn btn-ghost" onClick={props.onClose}>✖</button>
      </div>

      {isDecision && props.card.choices && (
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {props.card.choices.map((c,i)=>(
            <button key={i} className="btn btn-purple text-white" onClick={()=>props.onResolveChoice(c)}>
              → {c.text}
            </button>
          ))}
        </div>
      )}

      {!isDecision && (
        <div className="mt-5 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {props.enemies.length===0 ? (
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="text-lg">🕊️ No quedan enemigos. La zona está momentáneamente segura.</p>
              </div>
            ) : (
              props.enemies.map(e=>{
                const isEnemyStunned = hasCondition(e.conditions, 'stunned');
                return (
                  <div key={e.id} className={[
                    "p-4 bg-neutral-900 rounded-xl border border-red-900",
                    isEnemyStunned ? "saturate-0 grayscale border-zinc-400/60" : "",
                  ].join(" ")}>
                    <div className="text-xs opacity-80 mb-1">
                      {isEnemyStunned && <span className="px-2 py-0.5 rounded bg-zinc-600/80">Aturdido</span>}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{e.name}</h4>
                        <p className="text-sm text-neutral-400">DEF {e.def} • ATK {e.atk}</p>
                      </div>
                      <button
                        className="btn btn-red text-white"
                        onClick={()=>{ if (props.controlsLocked || props.isEnemyPhase || props.activeDown || !props.canAttackWithSelected) return; props.onAttack(e.id); }}
                        disabled={props.controlsLocked || props.isEnemyPhase || props.activeDown || !props.canAttackWithSelected}
                      >
                        {props.canAttackWithSelected ? "🗡️ Atacar" : "Sin munición"}
                      </button>
                    </div>
                    <div className="mt-2 h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className={clsx("h-full", e.hp/e.hpMax>0.6?"bg-green-600":e.hp/e.hpMax>0.3?"bg-yellow-500":"bg-red-600")} style={{width:`${(e.hp/e.hpMax)*100}%`}}/>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="space-y-2">
            <button
              className="btn btn-ghost w-full"
              onClick={()=>{ if (props.controlsLocked || props.isEnemyPhase || props.activeDown) return; props.onDefend(); }}
              disabled={props.controlsLocked || props.isEnemyPhase || props.activeDown}
            >
              🛡️ Defender
            </button>
            <button
              onClick={()=>{ if (props.controlsLocked || props.isEnemyPhase || props.activeDown) return; props.onHealAlly(); }}
              disabled={props.controlsLocked || props.isEnemyPhase || props.activeDown}
              className="px-3 py-2 w-full rounded-xl border border-white/15 hover:bg-white/5"
            >
              Curar aliado
            </button>
            <button
              className="btn btn-ghost w-full"
              onClick={()=>{ if (props.controlsLocked || props.isEnemyPhase || props.activeDown) return; props.onHeal(); }}
              disabled={props.controlsLocked || props.isEnemyPhase || props.activeDown}
            >
              💊 Curarse
            </button>
            <button
              className="btn btn-ghost w-full"
              onClick={()=>{ if (props.controlsLocked || props.isEnemyPhase || props.activeDown) return; props.onFlee(); }}
              disabled={props.controlsLocked || props.isEnemyPhase || props.activeDown}
            >
              🏃 Huir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NoCardActions({onExplore, onPassNight, phase, explorationActive}:{onExplore:()=>void; onPassNight:()=>void; phase:Phase; explorationActive:boolean}){
  return (
    <div className="card bg-neutral-900 border-neutral-800 p-6 flex flex-wrap items-center gap-3">
      <button
        onClick={onExplore}
        disabled={explorationActive}
        className={`px-6 py-3 rounded-xl font-bold transition-all ${
          explorationActive ? 'bg-neutral-800 cursor-not-allowed opacity-60' : 'bg-red-900 hover:bg-red-800'
        }`}
      >
        🧭 Explorar {explorationActive ? '(en curso...)' : '(saqueo y riesgo)'}
      </button>
      {(phase==="dusk"||phase==="night") && (
        <button className="btn btn-red text-white" onClick={onPassNight}>🌙 Pasar la noche</button>
      )}
      {(phase==="dawn"||phase==="day") && (
        <span className="text-sm text-neutral-400">El sol aún ofrece margen para actuar...</span>
      )}
    </div>
  );
}

function TimedEventBanner({event, now, onResolve}:{event:TimedEvent; now:number; onResolve:()=>void}){
  const elapsed = Math.max(0, now - event.startedAt);
  const pct = clamp((elapsed/event.durationMs)*100, 0, 100);
  const remain = Math.max(0, event.durationMs - elapsed);
  const mm = String(Math.floor(remain/60000)).padStart(2,"0");
  const ss = String(Math.floor((remain%60000)/1000)).padStart(2,"0");
  return (
    <div className="card p-4 bg-gradient-to-br from-yellow-900/20 to-black border-yellow-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-yellow-300">Evento: {event.name}</h4>
          <p className="text-sm text-neutral-300">{event.text}</p>
        </div>
        <div className="min-w-[200px]">
          <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-red-600" style={{width:`${pct}%`}}/>
          </div>
          <div className="text-right text-xs text-neutral-400 mt-1">{mm}:{ss}</div>
        </div>
        <button className="btn btn-ghost" onClick={onResolve}>Resolver ahora</button>
      </div>
    </div>
  );
}

function PartyPanel({players, onUpdatePlayer, onRemove, activePlayerId, isEnemyPhase}:{players:Player[]; onUpdatePlayer:(id:string, patch:Partial<Player>)=>void; onRemove:(id:string)=>void; activePlayerId?: string; isEnemyPhase: boolean}){
  const alive = players.filter(p=>p.status!=="dead");
  const [selected, setSelected] = useState<string | null>(alive[0]?.id ?? null);
  useEffect(()=>{
    if(selected && !players.find(p=>p.id===selected)){ setSelected(alive[0]?.id ?? null); }
  }, [players]);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 card bg-neutral-900 border-neutral-800 p-6">
        <h3 className="text-xl font-bold mb-4">👥 Supervivientes</h3>
        <div className="grid sm:grid-cols-2 gap-3">
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
                "rounded-2xl border p-3 transition bg-neutral-800/50 border-neutral-700",
                (!isEnemyPhase && p.id === activePlayerId) ? "ring-2 ring-emerald-400 animate-pulse" : "",
                isDown ? "saturate-0 grayscale opacity-80" : "",
                isBleeding && !isDown ? "border-red-500/60" : "",
                isInfected && !isDown ? "border-emerald-400/60" : "",
              ].join(" ")}
            >
              <input
                className="text-sm font-semibold leading-tight bg-transparent border-b border-neutral-700 outline-none focus:border-red-500 w-full"
                value={p.name}
                onChange={(e)=>onUpdatePlayer(p.id,{ name: e.target.value })}
              />
              <div className="h-px bg-white/10 mt-1" />
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {isDown ? (
                  <span className="px-2 py-0.5 rounded bg-zinc-700/80 text-zinc-100">Fuera de combate</span>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded bg-white/10">Vivo</span>
                    {isBleeding && <span className="px-2 py-0.5 rounded bg-red-600/80">Sangrando</span>}
                    {isInfected && <span className="px-2 py-0.5 rounded bg-emerald-600/80">Infectado</span>}
                    {isStunned && <span className="px-2 py-0.5 rounded bg-zinc-500/80">Aturdido</span>}
                  </>
                )}
              </div>
              {isInfected && !isDown && (
                <div className="text-xs mt-1 opacity-80">
                  Tiempo para curarse: {mm}:{ss}
                </div>
              )}
              <p className="text-xs text-neutral-400">{p.profession}</p>
              <div className="mt-2">
                <Bar label="PV" current={p.hp} max={p.hpMax} color="green" />
                <Bar label="Energía" current={p.energy} max={p.energyMax} color="blue" />
              </div>

              <div className="text-xs text-neutral-400 mt-1">
                Mochila: {p.inventory.length}/{p.backpackCapacity ?? 8}
              </div>

              <div className="mt-2 flex gap-2">
                <button className="btn btn-ghost" onClick={()=>setSelected(p.id)}>Ver</button>
                {p.status!=="dead" && (
                  <button className="btn btn-red text-white" onClick={()=>onRemove(p.id)}>Eliminar</button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="card bg-neutral-900 border-neutral-800 p-6">
        <h3 className="text-xl font-bold mb-3">Detalles</h3>
        {selected ? (
          <Details player={players.find(p=>p.id===selected)!} onUpdate={(patch)=>onUpdatePlayer(selected, patch)} />
        ) : (
          <p className="text-neutral-500">Selecciona un personaje.</p>
        )}
      </div>
    </div>
  );
}

function Details({player, onUpdate}:{player:Player; onUpdate:(patch:Partial<Player>)=>void}){
  const selWeapon = getSelectedWeapon(player);
  const isFirearm = isRangedWeapon(selWeapon);
  const loaded = isFirearm ? getLoadedAmmo(player, selWeapon.id) : 0;
  const hasBoxes = listAmmoBoxes(player?.inventory).length > 0;
  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div>DEF: {player.defense}</div>
        <div>Inventario: {player.inventory.length}</div>
        <div>Estado: {player.status}</div>
      </div>
      <div className="text-xs mt-2">
        Arma actual: {selWeapon.name} · Daño {selWeapon.damageMin}-{selWeapon.damageMax} ·{" "}
        {isFirearm ? `Munición: ${loaded}` : "Munición: --"}
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
      {isFirearm && hasBoxes && (
        <button
          className="btn btn-sm mt-2"
          onClick={() => {
            const updated = reloadSelectedWeapon(player, pushBattle);
            onUpdate(updated);
          }}
        >
          Recargar arma
        </button>
      )}
    </div>
  );
}

function InventoryPanel({stash, players, giveItem, takeItem, foundNotes, followNote}:{stash:string[]; players:Player[]; giveItem:(id:string,item:string)=>void; takeItem:(id:string,item:string)=>void; foundNotes:GameNote[]; followNote:(id:number)=>void}){
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id ?? "");
  useEffect(()=>{
    if(!players.find(p=>p.id===selectedPlayer) && players[0]) setSelectedPlayer(players[0].id);
  }, [players]);
  const player = players.find(p=>p.id===selectedPlayer);
  return (
    <>
      <div className="card bg-neutral-900 border-neutral-800 p-6">
        <h3 className="text-xl font-bold mb-4">🎒 Inventario & Alijo</h3>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-sm text-neutral-400">Selecciona:</span>
          <select className="bg-neutral-800 rounded px-2 py-1" value={selectedPlayer} onChange={e=>setSelectedPlayer(e.target.value)}>
            {players.map(p=>(<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
        </div>
        {!player ? <p>Sin jugador</p> : (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-neutral-400 mb-1">Alijo del Campamento</h4>
              <div className="flex flex-wrap gap-2">
                {stash.length===0 ? <span className="text-xs text-neutral-500">Vacío</span> :
                  stash.map((it,i)=>(
                    <button key={i} className="btn btn-ghost" onClick={()=>giveItem(player.id,it)}>{it} ➜</button>
                  ))
                }
              </div>
            </div>
            <div>
              <h4 className="text-sm text-neutral-400 mb-1">Inventario de {player.name}</h4>
              <div className="flex flex-wrap gap-2">
                {player.inventory.length===0 ? <span className="text-xs text-neutral-500">Vacío</span> :
                  player.inventory.map((it,i)=>(
                    <button key={i} className="btn btn-ghost" onClick={()=>takeItem(player.id,it)}>⟵ {it}</button>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">🗒️ Notas encontradas</h3>
        {foundNotes.length === 0 ? (
          <p className="text-neutral-500">Aún no has encontrado notas.</p>
        ) : (
          <div className="space-y-3">
            {foundNotes.map(n => (
              <div key={n.id} className="p-4 bg-neutral-800 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{n.title}</h4>
                    <p className="text-sm text-neutral-300 mt-1">{n.body}</p>
                    {n.hintLocation && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Pista: <span className="text-neutral-200">{n.hintLocation}</span>
                      </p>
                    )}
                  </div>
                  {n.leadType && !n.resolved ? (
                    <button
                      onClick={() => followNote(n.id)}
                      className="px-3 py-2 bg-red-900 hover:bg-red-800 rounded-lg text-sm font-bold"
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
      </div>
    </>
  );
}

function CampRepair({resources, camp, setResources, setCamp, pushLog}:{resources:Resources; camp:Camp; setResources:React.Dispatch<React.SetStateAction<Resources>>; setCamp:React.Dispatch<React.SetStateAction<Camp>>; pushLog:(s:string)=>void}){
  const canRepairDefense = resources.materials >= 3 && camp.defense < 20;
  const canRepairComfort = resources.materials >= 2 && camp.comfort < 20;

  const repairDefense = () => {
    if(!canRepairDefense) return;
    setResources(prev => ({ ...prev, materials: prev.materials - 3 }));
    setCamp(prev => ({ ...prev, defense: Math.min(20, prev.defense + 2) }));
    pushLog("Reparación: +2 Defensa (coste 3 materiales)");
  };

  const repairComfort = () => {
    if(!canRepairComfort) return;
    setResources(prev => ({ ...prev, materials: prev.materials - 2 }));
    setCamp(prev => ({ ...prev, comfort: Math.min(20, prev.comfort + 2) }));
    pushLog("Reparación: +2 Comodidad (coste 2 materiales)");
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

function CampPanel({resources, setResources}:{resources:Resources; setResources:React.Dispatch<React.SetStateAction<Resources>>}){
  const total = Object.values(resources).reduce((a,b)=>a+b,0);
  return (
    <div className="card bg-neutral-900 border-neutral-800 p-6">
      <h3 className="text-xl font-bold mb-4">🏕️ Campamento</h3>
      <div className="grid sm:grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(resources).map(([k,v])=>(
          <div key={k} className="text-center p-3 rounded-xl bg-neutral-800">
            <div className="text-2xl mb-1">
              {k==="food"?"🍖":k==="water"?"💧":k==="medicine"?"💊":k==="fuel"?"⛽":k==="ammo"?"🔫":"🔨"}
            </div>
            <div className="text-xl font-bold">{v}</div>
            <div className="text-xs text-neutral-400">{k}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-500">Total almacenado: {total}</p>
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
  return (
    <div className="card bg-neutral-900 border-neutral-800 p-6">
      <h3 className="text-xl font-bold mb-4">📜 Registro</h3>
      <div className="max-h-72 overflow-y-auto scrollbar-hide space-y-2">
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