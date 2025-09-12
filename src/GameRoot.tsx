
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ITEMS_CATALOG } from "./data/items";
import { GAME_NOTES, GameNote } from "./data/notes";
import { day1DecisionCards as decisionData } from "./data/days/day1/decisionCards.day1";
import { combatCards as combatData } from "./data/combatCards";
import TurnOverlay from "./components/TurnOverlay";
import CountdownBar from "./components/CountdownBar";
import {
  createTimeState,
  tickTime,
  applyTimeCost,
  shouldAdvanceDay,
  advanceDay,
} from "./systems/time";
import {
  createTurnState,
  resetCupos,
  nextPlayer,
  type PlayerCupos,
} from "./systems/turns";
import {
  type CombatActor,
  setCooldown,
  tickCooldown,
  enemyImmediateStrike,
  dealDamage,
  isAlive,
} from "./systems/combat";
import { useLevel } from "@/state/levelStore";
import { DayHud } from "@/components/hud/DayHud";
import { TurnTransitionModal } from "@/components/overlays/TurnTransitionModal";
import StoryHome from "@/screens/StoryHome";
import PauseBanner from "@/components/PauseBanner";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import { useGameState } from "@/state/gameState";
import DayEndSummary from "./components/overlays/DayEndSummary";
import { gameLog } from "./utils/logger";
import StockAmmoModal from "./components/StockAmmoModal";
import ReloadModal from "./components/ReloadModal";
import { ensureBreathPlomoStyle } from "./components/util/breathPlomo";
import { canReloadFromBackpack } from "./systems/ammo";

// === Tipos ===
type Phase = "dawn" | "day" | "dusk" | "night";
type GameState = "menu" | "setup" | "playing" | "paused" | "victory" | "gameover";
type CardType = "decision" | "combat";

type Attributes = { Fuerza: number; Destreza: number; Constitucion: number; Inteligencia: number; Carisma: number };
type Player = {
  id: string;
  name: string;
  profession: string;
  bio?: string;
  hp: number; hpMax: number;
  energy: number; energyMax: number;
  defense: number;
  status: "ok"|"wounded"|"infected"|"dead";
  ammo: number;
  inventory: string[];
  attrs: Attributes;
  cupos: PlayerCupos;
};

type Enemy = { id: string; name: string; hp: number; hpMax: number; def: number; atk: number; special?: string; };
type Resources = { food: number; water: number; medicine: number; fuel: number; ammo: number; materials: number; };
type Camp = { defense: number; comfort: number };

type DayStats = {
  enemiesKilled: number;
  damageDealt: number;
  damageTaken: number;
  healsUsed: number;
  shotsFired: number;
  misses: number;
  escapes: number;
  decisionsTaken: number;
  exploresDone: number;
  itemsFound: number;
  timeSpentMs: number;
};

const initialDayStats: DayStats = {
  enemiesKilled: 0,
  damageDealt: 0,
  damageTaken: 0,
  healsUsed: 0,
  shotsFired: 0,
  misses: 0,
  escapes: 0,
  decisionsTaken: 0,
  exploresDone: 0,
  itemsFound: 0,
  timeSpentMs: 0,
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

type WeaponOpt = { id:'fists'|'knife'|'pistol'|'rifle'; label:string; usable:boolean; reason?:string };

// === Utilidades ===
const DAY_LENGTH_MIN = 35;
const DAY_LENGTH_MS = DAY_LENGTH_MIN * 60 * 1000;

function uid() { return Math.random().toString(36).slice(2,10); }
function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n));}

function roll(times:number, faces:number, mod=0){
  let total=0; const rolls:number[]=[];
  for(let i=0;i<times;i++){ const r = Math.floor(Math.random()*faces)+1; total+=r; rolls.push(r); }
  return { rolls, natural: total, total: total+mod, modifier: mod };
}

function mod(score:number){ return Math.floor((score-10)/2); }

function clsx(...classes: (string | false | null | undefined)[]){
  return classes.filter(Boolean).join(' ');
}
let startAttack = (enemyId: string) => {};

const professions = [
  { id: 'medic', name: 'Médica' },
  { id: 'soldier', name: 'Soldado' },
  { id: 'psychologist', name: 'Psicóloga' },
  { id: 'scavenger', name: 'Chatarrero' },
  { id: 'engineer', name: 'Ingeniero' },
];

const baseEnemies: Enemy[] = [
  { id: uid(), name: "Zombi Común", hp: 15, hpMax: 15, def: 10, atk: 2 },
  { id: uid(), name: "Corredor", hp: 10, hpMax: 10, def: 13, atk: 3 },
  { id: uid(), name: "Tanque", hp: 28, hpMax: 28, def: 8,  atk: 5 },
  { id: uid(), name: "Acechador", hp: 12, hpMax: 12, def: 15, atk: 4 },
];

// === Cartas ===
const decisionDataSafe = decisionData.filter(c => c.id >= 201 && c.id <= 245);
const decisionDeckSeed: Card[] = decisionDataSafe.map((c) => ({
  id: String(c.id),
  type: "decision",
  title: c.title,
  text: c.text,
  choices: c.choices,
}));

const combatDeckSeed: Card[] = combatData.map((c) => ({
  id: String(c.id),
  type: "combat",
  title: c.title,
  text: c.text,
}));

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
// Main gameplay component
export default function GameRoot(){
  const { phase: gamePhase, setPhase: setGamePhase, showWelcome, setShowWelcome } = useGameState();

  if (gamePhase !== 'running') {
    const handleStart = () => {
      setShowWelcome(false);
      setGamePhase('running');
    };

    return (
      <div className="relative min-h-screen bg-neutral-950 text-neutral-100">
        <StoryHome />
        {gamePhase === 'paused' && <PauseBanner />}
        {gamePhase === 'paused' && showWelcome && (
          <WelcomeOverlay onStart={handleStart} onClose={() => setShowWelcome(false)} />
        )}
      </div>
    );
  }

  // Estado base
  const [state, setState] = useState<GameState>("playing");
  const [day, setDay] = useState(1);
  React.useEffect(() => { (globalThis as any).__DAY = day; }, [day]);
  const [phase, setPhase] = useState<Phase>("dawn");
  const [clockMs, setClockMs] = useState<number>(DAY_LENGTH_MS);
  const [timeRunning, setTimeRunning] = useState(false);
  const [dayStats, setDayStats] = useState<DayStats>(initialDayStats);
  const [showDaySummary, setShowDaySummary] = useState(false);
  const [dayEndReason, setDayEndReason] = useState<"time_out" | "decks_exhausted" | "turns_exhausted" | "manual">("manual");

  const [morale, setMorale] = useState(60);
  const [threat, setThreat] = useState(10);
  const [resources, setResources] = useState<Resources>({ food: 15, water: 15, medicine: 6, fuel: 10, ammo: 30, materials: 12 });
  const [camp, setCamp] = useState<Camp>({ defense: 10, comfort: 10 });

  const [players, setPlayers] = useState<Player[]>([]);
  const [roster, setRoster] = useState<Player[]>([]);
  const [turn, setTurn] = useState(0);
  const alivePlayers = useMemo(()=>players.filter(p=>p.status!=="dead"), [players]);

  // Mazo de cartas
  const [decisionDeck, setDecisionDeck] = useState<Card[]>(shuffle([...decisionDeckSeed]));
  const [combatDeck, setCombatDeck] = useState<Card[]>(shuffle([...combatDeckSeed]));
  const [decisionDiscard, setDecisionDiscard] = useState<Card[]>([]);
  const [discardCombat, setDiscardCombat] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card|null>(null);
  const [tab, setTab] = useState<'story'|'manual'>('story');

  // Enemigos cuando hay combate
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  const [foundNotes, setFoundNotes] = useState<GameNote[]>([]);
  const [explorationActive, setExplorationActive] = useState<boolean>(false);

  // Evento con cuenta regresiva
  const [timedEvent, setTimedEvent] = useState<TimedEvent|null>(null);

  const [weaponChoices, setWeaponChoices] = useState<WeaponOpt[]|null>(null);
  const [pendingEnemyId, setPendingEnemyId] = useState<string|null>(null);

  useEffect(() => {
    const noDecision = decisionDeck.length === 0 && decisionDiscard.length === 0;
    const noCombat = combatDeck.length === 0 && discardCombat.length === 0;
    if (noDecision && noCombat && !showDaySummary) {
      setDayEndReason("decks_exhausted");
      setShowDaySummary(true);
    }
  }, [decisionDeck, decisionDiscard, combatDeck, discardCombat, showDaySummary]);

  // Registro de narrativa
  const [log, setLog] = useState<string[]>([]);

  // === Autosave ===
  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('save:v1');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (typeof data.day === 'number') setDay(data.day);
      if (typeof data.phase === 'string') setPhase(data.phase as Phase);
      if (typeof data.clockMs === 'number') setClockMs(data.clockMs);
      if (typeof data.timeRunning === 'boolean') setTimeRunning(data.timeRunning);
      if (typeof data.morale === 'number') setMorale(data.morale);
      if (typeof data.threat === 'number') setThreat(data.threat);
      if (data.resources) setResources(data.resources);
      if (data.camp) setCamp(data.camp);
      if (Array.isArray(data.players)) setPlayers(data.players);
      if (Array.isArray(data.roster)) setRoster(data.roster);
      if (typeof data.turn === 'number') setTurn(data.turn);
      if (Array.isArray(data.decisionDeck)) setDecisionDeck(data.decisionDeck);
      if (Array.isArray(data.combatDeck)) setCombatDeck(data.combatDeck);
      if (Array.isArray(data.decisionDiscard)) setDecisionDiscard(data.decisionDiscard);
      if (Array.isArray(data.discardCombat)) setDiscardCombat(data.discardCombat);
      if (data.currentCard) setCurrentCard(data.currentCard);
      if (Array.isArray(data.enemies)) setEnemies(data.enemies);
      if (Array.isArray(data.foundNotes)) setFoundNotes(data.foundNotes);
      if (typeof data.explorationActive === 'boolean') setExplorationActive(data.explorationActive);
      if (data.timedEvent) setTimedEvent(data.timedEvent);
      if (Array.isArray(data.log)) setLog(data.log);
    } catch {
      // ignore malformed save
    }
  }, []);

  // Save to localStorage whenever the game state changes
  useEffect(() => {
    const payload = JSON.stringify({
      day,
      phase,
      clockMs,
      timeRunning,
      morale,
      threat,
      resources,
      camp,
      players,
      roster,
      turn,
      decisionDeck,
      combatDeck,
      decisionDiscard,
      discardCombat,
      currentCard,
      enemies,
      foundNotes,
      explorationActive,
      timedEvent,
      log,
    });
    localStorage.setItem('save:v1', payload);
  }, [
    day,
    phase,
    clockMs,
    timeRunning,
    morale,
    threat,
    resources,
    camp,
    players,
    roster,
    turn,
    decisionDeck,
    combatDeck,
    decisionDiscard,
    discardCombat,
    currentCard,
    enemies,
    foundNotes,
    explorationActive,
    timedEvent,
    log,
  ]);

  const {
    dayState,
    initDay,
    markCardUsed,
    spendDecision,
    spendCombat,
    spendExplore,
    startExploreInstance,
    resolveExploreInstance,
    drawCard,
    endTurn,
    checkEndConditions,
    advanceToNextDay,
  } = useLevel();

  // Cita visible

  // Reloj del día
  useEffect(()=>{
    if(state!=="playing") return;
    let id: number|undefined;
    id = window.setInterval(()=>{
      if(!timeRunning) return;
      setClockMs(ms=>Math.max(0, ms - 1000));
    }, 1000);
    return ()=> clearInterval(id);
  }, [state, timeRunning]);

  useEffect(()=>{
    if(clockMs <= 0 && !showDaySummary){
      setDayEndReason("time_out");
      setShowDaySummary(true);
    }
  }, [clockMs, showDaySummary]);

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

  useEffect(() => {
    const reason = checkEndConditions();
    if (reason && !showDaySummary) {
      setDayEndReason(reason);
      setShowDaySummary(true);
    }
  }, [dayState.remainingMs, dayState.turnCounters, dayState.activeDecks, dayState.usedDecks, showDaySummary]);

  function createPlayer(name:string, professionId:string, bio:string = ""): Player{
    const attrs: Attributes = { Fuerza: 12, Destreza: 12, Constitucion: 13, Inteligencia: 11, Carisma: 11 };
    const hpMax = attrs.Constitucion*2 + 5;
    const prof = professions.find(p=>p.id===professionId);
    return {
      id: uid(),
      name,
      profession: prof?prof.name:professionId,
      bio,
      hp: hpMax, hpMax,
      energy: 10, energyMax: 10,
      defense: 10 + mod(attrs.Destreza),
      status: "ok",
      ammo: 20,
      inventory: ["Navaja"],
      attrs,
      cupos: resetCupos(),
    };
  }

  function startCampaign(initialPlayers: Player[]){
    setPlayers(initialPlayers);
    setRoster([]);
    setTurn(0);
    setDay(1);
    setPhase('dawn');
    setClockMs(DAY_LENGTH_MS);
    setTimeRunning(false);
    setMorale(60);
    setThreat(10);
    setResources({ food: 15, water: 15, medicine: 6, fuel: 10, ammo: 30, materials: 12 });
    setCamp({ defense: 10, comfort: 10 });
    setDecisionDeck(shuffle([...decisionDeckSeed]));
    setCombatDeck(shuffle([...combatDeckSeed]));
    setDecisionDiscard([]);
    setDiscardCombat([]);
    setCurrentCard(null);
    setEnemies([]);
    setFoundNotes([]);
    setExplorationActive(false);
    setTimedEvent(null);
    setLog(["=== CAMPAÑA INICIADA ===", "Crea tu historia. Pulsa ▶️ para comenzar el Día 1."]);
    setStash(["Pistola","Botiquín","Linterna","Cuerda","Chatarra"]);
    setState('paused');
    setTab('story');
    initDay(1, initialPlayers.map(p => p.name));
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
    setDayEndReason("manual");
    setShowDaySummary(true);
  }

  function endOfDay(reason:'deck'|'timer'|'manual'='manual'){
    advanceToNextDay((dayState.day + 1) as any);
    setDay(d => d + 1);
    setTurn(0);
    setDecisionDeck(shuffle([...decisionDeckSeed]));
    setDecisionDiscard([]);
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
    if(currentCard) return;
    if(decisionDeck.length===0){
      gameLog("No quedan cartas de decisión. Usa 'Integrar descartes' o 'Barajar restantes'.");
      return;
    }
    const [card, ...rest] = decisionDeck;
    setDecisionDeck(rest);
    setCurrentCard(card);
    markCardUsed("decision", Number(card.id));
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
    markCardUsed("combat", Number(card.id));
    const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
    if(actor) spendCombat(actor.name);
    const count = Math.max(1, Math.floor((card.difficulty||12)/6));
    const spawned = Array.from({length: count}, ()=>cloneEnemy(baseEnemies[Math.floor(Math.random()*baseEnemies.length)]));
    setEnemies(spawned);
    gameLog(`⚔️ ¡Encuentro! (${spawned.length} enemigos)`);
  }
  function shuffleDecisionRemaining(){
    setDecisionDeck(d=>shuffle(d));
    gameLog("🔀 Barajas las decisiones restantes.");
  }
  function mergeDecisionDiscards(){
    setDecisionDeck(d=>shuffle([...d, ...decisionDiscard]));
    setDecisionDiscard([]);
    gameLog("♻️ Reintegras descartes al mazo de decisiones.");
  }
  function resolveDecisionChoice(choice: NonNullable<Card["choices"]>[number]){
    if(choice.effect){
      const { morale: dm, threat: dt, spawnEnemies, zombies, advanceMs, ...rest } = choice.effect as any;
      if(dm) setMorale(m=>clamp(m+dm,0,100));
      if(dt) setThreat(t=>Math.max(0,t+dt));
      const resourceKeys: (keyof Resources)[] = ["food","water","medicine","fuel","ammo","materials"];
      setResources(r=>{
        const next = { ...r };
        resourceKeys.forEach(k=>{
          if(typeof rest[k] === "number"){ next[k] = Math.max(0, (r[k]??0) + (rest[k] as number)); delete rest[k]; }
        });
        return next;
      });
      if(zombies){
        const cardId = drawCard("combat");
        if(cardId != null){
          markCardUsed("combat", cardId);
          const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
          if(actor) spendCombat(actor.name);
        }
        const spawned = Array.from({length: zombies}, ()=>cloneEnemy(baseEnemies[Math.floor(Math.random()*baseEnemies.length)]));
        setEnemies(spawned);
        setCurrentCard({ ...(currentCard as Card), type: "combat" });
        gameLog(`⚔️ Tu decisión provocó un combate (${spawned.length}).`);
      }
      if(rest.karma){ gameLog(`🔮 Karma ${rest.karma>0?"+":""}${rest.karma}`); }
      if(rest.survivors){ gameLog(`👥 Se unen ${rest.survivors} supervivientes.`); }
      if(typeof advanceMs === "number"){
        const ms = Math.max(0, advanceMs);
        setClockMs(v=>Math.max(0, v - ms));
        setDayStats(s=>({ ...s, timeSpentMs: s.timeSpentMs + ms }));
      }
    }
    gameLog(`📖 Decisión tomada: ${choice.text}`);
    setDayStats(s=>({ ...s, decisionsTaken: s.decisionsTaken + 1 }));
    if(currentCard){
      if(currentCard.type==="decision") setDecisionDiscard(d=>[currentCard, ...d]);
      else setDiscardCombat(d=>[currentCard, ...d]);
    }
    if(currentCard?.type === "decision"){
      const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
      if(actor) spendDecision(actor.name);
    }
    setCurrentCard(null);
    advanceTurn(); timePenalty(45);
  }

  // ——— Combate muy simplificado ———
  function cloneEnemy(e: Enemy): Enemy{ return { ...e, id: uid() }; }
  function spawnEnemies(count:number){
    const cardId = drawCard("combat");
    if(cardId != null){
      markCardUsed("combat", cardId);
      const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
      if(actor) spendCombat(actor.name);
    }
    const spawned = Array.from({length: count}, ()=>cloneEnemy(baseEnemies[Math.floor(Math.random()*baseEnemies.length)]));
    setEnemies(spawned);
  }
  function hasItem(actor:any, q:string){
    const norm = (s:string)=>s.normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase();
    const QQ = norm(q);
    return Array.isArray(actor?.inventory) && actor.inventory.some((it:string)=> norm(String(it)) === QQ);
  }

  function listWeaponOptions(actor:any): WeaponOpt[] {
    const out: WeaponOpt[] = [
      { id:'fists', label:'Puños (1–2)', usable:true },
    ];
    if (hasItem(actor, 'Navaja')) out.push({ id:'knife', label:'Navaja (1–6)', usable:true });

    const ammo = Math.max(0, Number(actor?.ammo ?? 0));
    if (hasItem(actor, 'Pistola')) out.push({
      id:'pistol', label:`Pistola (2–8) — Munición: ${ammo}`, usable: ammo>0, reason: ammo>0?undefined:'Sin munición'
    });
    if (hasItem(actor, 'Rifle')) out.push({
      id:'rifle', label:`Rifle (3–10) — Munición: ${ammo}`, usable: ammo>0, reason: ammo>0?undefined:'Sin munición'
    });

    return out;
  }

  startAttack = function(enemyId:string){
    const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
    if (!actor) return;

    const opts = listWeaponOptions(actor);
    const usable = opts.filter(o=>o.usable);

    if (usable.length === 0) {
      gameLog("No tienes armas utilizables (falta munición o arma).");
      return;
    }
    if (usable.length === 1) {
      applyAttack(enemyId, usable[0].id);
      return;
    }
    setWeaponChoices(opts);
    setPendingEnemyId(enemyId);
  };

  function applyAttack(enemyId:string, weaponId:'fists'|'knife'|'pistol'|'rifle'){
    const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
    if(!actor) return;
    const enemy = enemies.find(e=>e.id===enemyId);
    if(!enemy) return;

    let label = 'Puños', dmgMin=1, dmgMax=2, hitMod = mod(actor.attrs.Fuerza);
    if (weaponId==='knife') { label='Navaja'; dmgMin=1; dmgMax=6; hitMod = mod(actor.attrs.Fuerza)+1; }
    if (weaponId==='pistol') { label='Pistola'; dmgMin=2; dmgMax=8; hitMod = mod(actor.attrs.Destreza)+4; }
    if (weaponId==='rifle')  { label='Rifle';  dmgMin=3; dmgMax=10; hitMod = mod(actor.attrs.Destreza)+5; }

    const isFirearm = weaponId==='pistol' || weaponId==='rifle';
    if (isFirearm) {
      if (actor.ammo <= 0) { gameLog(`${actor.name} intenta disparar, pero no tiene munición.`); return; }
      updatePlayer(actor.id, { ammo: Math.max(0, actor.ammo-1) });
      gameLog(`🔫 ${actor.name} dispara ${label} (munición restante: ${Math.max(0, actor.ammo-1)}).`);
    }

    const atkRoll = roll(1,20, hitMod);
    const hit = atkRoll.total >= enemy.def || atkRoll.natural===20;
    const scene = currentCard?.scene ?? "callejon";

    if(hit){
      const dmg = roll(1, dmgMax - dmgMin + 1, dmgMin-1).total; // uniforme entre min–max
      const newHp = enemy.hp - dmg;
      setEnemies(es=> es.map(e=> e.id===enemyId ? {...e, hp: newHp} : e).filter(e=> e.hp>0));
      gameLog(`🗡️ ${actor.name} ataca en el ${scene} y asesta ${dmg} de daño a ${enemy.name} con ${label}.`);
      setDayStats(s=>({ ...s, damageDealt: s.damageDealt + dmg, shotsFired: s.shotsFired + (isFirearm?1:0) }));
      if(newHp<=0){
        gameLog(`✅ ${enemy.name} cae hecho trizas.`);
        setThreat(t=>Math.max(0,t-2));
        setDayStats(s=>({ ...s, enemiesKilled: s.enemiesKilled + 1 }));
      }
    } else {
      gameLog(`❌ ${actor.name} falla el golpe con ${label}.`);
      setDayStats(s=>({ ...s, misses: s.misses + 1, shotsFired: s.shotsFired + (isFirearm?1:0) }));
    }

    timePenalty(10); // o el coste que uses
    advanceTurn();
  }

  function performAttack(enemyId: string){
    applyAttack(enemyId, 'fists');
  }

  function enemyTurn(){
    if(enemies.length===0) return;
    const target = alivePlayers[Math.floor(Math.random()*alivePlayers.length)];
    if(!target) return;
    const atkRoll = roll(1,20, 2);
    if(atkRoll.total >= target.defense){
      const dmg = roll(1,6,2).total;
      updatePlayer(target.id, { hp: Math.max(0, target.hp - dmg) });
      gameLog(`💥 ${enemies[0].name} golpea a ${target.name}: -${dmg} PV.`);
      setDayStats(s=>({ ...s, damageTaken: s.damageTaken + dmg }));
      if(target.hp - dmg <= 0){
        updatePlayer(target.id, { status: "dead" });
        gameLog(`💀 ${target.name} cae para no levantarse jamás.`);
        setMorale(m=>clamp(m-12,0,100));
      }
    }else{
      gameLog(`🛡️ ${target.name} esquiva entre sombras.`);
    }
  }

  function defend(){
    const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
    if(!actor) return;
    updatePlayer(actor.id, { defense: actor.defense + 3 });
    gameLog(`🛡️ ${actor.name} se cubre entre los escombros (+DEF temporal).`);
    timePenalty(10); advanceTurn();
  }

  function healSelf(){
    const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
    if(!actor || resources.medicine<=0) { gameLog("Sin medicina suficiente."); return; }
    updatePlayer(actor.id, { hp: clamp(actor.hp+10, 0, actor.hpMax) });
    setResources(r=>({...r, medicine: Math.max(0, r.medicine-1)}));
    gameLog(`💊 ${actor.name} se venda rápido (+10 PV).`);
    setDayStats(s=>({ ...s, healsUsed: s.healsUsed + 1 }));
    timePenalty(25); advanceTurn();
  }

  function flee(){
    if(enemies.length===0) return;
    const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
    if(!actor) return;
    const fr = roll(1,20, mod(actor.attrs.Destreza));
    if(fr.total>=15){
      gameLog("🏃 Huyen por pasillos colapsados. ¡Escape exitoso!");
      setEnemies([]);
      setCurrentCard(null);
      setMorale(m=>clamp(m-3,0,100));
    } else {
      gameLog("⚠️ El escape falla, te rodean por un momento.");
    }
    setDayStats(s=>({ ...s, escapes: s.escapes + 1 }));
    timePenalty(30); advanceTurn();
  }

  function advanceTurn(){
    const reason = checkEndConditions();
    if (reason) {
      setDayEndReason(reason);
      setShowDaySummary(true);
      return;
    }
    endTurn();
    const next = (turn+1) % Math.max(1, alivePlayers.length);
    setTurn(next);
  }

  function updatePlayer(id:string, patch: Partial<Player>){
    setPlayers(ps=> ps.map(p => p.id===id ? {...p, ...patch} : p));
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
    if(explorationActive || dayState.activeExploreInstance){
      gameLog("Ya hay una exploración/evento activo. Resuélvelo primero.");
      return;
    }
    const cardId = drawCard("explore");
    if(cardId == null){
      gameLog("No quedan eventos de exploración.");
      return;
    }
    startExploreInstance(cardId);
    markCardUsed("explore", cardId);
    const actor = alivePlayers[turn % Math.max(1, alivePlayers.length)];
    if(actor) spendExplore(actor.name);
    setExplorationActive(true);

    timePenalty(60 + Math.floor(Math.random()*60));

    const roll = Math.random();
    if(roll < 0.2){
      const count = 1 + Math.floor(Math.random()*3);
      spawnEnemies(count);
      setCurrentCard({ id: uid(), type: "combat", title: "Encuentro inesperado", text: "Durante la exploración aparecen enemigos." });
      gameLog(`Exploración interrumpida: ¡${count} enemigos!`);
      setExplorationActive(false);
      resolveExploreInstance(cardId);
      advanceTurn();
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

    if(r.item){
      const vivos = players.filter(p=>p.status!=="dead");
      if(vivos.length>0){
        const pick = vivos[Math.floor(Math.random()*vivos.length)];
        const idx = players.findIndex(p=>p.id===pick.id);
        updatePlayer(pick.id, { inventory: [...players[idx].inventory, r.item] });
      }
    }

    setDayStats(s=>({
      ...s,
      exploresDone: s.exploresDone + 1,
      itemsFound: s.itemsFound + (r.item ? 1 : 0),
    }));

    gameLog(`${ev.text} — Recompensa obtenida.`);
    setExplorationActive(false);
    resolveExploreInstance(cardId);
    advanceTurn();
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
    setClockMs(prev=> Math.max(0, prev - ms));
    setDayStats(s=>({ ...s, timeSpentMs: s.timeSpentMs + ms }));
  }

  // ——— Inventario ———
  const [stash, setStash] = useState<string[]>(["Pistola","Botiquín","Linterna","Cuerda","Chatarra"]);
  function giveItemToPlayer(playerId:string, item:string){
    if(!stash.includes(item)) return;
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
    gameLog(`🩸 ${p.name} abandona la historia para siempre.`);
    setMorale(m=>clamp(m-6,0,100));
  }

  function CharacterSetupPanel(){
    const [name, setName] = useState('');
    const [professionId, setProfessionId] = useState(professions[0]?.id || 'medic');
    const [bio, setBio] = useState('');

    function addToRoster(){
      const trimmed = name.trim();
      if(!trimmed) return;
      const newP = createPlayer(trimmed, professionId, bio.trim());
      setRoster(prev=>[...prev, newP]);
      setName('');
      setBio('');
    }

    function removeFromRoster(id:string){
      setRoster(prev=>prev.filter(p=>p.id!==id));
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950 text-neutral-100">
        <header className="sticky top-0 z-40 bg-gradient-to-b from-black via-neutral-950/95 to-transparent backdrop-blur-md border-b border-red-900/50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">🧟 APOCALIPSIS ZOMBIE RPG</h1>
            <button onClick={()=>setState('menu')} className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-700">🏠 Menú</button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-2 border-red-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Crear personaje</h2>

            <label className="text-sm text-neutral-400">Nombre</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg outline-none focus:border-red-600 mb-3" placeholder="Ej: Sarah" />

            <label className="text-sm text-neutral-400">Profesión</label>
            <select value={professionId} onChange={e=>setProfessionId(e.target.value)} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg outline-none focus:border-red-600 mb-3">
              {professions.map(p=>(<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>

            <label className="text-sm text-neutral-400">Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} className="w-full px-3 py-2 h-28 bg-neutral-900 border border-neutral-700 rounded-lg outline-none focus:border-red-600" placeholder="Breve historia o rasgos del personaje..." />

            <button onClick={addToRoster} className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-bold transition-all">➕ Agregar al roster</button>
          </div>

          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-2 border-red-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Roster</h2>

            {roster.length===0 ? (
              <p className="text-neutral-400">Aún no hay personajes creados.</p>
            ) : (
              <div className="space-y-3">
                {roster.map(p=>(
                  <div key={p.id} className="p-4 rounded-xl border-2 border-neutral-800 bg-neutral-900/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-lg">{p.name}</div>
                        <div className="text-sm text-neutral-400">{p.profession}</div>
                        {p.bio && <div className="text-xs text-neutral-500 mt-2 italic">{p.bio}</div>}
                      </div>
                      <button onClick={()=>removeFromRoster(p.id)} className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded-lg text-sm">🗑️ Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={()=>startCampaign(roster)} disabled={roster.length===0} className={`mt-6 w-full px-4 py-3 rounded-xl font-bold transition-all ${roster.length===0?'bg-neutral-800 cursor-not-allowed':'bg-green-700 hover:bg-green-600'}`}>▶️ Iniciar campaña</button>
          </div>
        </main>
      </div>
    );
  }

  // ——— UI ———
  if(state==="menu"){
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Apocalipsis Zombie RPG</h1>
          <p className="mt-3 text-neutral-300">Sistema ligero con mazos, tiempo real y supervivencia.</p>
          <div className="mt-10 space-x-3">
            <button className="btn btn-red text-white" onClick={()=>setState('playing')}>🧰 CREAR PERSONAJES</button>
          </div>
          <div className="mt-16 text-neutral-400 text-sm">
            <p>Consejo: las acciones consumen tiempo del día. La noche es peligrosa.</p>
          </div>
        </div>
      </div>
    );
  }

  // (disabled) if(state==='setup') return <CharacterSetupPanel/>;

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
      <DayHud />
      <TurnTransitionModal />
      <HeaderHUD
        day={day} phase={phase} clock={formatTime(clockMs)} progress={progressPercent(clockMs)}
        morale={morale} threat={threat}
        timeRunning={timeRunning} setTimeRunning={setTimeRunning}
        onPause={()=>setState("paused")}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-2">
          <button className={tab==='story'?"btn btn-red text-white":"btn btn-ghost"} onClick={()=>setTab('story')}>📖 Historia</button>
          <button className={tab==='manual'?"btn btn-red text-white":"btn btn-ghost"} onClick={()=>setTab('manual')}>📕 Manual</button>
        </div>

        {tab==='manual' ? (
          <ManualTab />
        ) : (
          <>
            {/* Zonas principales */}
            <DeckControls
              onDrawDecision={drawDecision}
              onShuffleDecision={shuffleDecisionRemaining}
              onMergeDecision={mergeDecisionDiscards}
            />

            {currentCard ? (
              <CardView
                card={currentCard}
                onResolveChoice={resolveDecisionChoice}
                enemies={enemies}
                onDefend={defend}
                onHeal={healSelf}
                onFlee={flee}
                onClose={()=>{
                  if(currentCard.type==="decision") setDecisionDiscard(d=>[currentCard, ...d]);
                  else setDiscardCombat(d=>[currentCard, ...d]);
                  setCurrentCard(null);
                }}
              />
            ) : (
              <NoCardActions onExplore={exploreArea} onPassNight={passNight} phase={phase} explorationActive={explorationActive || !!dayState.activeExploreInstance} />
            )}

            {timedEvent && (
              <TimedEventBanner
                event={timedEvent}
                now={nowRef.current}
                onResolve={resolveTimedEventPositively}
              />
            )}

            <PartyPanel
              players={players}
              onUpdatePlayer={updatePlayer}
              onRemove={removePlayer}
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
            />

            <CampPanel
              resources={resources}
              setResources={setResources}
              players={players}
              setPlayers={setPlayers}
              turn={turn}
            />

            <LogPanel log={log} />
          </>
        )}
      </main>

      {showDaySummary && (
        <DayEndSummary
          day={day}
          stats={dayStats}
          reason={dayEndReason}
          onNext={()=>{
            setShowDaySummary(false);
            const map = { time_out: 'timer', decks_exhausted: 'deck', turns_exhausted: 'manual', manual: 'manual' } as const;
            endOfDay(map[dayEndReason]);
            setDayStats(initialDayStats);
            gameLog(`📅 Día ${day+1} comienza. El grupo descansa y hace balance de la jornada.`);
          }}
        />
      )}
      {weaponChoices && pendingEnemyId && (
        <div className="fixed inset-0 grid place-items-center bg-black/60 z-50">
          <div className="w-[480px] rounded-lg bg-neutral-900 p-4 border border-neutral-700">
            <h3 className="text-lg font-bold mb-3">Elegir arma</h3>
            <div className="space-y-2">
              {weaponChoices.map(w=>(
                <button key={w.id}
                  disabled={!w.usable}
                  title={!w.usable ? w.reason : undefined}
                  onClick={()=>{ setWeaponChoices(null); const eid = pendingEnemyId; setPendingEnemyId(null); if (w.usable && eid) applyAttack(eid, w.id); }}
                  className={`w-full text-left px-3 py-2 rounded border ${w.usable ? 'border-slate-500 hover:bg-slate-800' : 'border-slate-700 opacity-50 cursor-not-allowed'}`}
                >
                  {w.label} {!w.usable && w.reason ? `— ${w.reason}` : ''}
                </button>
              ))}
            </div>
            <div className="mt-3 text-right">
              <button className="px-3 py-1 rounded bg-slate-700" onClick={()=>{ setWeaponChoices(null); setPendingEnemyId(null); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {state==="paused" && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="p-8 rounded-2xl border border-neutral-700 bg-neutral-900 max-w-md w-full space-y-4">
            <h2 className="text-2xl font-bold text-red-400">Pausado</h2>
            <button className="btn btn-red text-white w-full" onClick={()=>setState("playing")}>Reanudar</button>
          </div>
        </div>
      )}
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

function ManualTab(){
  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Manual</h2>
      <ul className="list-disc pl-6 space-y-2 text-neutral-300">
        <li>Objetivo: sobrevivir, mantener moral y recursos, y tomar decisiones.</li>
        <li>Fases del día: alba, día, ocaso, noche. (En este paso el tiempo aún no está activo.)</li>
        <li>Cartas: decisiones (moradas) y combate (rojas). Se resolverán en sus mazos.</li>
        <li>Explorar: abre instancias con riesgos y recompensas.</li>
        <li>Game Over: moral 0% o sin supervivientes.</li>
      </ul>
    </div>
  );
}

function DeckControls(props: { onDrawDecision:()=>void; onShuffleDecision:()=>void; onMergeDecision:()=>void }){
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-purple text-white" onClick={props.onDrawDecision}>🎴 Robar decisión</button>
      <button className="btn btn-ghost" onClick={props.onShuffleDecision}>🔀 Barajar restantes</button>
      <button className="btn btn-ghost" onClick={props.onMergeDecision}>♻️ Integrar descartes</button>
    </div>
  );
}

function CardView(props:{
  card: Card;
  onResolveChoice: (choice: NonNullable<Card["choices"]>[number])=>void;
  onClose: ()=>void;
  enemies: Enemy[];
  onDefend: ()=>void;
  onHeal: ()=>void;
  onFlee: ()=>void;
}){
  const isDecision = props.card.type==="decision";
  const containerCls = isDecision ? "bg-gradient-to-br from-purple-900/30 to-black border-2 border-purple-700" : "card-red";
  return (
    <div className={clsx("card p-6 animate-fade-in", containerCls)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={clsx("text-2xl font-bold", isDecision && "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600")}>{props.card.title}</h3>
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
              props.enemies.map(e=>(
                <div key={e.id} className="p-4 bg-neutral-900 rounded-xl border border-red-900">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{e.name}</h4>
                      <p className="text-sm text-neutral-400">DEF {e.def} • ATK {e.atk}</p>
                    </div>
                    <button className="btn btn-red text-white" onClick={()=> startAttack(e.id)}>🗡️ Atacar</button>
                  </div>
                  <div className="mt-2 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className={clsx("h-full", e.hp/e.hpMax>0.6?"bg-green-600":e.hp/e.hpMax>0.3?"bg-yellow-500":"bg-red-600")} style={{width:`${(e.hp/e.hpMax)*100}%`}}/>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2">
            <button className="btn btn-ghost w-full" onClick={props.onDefend}>🛡️ Defender</button>
            <button className="btn btn-ghost w-full" onClick={props.onHeal}>💊 Curarse</button>
            <button className="btn btn-ghost w-full" onClick={props.onFlee}>🏃 Huir</button>
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

function PartyPanel({players, onUpdatePlayer, onRemove}:{players:Player[]; onUpdatePlayer:(id:string, patch:Partial<Player>)=>void; onRemove:(id:string)=>void}){
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
          {players.map(p=>(
            <div key={p.id} className={clsx("p-4 rounded-xl border", p.status==="dead"?"bg-neutral-950 border-neutral-900 opacity-60":"bg-neutral-800/50 border-neutral-700")}>
              <div className="flex justify-between items-start gap-2">
                <input
                  className="font-bold bg-transparent border-b border-neutral-700 outline-none focus:border-red-500"
                  value={p.name}
                  onChange={(e)=>onUpdatePlayer(p.id,{ name: e.target.value })}
                />
                <span className={clsx("px-2 py-1 rounded text-xs", p.status==="dead"?"bg-red-900":"bg-green-900")}>
                  {p.status==="dead"?"Caído":"Vivo"}
                </span>
              </div>
              <p className="text-xs text-neutral-400">{p.profession}</p>

              <div className="mt-2">
                <Bar label="PV" current={p.hp} max={p.hpMax} color="green" />
                <Bar label="Energía" current={p.energy} max={p.energyMax} color="blue" />
              </div>

              <div className="mt-2 flex gap-2">
                <button className="btn btn-ghost" onClick={()=>setSelected(p.id)}>Ver</button>
                {p.status!=="dead" && (
                  <button className="btn btn-red text-white" onClick={()=>onRemove(p.id)}>Eliminar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-neutral-900 border-neutral-800 p-6">
        <h3 className="text-xl font-bold mb-3">Detalles</h3>
        {selected ? (
          <Details
            player={players.find(p=>p.id===selected)!}
            onUpdate={(patch)=>onUpdatePlayer(selected, patch)}
            players={players}
            setPlayers={setPlayers}
          />
        ) : (
          <p className="text-neutral-500">Selecciona un personaje.</p>
        )}
      </div>
    </div>
  );
}

function Details({player, onUpdate, players, setPlayers}:{player:Player; onUpdate:(patch:Partial<Player>)=>void; players:Player[]; setPlayers:React.Dispatch<React.SetStateAction<Player[]>>;}){
  ensureBreathPlomoStyle();
  const [reloadOpen, setReloadOpen] = useState(false);
  const canReload = canReloadFromBackpack(player as any);
  const activeIndex = players.findIndex(p=>p.id===player.id);
  const state = { players, turn:{activeIndex} };
  const apply = (next:any)=>{ setPlayers(next.players); };
  return (
    <div className="space-y-2 text-sm">
      <div>
        <label className="text-xs text-neutral-400">Bio</label>
        <textarea className="w-full bg-neutral-800 rounded p-2 mt-1" value={player.bio ?? ''} onChange={e=>onUpdate({bio:e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>DEF: {player.defense}</div>
        <div>Munición: {player.ammo}</div>
        <div>Inventario: {player.inventory.length}</div>
        <div>Estado: {player.status}</div>
      </div>
      <div>
        <h4 className="text-neutral-400 text-xs mt-2">Objetos</h4>
        <div className="flex flex-wrap gap-1 mt-1">
          {player.inventory.length===0 ? <span className="text-neutral-500 text-xs">Vacío</span> :
            player.inventory.map((it,i)=>(<span key={i} className="px-2 py-1 bg-neutral-800 rounded text-xs">{it}</span>))
          }
        </div>
      </div>
      <div className="mt-2">
        <button className={`${canReload?'breath-plomo':'btn-disabled'} px-3 py-1 rounded`} disabled={!canReload} onClick={()=>setReloadOpen(true)}>Recargar arma</button>
      </div>
      <ReloadModal isOpen={reloadOpen} onClose={()=>setReloadOpen(false)} state={state} setState={apply} />
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

function CampRepair({resources, camp, setResources, setCamp}:{resources:Resources; camp:Camp; setResources:React.Dispatch<React.SetStateAction<Resources>>; setCamp:React.Dispatch<React.SetStateAction<Camp>>;}){
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

function CampPanel({resources, setResources, players, setPlayers, turn}:{resources:Resources; setResources:React.Dispatch<React.SetStateAction<Resources>>; players:Player[]; setPlayers:React.Dispatch<React.SetStateAction<Player[]>>; turn:number;}){
  ensureBreathPlomoStyle();
  const [stockOpen, setStockOpen] = useState(false);
  const total = Object.values(resources).reduce((a,b)=>a+b,0);
  const activeIndex = players.length ? (turn % players.length) : 0;
  const state = { camp:{ resources:{ ammo: resources.ammo }}, players, turn:{activeIndex} };
  const apply = (next:any)=>{
    setResources(r=>({...r, ammo: next.camp.resources.ammo}));
    setPlayers(next.players);
  };
  return (
    <div className="card bg-neutral-900 border-neutral-800 p-6">
      <h3 className="text-xl font-bold mb-4">🏕️ Campamento</h3>
      <div className="grid sm:grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(resources).map(([k,v])=>(
          k==='ammo' ? (
            <div key={k} className="text-center p-3 rounded-xl bg-neutral-800 breath-plomo cursor-pointer" onClick={()=>setStockOpen(true)}>
              <div className="text-2xl mb-1">🔫</div>
              <div className="text-xl font-bold">{v}</div>
              <div className="text-xs text-neutral-400">{k}</div>
            </div>
          ) : (
            <div key={k} className="text-center p-3 rounded-xl bg-neutral-800">
              <div className="text-2xl mb-1">{k==="food"?"🍖":k==="water"?"💧":k==="medicine"?"💊":k==="fuel"?"⛽":"🔨"}</div>
              <div className="text-xl font-bold">{v}</div>
              <div className="text-xs text-neutral-400">{k}</div>
            </div>
          )
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-500">Total almacenado: {total}</p>
      <StockAmmoModal isOpen={stockOpen} onClose={()=>setStockOpen(false)} state={state} setState={apply} />
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
