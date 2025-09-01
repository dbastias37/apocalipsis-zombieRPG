import React, { useEffect, useRef, useState } from "react";

/**
 * Apocalipsis Zombie RPG
 * - Sin DEMO
 * - Mazo de Decisión (morado) y Mazo de Combate (rojo)
 * - Botones para barajar restantes y reintegrar descartadas por mazo
 * - Citas filosóficas aparte de la narrativa (no embebidas en el texto)
 * - Mantener estructura/estética general
 */

export default function ApocalipsisZombieRPG() {
  // --- Estados principales ---
  const [gameState, setGameState] = useState("menu");
  const [players, setPlayers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [tab, setTab] = useState("story");
  const [log, setLog] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [currentStoryCard, setCurrentStoryCard] = useState(null); // { ...card, type: 'decision' | 'combat' }

  // Ajustes
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("dawn");
  const [resources, setResources] = useState({
    food: 15,
    water: 15,
    medicine: 8,
    fuel: 10,
    ammo: 30,
    materials: 10,
  });
  const [camp, setCamp] = useState({ defense: 5, comfort: 3, storage: 20 });
  const [morale, setMorale] = useState(50);
  const [threat, setThreat] = useState(10);
  const [relationships, setRelationships] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [difficulty, setDifficulty] = useState("normal");
  const [autoSave, setAutoSave] = useState(true);

  // --- Guardados ---
  const saveInterval = useRef(null);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    // Detectar save en cliente (evita SSR issues)
    if (typeof window !== "undefined") {
      setHasSave(!!localStorage.getItem("zombieRPGSave"));
    }
  }, []);

  useEffect(() => {
    if (autoSave && gameState === "playing") {
      saveInterval.current = setInterval(() => {
        saveGame();
      }, 30000);
    }
    return () => {
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [autoSave, gameState]);

  function saveGame() {
    const saveData = {
      players,
      activeIndex,
      round,
      day,
      time,
      resources,
      camp,
      morale,
      threat,
      usedDecision: usedDecision.current,
      usedCombat: usedCombat.current,
      discDecision: discDecision.current,
      discCombat: discCombat.current,
      deckDecision: deckDecision.current,
      deckCombat: deckCombat.current,
      relationships,
      achievements,
      difficulty,
      log: log.slice(0, 20),
      selectedDeck,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("zombieRPGSave", JSON.stringify(saveData));
      pushLog("Partida guardada", "system");
      setHasSave(true);
    }
  }

  function loadGame() {
    if (typeof window === "undefined") return;
    const saveData = localStorage.getItem("zombieRPGSave");
    if (saveData) {
      const data = JSON.parse(saveData);
      setPlayers(data.players || []);
      setActiveIndex(data.activeIndex || 0);
      setRound(data.round || 1);
      setDay(data.day || 1);
      setTime(data.time || "dawn");
      setResources(
        data.resources || {
          food: 15,
          water: 15,
          medicine: 8,
          fuel: 10,
          ammo: 30,
          materials: 10,
        }
      );
      setCamp(data.camp || { defense: 5, comfort: 3, storage: 20 });
      setMorale(data.morale || 50);
      setThreat(data.threat || 10);
      usedDecision.current = data.usedDecision || [];
      usedCombat.current = data.usedCombat || [];
      discDecision.current = data.discDecision || [];
      discCombat.current = data.discCombat || [];
      deckDecision.current =
        data.deckDecision || shuffle(storyCards.map((c) => c.id));
      deckCombat.current =
        data.deckCombat || shuffle(combatCards.map((c) => c.id));
      setRelationships(data.relationships || {});
      setAchievements(data.achievements || []);
      setDifficulty(data.difficulty || "normal");
      setLog(data.log || []);
      setSelectedDeck(data.selectedDeck || "decision");
      setCurrentStoryCard(null);
      setGameState("playing");
      pushLog("Partida cargada", "system");
    }
  }

  // --- Datos del juego ---
  const professions = [
    {
      id: "doctor",
      name: "Médico",
      bonus: { Inteligencia: 3, medicine: 5 },
      skill: "Curación avanzada",
    },
    {
      id: "soldier",
      name: "Soldado",
      bonus: { Fuerza: 3, Constitución: 2 },
      skill: "Combate táctico",
    },
    {
      id: "engineer",
      name: "Ingeniero",
      bonus: { Inteligencia: 2, Destreza: 2 },
      skill: "Construcción eficiente",
    },
    {
      id: "police",
      name: "Policía",
      bonus: { Destreza: 3, defensa: 2 },
      skill: "Vigilancia nocturna",
    },
    {
      id: "hunter",
      name: "Cazador",
      bonus: { Destreza: 3, perception: 4 },
      skill: "Rastreo y caza",
    },
    {
      id: "survivor",
      name: "Superviviente",
      bonus: { Constitución: 3, energía: 5 },
      skill: "Adaptación rápida",
    },
    {
      id: "psychologist",
      name: "Psicólogo",
      bonus: { Carisma: 4, Inteligencia: 2 },
      skill: "Mantener la moral",
    },
    {
      id: "athlete",
      name: "Atleta",
      bonus: { Fuerza: 2, Destreza: 3 },
      skill: "Resistencia superior",
    },
    {
      id: "teacher",
      name: "Profesor",
      bonus: { Inteligencia: 3, Carisma: 2 },
      skill: "Enseñanza y aprendizaje",
    },
    {
      id: "mechanic",
      name: "Mecánico",
      bonus: { Destreza: 2, Fuerza: 2 },
      skill: "Reparación de vehículos",
    },
  ];

  // --- Citas por tema filosófico (aparecen fuera del texto narrativo) ---
  const quotesByPhilosophy = {
    mercy: { text: "La misericordia bendice a quien la da y a quien la recibe.", author: "William Shakespeare" },
    trolley_problem: { text: "El mayor bien para el mayor número.", author: "Jeremy Bentham" },
    beauty_in_chaos: { text: "La belleza perece en la vida, pero es inmortal en el arte.", author: "Leonardo da Vinci" },
    identity: { text: "No podemos bañarnos dos veces en el mismo río.", author: "Heráclito" },
    truth_vs_comfort: { text: "La verdad duele, pero la mentira mata.", author: "Anónimo" },
    social_contract: { text: "El hombre nace libre, pero en todos lados está encadenado.", author: "Jean-Jacques Rousseau" },
    platos_cave: { text: "La educación es encender una llama, no llenar un recipiente.", author: "Plutarco" },
    burden_of_leadership: { text: "El precio de la grandeza es la responsabilidad.", author: "Winston Churchill" },
    justice_vs_revenge: { text: "Antes de embarcarte en un viaje de venganza, cava dos tumbas.", author: "Confucio" },
    dignity_in_death: { text: "La dignidad no consiste en poseer honores, sino en merecerlos.", author: "Aristóteles" },
    trust_in_artificial: { text: "La ciencia es el gran antídoto contra el veneno del entusiasmo y la superstición.", author: "Adam Smith" },
    change_and_flux: { text: "La vida es cambio; el crecimiento opcional.", author: "Karen Kaiser Clark" },
    value_of_culture: { text: "La cultura es la memoria de la humanidad.", author: "Octavio Paz" },
    prisoners_dilemma: { text: "La confianza es el cemento de la vida.", author: "Stephen R. Covey" },
    path_dependence: { text: "No hay viento favorable para el que no sabe adónde va.", author: "Séneca" },
    survivors_guilt: { text: "Vivir es lo más raro del mundo. La mayoría existe, eso es todo.", author: "Oscar Wilde" },
    surveillance_society: { text: "La libertad muere con la vigilancia absoluta.", author: "Anónimo" },
    tolerance_paradox: { text: "No podemos ser tolerantes con los intolerantes.", author: "Karl Popper" },
    absurdism: { text: "Hay que imaginar a Sísifo feliz.", author: "Albert Camus" },
    chinese_room: { text: "Saber es recordar.", author: "Platón" },
    redemption: { text: "Errar es humano; perdonar, divino.", author: "Alexander Pope" },
    might_vs_right: { text: "El fuerte hace lo que puede y el débil sufre lo que debe.", author: "Tucídides" },
    ends_vs_means: { text: "El fin no justifica los medios.", author: "Maquiavelo (atribuido erróneamente)" },
    dangerous_ideas: { text: "Las ideas pueden ser más peligrosas que las armas.", author: "Anónimo" },
    madness_and_society: { text: "De cerca nadie es normal.", author: "Caetano Veloso" },
    education_purpose: { text: "Educar la mente sin educar el corazón no es educación.", author: "Aristóteles" },
    meaning_seeking: { text: "Quien tiene un porqué para vivir, puede soportar casi cualquier cómo.", author: "Friedrich Nietzsche" },
    bodily_autonomy: { text: "El cuerpo es tuyo.", author: "Anónimo" },
    chosen_one: { text: "El destino no es cuestión de azar, es una cuestión de elección.", author: "William Jennings Bryan" },
    language_barriers: { text: "Los límites de mi lenguaje son los límites de mi mundo.", author: "Ludwig Wittgenstein" },
    art_necessity: { text: "El arte lava del alma el polvo de la vida cotidiana.", author: "Pablo Picasso" },
    fairness_vs_efficiency: { text: "La justicia sin fuerza es impotente; la fuerza sin justicia es tiranía.", author: "Blaise Pascal" },
    security_vs_freedom: { text: "Quien sacrifica libertad por seguridad no merece ninguna de las dos.", author: "Benjamin Franklin" },
    dangerous_knowledge: { text: "El conocimiento es poder.", author: "Francis Bacon" },
    confronting_mortality: { text: "Mirar a la muerte a la cara enseña a vivir.", author: "Anónimo" },
    ways_of_knowing: { text: "No vemos las cosas como son, sino como somos.", author: "Anaïs Nin" },
    impossible_choices: { text: "Elegir es renunciar.", author: "Jean-Paul Sartre" },
    consciousness_study: { text: "Pienso, luego existo.", author: "René Descartes" },
    power_and_character: { text: "El poder tiende a corromper.", author: "Lord Acton" },
    problem_of_evil: { text: "Si Dios puede y no quiere, no es bueno; si quiere y no puede, no es omnipotente.", author: "Epicuro" },
    social_contract_extreme: { text: "Donde no hay ley, no hay libertad.", author: "John Locke" },
    experience_machine: { text: "La felicidad es real solo cuando es compartida.", author: "Christopher McCandless" },
    memory_reliability: { text: "La memoria es el notario de la conciencia.", author: "Aristóteles" },
    random_vs_chosen_sacrifice: { text: "El azar es el seudónimo de Dios cuando no quiere firmar.", author: "Anatole France" },
    temporal_ethics: { text: "El tiempo es la sustancia de la que estoy hecho.", author: "Jorge Luis Borges" },
    expression_vs_survival: { text: "Sin música la vida sería un error.", author: "Friedrich Nietzsche" },
    medical_triage: { text: "Primero, no hacer daño.", author: "Hipócrates" },
    duties_to_dead: { text: "Recordar es volver a vivir.", author: "Proverbio" },
    last_man: { text: "Nadie se salva solo.", author: "Papa Francisco" },
    ultimate_sacrifice: { text: "Nadie tiene mayor amor que dar la vida por sus amigos.", author: "Evangelio de Juan 15:13" }
  };

  // --- Cartas de DECISIÓN (morado) ---
  // (Recorte de ejemplo; puedes ampliar con tu set completo)
  const storyCards = [
    {
      id: 1,
      title: "El Último Sermón",
      text:
        "En la iglesia abandonada, un predicador moribundo susurra sobre el fin de los tiempos. Ofrece las llaves de un búnker a cambio de un último acto de misericordia.",
      choices: [
        {
          text: "Cumplir su última voluntad",
          effect: { morale: -2, loot: "bunker_key", karma: 5 },
        },
        {
          text: "Dejarlo a su destino",
          effect: { morale: -5, zombies: 1, karma: -3 },
        },
        {
          text: "Intentar salvarlo",
          effect: { medicine: -3, ally: "priest", karma: 10 },
        },
      ],
      philosophy: "mercy",
    },
    {
      id: 2,
      title: "El Dilema del Tranvía Viviente",
      text:
        "Cinco supervivientes están atrapados en un vagón. Desviar una horda salvaría a cinco pero arriesga la vida de un niño escondido.",
      choices: [
        { text: "Salvar a los cinco", effect: { morale: -10, survivors: 5, karma: -5 } },
        { text: "Proteger al niño", effect: { morale: -8, child_saved: true, karma: 8 } },
        { text: "No intervenir", effect: { morale: -15, karma: 0 } },
      ],
      philosophy: "trolley_problem",
    },
    {
      id: 3,
      title: "El Jardín de los Recuerdos",
      text:
        "Una anciana cultiva flores en una azotea. Te ofrece semillas a cambio de agua, un recurso precioso.",
      choices: [
        { text: "Compartir el agua", effect: { water: -5, morale: 8, seeds: true } },
        { text: "Conservar recursos", effect: { morale: -3, karma: -2 } },
        {
          text: "Proponer intercambio justo",
          effect: { water: -2, food: 3, morale: 3 },
        },
      ],
      philosophy: "beauty_in_chaos",
    },
  ].map((c) => ({ ...c, type: "decision" }));

  // --- Cartas de COMBATE (rojo) ---
  const combatCards = [
    {
      id: 101,
      title: "Patrulla Acechada",
      text:
        "Durante una patrulla ves sombras entre coches volcados. Algo se mueve con sigilo. Puedes preparar una emboscada o retirarte.",
      choices: [
        { text: "Emboscar primero", effect: { spawn: { count: 2, mod: 0 }, morale: 2 } },
        { text: "Retirada ordenada", effect: { threat: -3, morale: -1 } },
        { text: "Avanzar en formación", effect: { spawn: { count: 3, mod: 1 } } },
      ],
    },
    {
      id: 102,
      title: "Grito en el Almacén",
      text:
        "Un grito resuena dentro de un almacén. Hay suministros, pero algo los defiende.",
      choices: [
        { text: "Irrumpir con ruido", effect: { spawn: { count: 4, mod: 1 }, materials: 4 } },
        { text: "Forzar una entrada lateral", effect: { spawn: { count: 2, mod: 0 }, ammo: 5 } },
        { text: "Abandonar el lugar", effect: { morale: -2 } },
      ],
    },
    {
      id: 103,
      title: "Niebla y Pisadas",
      text:
        "La niebla reduce la visibilidad. Escuchas pisadas múltiples. ¿Esperas, prendes bengala o disparas al aire?",
      choices: [
        { text: "Esperar en silencio", effect: { spawn: { count: 1, mod: -1 } } },
        { text: "Bengala táctica", effect: { spawn: { count: 2, mod: 0 }, morale: 1 } },
        { text: "Disparo al aire", effect: { spawn: { count: 5, mod: 2 }, threat: 5 } },
      ],
    },
  ].map((c) => ({ ...c, type: "combat" }));

  // --- Enemigos ---
  const enemyTypes = [
    { name: "Zombi Común", hp: 15, def: 10, attack: 2, speed: "Lento", xp: 5 },
    { name: "Corredor", hp: 10, def: 14, attack: 3, speed: "Rápido", xp: 8 },
    { name: "Zombi Tanque", hp: 30, def: 8, attack: 5, speed: "Muy Lento", xp: 15 },
    { name: "Acechador", hp: 12, def: 16, attack: 4, speed: "Sigiloso", xp: 10 },
    { name: "Infectado Reciente", hp: 20, def: 12, attack: 4, speed: "Normal", xp: 7 },
    { name: "Zombi Tóxico", hp: 18, def: 11, attack: 3, speed: "Lento", xp: 12, special: "poison" },
    { name: "Berserker", hp: 25, def: 9, attack: 6, speed: "Errático", xp: 18 },
    { name: "Mutado", hp: 35, def: 13, attack: 7, speed: "Variable", xp: 25 },
  ];

  // --- Utilidades ---
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function roll(times, faces, modifier = 0) {
    const rolls = [];
    let total = 0;
    for (let i = 0; i < times; i++) {
      const r = Math.floor(Math.random() * faces) + 1;
      rolls.push(r);
      total += r;
    }
    return { rolls, total: total + modifier, natural: total, modifier };
  }

  function mod(score) {
    return Math.floor((score - 10) / 2);
  }

  function calcHP(attrs, nivel) {
    return attrs["Constitución"] * 2 + nivel * 5;
  }

  function calcDef(attrs) {
    return 10 + mod(attrs.Destreza);
  }

  function pushLog(msg, type = "info") {
    const types = {
      info: "📝",
      combat: "⚔️",
      danger: "⚠️",
      success: "✅",
      story: "📖",
      death: "💀",
      level: "⭐",
      resource: "📦",
      moral: "💭",
      system: "⚙️",
    };
    const timestamp = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLog((prev) => [
      `${types[type]} [${timestamp} - Día ${day}] ${msg}`,
      ...prev.slice(0, 99),
    ]);
  }

  function createPlayer(name, profession) {
    const attrs = {
      Fuerza: 10,
      Destreza: 10,
      Constitución: 10,
      Inteligencia: 10,
      Carisma: 10,
    };
    const prof = professions.find((p) => p.id === profession) || professions[5];
    Object.keys(prof.bonus).forEach((key) => {
      if (attrs[key] != null) attrs[key] += prof.bonus[key];
    });
    const hp = calcHP(attrs, 1);
    return {
      id: Math.random().toString(36).substr(2, 9),
      nombre: name,
      profesión: prof.name,
      profesionId: prof.id,
      habilidadEspecial: prof.skill,
      nivel: 1,
      atributos: attrs,
      pvMax: hp,
      pv: hp,
      defensa: calcDef(attrs),
      mochila: 10,
      munición: 10,
      energía: 10 + (prof.bonus.energía || 0),
      energíaMax: 10 + (prof.bonus.energía || 0),
      experiencia: 0,
      inventario: ["Navaja"],
      estado: "normal",
      hambre: 100,
      sed: 100,
      cordura: 100,
      infección: 0,
      habilidades: [],
      relacionesIds: [],
    };
  }

  // --- Barajas y descartes ---
  const deckDecision = useRef(shuffle(storyCards.map((c) => c.id)));
  const deckCombat = useRef(shuffle(combatCards.map((c) => c.id)));
  const usedDecision = useRef([]); // IDs usados (vistos) — quedan fuera hasta reintegrar
  const usedCombat = useRef([]);
  const discDecision = useRef([]); // descartes (pasar turno)
  const discCombat = useRef([]);

  const [selectedDeck, setSelectedDeck] = useState("decision");

  function startNewGame() {
    const newPlayers = [
      createPlayer("Superviviente 1", "survivor"),
      createPlayer("Superviviente 2", "doctor"),
      createPlayer("Superviviente 3", "soldier"),
    ];
    setPlayers(newPlayers);
    setActiveIndex(0);
    setRound(1);
    setDay(1);
    setTime("dawn");
    setLog([]);
    setEnemies([]);
    setResources({
      food: 15,
      water: 15,
      medicine: 8,
      fuel: 10,
      ammo: 30,
      materials: 10,
    });
    setCamp({ defense: 5, comfort: 3, storage: 20 });
    setMorale(50);
    setThreat(10);
    setRelationships({});
    setAchievements([]);
    deckDecision.current = shuffle(storyCards.map((c) => c.id));
    deckCombat.current = shuffle(combatCards.map((c) => c.id));
    usedDecision.current = [];
    usedCombat.current = [];
    discDecision.current = [];
    discCombat.current = [];
    setCurrentStoryCard(null);
    setSelectedDeck("decision");
    setGameState("playing");
    setTab("story");
    pushLog("=== NUEVA PARTIDA INICIADA ===", "success");
    pushLog("Día 1: El mundo que conocías ya no existe...", "story");
  }

  function drawFromDeck(deckType = selectedDeck) {
    if (deckType === "decision") {
      if (deckDecision.current.length === 0) {
        pushLog("No quedan cartas de decisión. Reintegra descartes o baraja.", "info");
        return;
      }
      const id = deckDecision.current.shift();
      usedDecision.current.push(id);
      const card = storyCards.find((c) => c.id === id);
      setCurrentStoryCard({ ...card, type: "decision" });
      pushLog(`Nueva situación: ${card.title}`, "story");
    } else {
      if (deckCombat.current.length === 0) {
        pushLog("No quedan cartas de combate. Reintegra descartes o baraja.", "info");
        return;
      }
      const id = deckCombat.current.shift();
      usedCombat.current.push(id);
      const card = combatCards.find((c) => c.id === id);
      setCurrentStoryCard({ ...card, type: "combat" });
      pushLog(`Encuentro táctico: ${card.title}`, "danger");
      setTab("story");
    }
  }

  function shuffleRemaining(deckType = selectedDeck) {
    if (deckType === "decision") {
      deckDecision.current = shuffle(deckDecision.current);
      pushLog("Mazo de decisión barajado.", "system");
    } else {
      deckCombat.current = shuffle(deckCombat.current);
      pushLog("Mazo de combate barajado.", "system");
    }
  }

  function reintegrateDiscards(deckType = selectedDeck) {
    if (deckType === "decision") {
      deckDecision.current = shuffle([
        ...deckDecision.current,
        ...discDecision.current,
      ]);
      discDecision.current = [];
      pushLog("Descartes de decisión reintegrados al mazo.", "system");
    } else {
      deckCombat.current = shuffle([...deckCombat.current, ...discCombat.current]);
      discCombat.current = [];
      pushLog("Descartes de combate reintegrados al mazo.", "system");
    }
  }

  function passCard() {
    if (!currentStoryCard) return;
    const { id, type } = currentStoryCard;
    if (type === "decision") {
      discDecision.current.push(id);
    } else {
      discCombat.current.push(id);
    }
    setCurrentStoryCard(null);
    nextTurn();
    pushLog("Carta descartada. Turno pasado.", "info");
  }

  // --- Consecuencias de cartas ---
  function handleStoryChoice(choice) {
    pushLog(`Decisión tomada: ${choice.text}`, "info");
    Object.entries(choice.effect || {}).forEach(([key, value]) => {
      switch (key) {
        case "zombies":
          spawnEnemies(value);
          pushLog(`¡${value} enemigos aparecen!`, "danger");
          setTab("combat");
          break;
        case "spawn":
          // { count, mod } — spawnea encuentro ajustado a dificultad
          if (value && typeof value.count === "number") {
            spawnEnemies(Math.max(1, value.count + Math.floor(threat / 25) + (value.mod || 0)));
            setTab("combat");
          }
          break;
        case "food":
        case "water":
        case "medicine":
        case "fuel":
        case "ammo":
        case "materials":
          setResources((prev) => ({
            ...prev,
            [key]: Math.max(0, prev[key] + value),
          }));
          pushLog(`${value > 0 ? "+" : ""}${value} ${key}`, "resource");
          break;
        case "morale":
          setMorale((prev) => Math.max(0, Math.min(100, prev + value)));
          pushLog(
            `Moral ${value > 0 ? "aumenta" : "disminuye"}: ${value}`,
            "moral"
          );
          break;
        case "karma":
          handleKarma(value);
          break;
        case "survivors":
          if (value > 0) addNewSurvivors(value);
          break;
        case "casualties":
          if (value === "random") handleRandomCasualty();
          break;
        case "threat":
          setThreat((prev) => Math.max(0, prev + value));
          break;
        default:
          handleSpecialEffect(key, value);
      }
    });

    // Descartar carta después de resolver
    if (currentStoryCard) {
      const { id, type } = currentStoryCard;
      if (type === "decision") discDecision.current.push(id);
      else discCombat.current.push(id);
      setCurrentStoryCard(null);
    }

    checkMoraleEffects();
    nextTurn();
  }

  function handleKarma(value) {
    const currentKarma = achievements.find((a) => a.type === "karma")?.value || 0;
    const newKarma = currentKarma + value;
    setAchievements((prev) => [
      ...prev.filter((a) => a.type !== "karma"),
      { type: "karma", value: newKarma },
    ]);
    if (newKarma > 50) {
      pushLog("Tu bondad atrae ayuda inesperada", "moral");
      setMorale((prev) => Math.min(100, prev + 5));
    } else if (newKarma < -50) {
      pushLog("Tus acciones tienen consecuencias...", "danger");
      setThreat((prev) => prev + 5);
    }
  }

  function handleSpecialEffect(effect, value) {
    const specialEffects = {
      bunker_key: () => {
        pushLog("Has obtenido la llave del búnker", "success");
        setAchievements((prev) => [
          ...prev,
          { type: "item", name: "bunker_key" },
        ]);
      },
      cure_progress: () => {
        pushLog("Progreso hacia la cura", "success");
        const progress = achievements.find((a) => a.type === "cure")?.value || 0;
        setAchievements((prev) => [
          ...prev.filter((a) => a.type !== "cure"),
          { type: "cure", value: progress + 20 },
        ]);
      },
      philosophical_strength: () => {
        pushLog("La reflexión fortalece al grupo", "moral");
        setPlayers((prev) =>
          prev.map((p) => ({ ...p, cordura: Math.min(100, p.cordura + 10) }))
        );
      },
      ally: () => {
        pushLog("Un aliado se une a tu causa.", "success");
      },
    };
    if (specialEffects[effect]) specialEffects[effect]();
  }

  function addNewSurvivors(count) {
    const names = ["Alex", "Jordan", "Casey", "Morgan", "Riley", "Avery"];
    const newSurvivors = [];
    for (let i = 0; i < count; i++) {
      const name =
        names[Math.floor(Math.random() * names.length)] +
        " " +
        (players.length + i + 1);
      const profession =
        professions[Math.floor(Math.random() * professions.length)].id;
      newSurvivors.push(createPlayer(name, profession));
    }
    setPlayers((prev) => [...prev, ...newSurvivors]);
    pushLog(`${count} nuevos supervivientes se unen al grupo`, "success");
  }

  function handleRandomCasualty() {
    if (players.length > 1) {
      const casualty = Math.floor(Math.random() * players.length);
      updatePlayer(casualty, {
        estado: "herido",
        pv: Math.floor(players[casualty].pv / 2),
      });
      pushLog(`${players[casualty].nombre} resulta herido`, "danger");
    }
  }

  function checkMoraleEffects() {
    if (morale < 20) {
      pushLog("La moral está peligrosamente baja", "danger");
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          energía: Math.max(0, p.energía - 2),
        }))
      );
    } else if (morale > 80) {
      pushLog("¡La moral está alta!", "success");
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          energía: Math.min(p.energíaMax, p.energía + 1),
        }))
      );
    }
  }

  function nextTurn() {
    const alive = players.filter((p) => p.estado !== "muerto");
    if (alive.length === 0) {
      setGameState("gameover");
      pushLog("Todos han caído. La humanidad pierde...", "death");
      return;
    }

    const next = (activeIndex + 1) % alive.length;
    setActiveIndex(next);

    if (next === 0) {
      setRound((prev) => prev + 1);
      if (round % 4 === 0) advanceTime();
      if (round % 8 === 0) consumeResources();
      if (round % 12 === 0) randomEvent();
      if (round % 20 === 0) checkWinConditions();
    }

    // Regeneración leve
    const aliveIndex = players.findIndex((p) => p.id === alive[activeIndex]?.id);
    if (camp.comfort > 5 && aliveIndex >= 0) {
      updatePlayer(aliveIndex, {
        energía: Math.min(
          players[aliveIndex].energíaMax,
          players[aliveIndex].energía + 1
        ),
      });
    }

    checkSurvivalConditions();
  }

  function advanceTime() {
    const times = ["dawn", "day", "dusk", "night"];
    const currentIndex = times.indexOf(time);
    const nextIndex = (currentIndex + 1) % times.length;

    if (nextIndex === 0) {
      setDay((prev) => prev + 1);
      pushLog(`=== DÍA ${day + 1} COMIENZA ===`, "info");
      if (day % 7 === 0) {
        pushLog("Ha pasado una semana...", "story");
        weeklyEvent();
      }
    }

    setTime(times[nextIndex]);
    pushLog(`${getTimeDescription(times[nextIndex])}`, "info");

    if (times[nextIndex] === "night") {
      setThreat((prev) => prev + 10);
      pushLog("La oscuridad aumenta el peligro", "danger");
    } else if (times[nextIndex] === "dawn") {
      setThreat((prev) => Math.max(10, prev - 5));
      setMorale((prev) => Math.min(100, prev + 3));
    }
  }

  function getTimeDescription(timeOfDay) {
    const descriptions = {
      dawn: "El sol se asoma entre las ruinas. Un nuevo día de supervivencia comienza.",
      day: "El sol en lo alto revela los horrores del mundo caído.",
      dusk: "Las sombras se alargan. Pronto llegará la oscuridad.",
      night: "La noche cae. Los muertos son más activos en la oscuridad.",
    };
    return descriptions[timeOfDay];
  }

  function consumeResources() {
    const aliveCount = players.filter((p) => p.estado !== "muerto").length;
    setResources((prev) => ({
      ...prev,
      food: Math.max(0, prev.food - aliveCount),
      water: Math.max(0, prev.water - aliveCount),
    }));

    if (resources.food <= 0) {
      pushLog("¡Sin comida! El hambre debilita al grupo", "danger");
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          hambre: Math.max(0, p.hambre - 25),
          pv: Math.max(1, p.pv - 2),
        }))
      );
      setMorale((prev) => Math.max(0, prev - 10));
    }
    if (resources.water <= 0) {
      pushLog("¡Sin agua! La deshidratación es crítica", "danger");
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          sed: Math.max(0, p.sed - 35),
          pv: Math.max(1, p.pv - 3),
        }))
      );
      setMorale((prev) => Math.max(0, prev - 15));
    }
  }

  function randomEvent() {
    const events = [
      {
        name: "Tormenta",
        effect: () => {
          pushLog("Una tormenta azota el campamento", "danger");
          setCamp((prev) => ({ ...prev, defense: Math.max(0, prev.defense - 2) }));
        },
      },
      {
        name: "Comerciantes",
        effect: () => {
          pushLog("Comerciantes nómadas ofrecen intercambio", "info");
          setTab("inventory");
        },
      },
      {
        name: "Horda migratoria",
        effect: () => {
          pushLog("Una horda masiva se acerca", "danger");
          setThreat((prev) => prev + 20);
          spawnEnemies(6);
        },
      },
      {
        name: "Caché oculto",
        effect: () => {
          pushLog("¡Encuentras un escondite de suministros!", "success");
          setResources((prev) => ({
            ...prev,
            food: prev.food + 5,
            ammo: prev.ammo + 10,
          }));
        },
      },
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
  }

  function weeklyEvent() {
    const weekEvents = [
      () => {
        pushLog("Reflexión semanal: el grupo evalúa su situación", "moral");
        if (morale > 50) {
          pushLog("El grupo se mantiene unido", "success");
          setMorale((prev) => Math.min(100, prev + 10));
        } else {
          pushLog("Las tensiones aumentan", "danger");
          handleGroupConflict();
        }
      },
      () => {
        pushLog("Mantenimiento del campamento", "info");
        if (resources.materials > 5) {
          setCamp((prev) => ({
            ...prev,
            defense: Math.min(20, prev.defense + 3),
          }));
          setResources((prev) => ({ ...prev, materials: prev.materials - 5 }));
        }
      },
    ];
    weekEvents[Math.floor(Math.random() * weekEvents.length)]();
  }

  function handleGroupConflict() {
    pushLog("Conflicto interno en el grupo", "danger");
    setMorale((prev) => Math.max(0, prev - 10));
    if (morale < 20 && players.length > 2) {
      const deserter = players[Math.floor(Math.random() * players.length)];
      pushLog(`${deserter.nombre} abandona el grupo`, "danger");
      setPlayers((prev) => prev.filter((p) => p.id !== deserter.id));
    }
  }

  function checkSurvivalConditions() {
    const alive = players.filter((p) => p.estado !== "muerto");
    if (alive.length === 0) {
      setGameState("gameover");
      pushLog("Todos han caído. La humanidad pierde...", "death");
      return;
    }
    players.forEach((player, idx) => {
      if (player.infección >= 100) {
        updatePlayer(idx, { estado: "muerto" });
        pushLog(`${player.nombre} sucumbe a la infección`, "death");
        setMorale((prev) => Math.max(0, prev - 15));
      }
    });
    if (day >= 100) {
      handleVictory("survival");
    }
  }

  function checkWinConditions() {
    const cureProgress = achievements.find((a) => a.type === "cure")?.value || 0;
    if (cureProgress >= 100) {
      handleVictory("cure");
    } else if (camp.defense >= 20 && resources.food > 50 && resources.water > 50) {
      handleVictory("fortress");
    }
  }

  function handleVictory(type) {
    const victories = {
      cure: "¡Has encontrado la cura! La humanidad tiene esperanza.",
      survival: "100 días de supervivencia. Eres una leyenda viviente.",
      fortress: "Tu fortaleza es impenetrable. Has creado un nuevo hogar.",
    };
    pushLog(victories[type], "success");
    setGameState("victory");
  }

  function updatePlayer(idx, updates) {
    setPlayers((prev) => {
      const newPlayers = [...prev];
      newPlayers[idx] = { ...newPlayers[idx], ...updates };
      return newPlayers;
    });
  }

  function spawnEnemies(count) {
    const newEnemies = [];
    const difficultyModifier =
      difficulty === "easy" ? 0.7 : difficulty === "hard" ? 1.3 : 1;
    for (let i = 0; i < count; i++) {
      const type =
        enemyTypes[Math.floor(Math.random() * Math.min(enemyTypes.length, day / 10 + 2))];
      newEnemies.push({
        id: Math.random().toString(36).substr(2, 9),
        ...type,
        hp: Math.floor(type.hp * difficultyModifier),
        currentHp: Math.floor(type.hp * difficultyModifier),
        attack: Math.floor(type.attack * difficultyModifier),
      });
    }
    setEnemies(newEnemies);
    setThreat((prev) => prev + count * 2);
  }

  function updatePlayerExp(playerIndex, amount) {
    const player = players[playerIndex];
    const newExp = player.experiencia + amount;
    const expNeeded = player.nivel * 50;
    if (newExp >= expNeeded) {
      levelUp(playerIndex);
      updatePlayer(playerIndex, { experiencia: newExp - expNeeded });
    } else {
      updatePlayer(playerIndex, { experiencia: newExp });
    }
  }

  function levelUp(playerIndex) {
    const player = players[playerIndex];
    const newLevel = player.nivel + 1;
    const attrBonus = { ...player.atributos };
    const mainAttr = ["Fuerza", "Destreza", "Constitución", "Inteligencia", "Carisma"][
      Math.floor(Math.random() * 5)
    ];
    attrBonus[mainAttr] += 1;
    const newHp = calcHP(attrBonus, newLevel);
    updatePlayer(playerIndex, {
      nivel: newLevel,
      atributos: attrBonus,
      pvMax: newHp,
      pv: newHp,
      defensa: calcDef(attrBonus),
    });
    pushLog(`¡${player.nombre} sube a nivel ${newLevel}!`, "level");
    setMorale((prev) => Math.min(100, prev + 5));
    if (newLevel % 3 === 0) unlockSkill(playerIndex);
  }

  function unlockSkill(playerIndex) {
    const skills = [
      "Golpe crítico",
      "Esquiva mejorada",
      "Resistencia",
      "Liderazgo",
      "Supervivencia",
      "Medicina de campo",
      "Francotirador",
      "Sigilo",
    ];
    const newSkill = skills[Math.floor(Math.random() * skills.length)];
    updatePlayer(playerIndex, {
      habilidades: [...players[playerIndex].habilidades, newSkill],
    });
    pushLog(`${players[playerIndex].nombre} aprende: ${newSkill}`, "level");
  }

  function performCombatAction(action, targetId = null) {
    const actor = players[activeIndex];
    switch (action) {
      case "attack":
        if (targetId && enemies.length > 0) {
          const enemy = enemies.find((e) => e.id === targetId);
          if (enemy) {
            const hasWeapon =
              actor.inventario.includes("Pistola") ||
              actor.inventario.includes("Rifle");
            const attackBonus = hasWeapon ? 5 : 0;
            const attackRoll = roll(1, 20, mod(actor.atributos.Fuerza) + attackBonus);
            const isCritical = attackRoll.natural === 20;
            const hit = attackRoll.total >= enemy.def || isCritical;
            pushLog(
              `${actor.nombre} ataca a ${enemy.name}: ${attackRoll.total} vs DEF ${enemy.def}`,
              "combat"
            );
            if (hit) {
              let damage = roll(1, 20, actor.atributos.Fuerza).total;
              if (isCritical) {
                damage *= 2;
                pushLog("¡GOLPE CRÍTICO!", "success");
              }
              enemy.currentHp -= damage;
              pushLog(`Daño causado: ${damage}`, "combat");
              if (enemy.currentHp <= 0) {
                setEnemies((prev) => prev.filter((e) => e.id !== targetId));
                pushLog(`${enemy.name} eliminado (+${enemy.xp} EXP)`, "success");
                updatePlayerExp(activeIndex, enemy.xp);
                setThreat((prev) => Math.max(0, prev - 5));
              } else {
                setEnemies((prev) =>
                  prev.map((e) => (e.id === targetId ? { ...e, currentHp: enemy.currentHp } : e))
                );
              }
              if (hasWeapon) {
                updatePlayer(activeIndex, { munición: Math.max(0, actor.munición - 1) });
              }
            } else {
              pushLog("Ataque fallido", "info");
            }
          }
        }
        break;
      case "defend":
        updatePlayer(activeIndex, { defensa: actor.defensa + 5 });
        pushLog(`${actor.nombre} toma posición defensiva (+5 DEF)`, "info");
        break;
      case "special":
        useSpecialAbility();
        break;
      case "heal":
        if (resources.medicine > 0) {
          const healAmount = actor.profesionId === "doctor" ? 15 : 10;
          updatePlayer(activeIndex, {
            pv: Math.min(actor.pvMax, actor.pv + healAmount),
            infección: Math.max(0, actor.infección - 10),
          });
          setResources((prev) => ({ ...prev, medicine: prev.medicine - 1 }));
          pushLog(`${actor.nombre} usa medicina (+${healAmount} PV)`, "success");
        } else {
          pushLog("Sin medicina disponible", "danger");
        }
        break;
      case "flee":
        const fleeRoll = roll(1, 20, mod(actor.atributos.Destreza));
        if (fleeRoll.total >= 15) {
          setEnemies([]);
          pushLog("¡Huida exitosa!", "success");
          setTab("story");
          setMorale((prev) => Math.max(0, prev - 5));
        } else {
          pushLog("Huida fallida - los enemigos bloquean el escape", "danger");
        }
        break;
    }
    if (enemies.length > 0 && action !== "flee") {
      setTimeout(() => enemyAttack(), 400);
    } else if (enemies.length === 0) {
      pushLog("¡Victoria! Todos los enemigos eliminados", "success");
      setMorale((prev) => Math.min(100, prev + 5));
      setTimeout(() => setTab("story"), 300);
    }
    nextTurn();
  }

  function useSpecialAbility() {
    const actor = players[activeIndex];
    const abilities = {
      doctor: () => {
        pushLog(`${actor.nombre} usa Curación Avanzada`, "success");
        players.forEach((p, idx) => {
          if (p.estado !== "muerto") {
            updatePlayer(idx, { pv: Math.min(p.pvMax, p.pv + 5) });
          }
        });
      },
      soldier: () => {
        pushLog(`${actor.nombre} usa Ráfaga Táctica`, "success");
        enemies.slice(0, 3).forEach((enemy) => {
          enemy.currentHp -= 10;
        });
        setEnemies((prev) => prev.filter((e) => e.currentHp > 0));
      },
      psychologist: () => {
        pushLog(`${actor.nombre} usa Motivación Grupal`, "success");
        setMorale((prev) => Math.min(100, prev + 15));
        players.forEach((p, idx) => {
          updatePlayer(idx, { cordura: Math.min(100, p.cordura + 10) });
        });
      },
    };
    if (abilities[actor.profesionId]) {
      abilities[actor.profesionId]();
      updatePlayer(activeIndex, { energía: Math.max(0, actor.energía - 3) });
    }
  }

  function enemyAttack() {
    enemies.forEach((enemy) => {
      const aliveTargets = players.filter((p) => p.estado !== "muerto");
      const target =
        aliveTargets[Math.floor(Math.random() * Math.max(1, aliveTargets.length))];
      if (!target) return;
      const attackRoll = roll(1, 20, enemy.attack);
      const targetIndex = players.findIndex((p) => p.id === target.id);
      const actualDefense = target.defensa + camp.defense / 2;
      if (attackRoll.total >= actualDefense) {
        const damage = roll(1, 6, enemy.attack).total;
        updatePlayer(targetIndex, {
          pv: Math.max(0, target.pv - damage),
          infección: target.infección + (enemy.special === "poison" ? 10 : 5),
        });
        pushLog(`${enemy.name} ataca a ${target.nombre}: -${damage} PV`, "danger");
        if (target.pv - damage <= 0) {
          updatePlayer(targetIndex, { estado: "muerto" });
          pushLog(`${target.nombre} ha caído...`, "death");
          setMorale((prev) => Math.max(0, prev - 20));
        }
      } else {
        pushLog(`${enemy.name} falla su ataque contra ${target.nombre}`, "info");
      }
    });
  }

  // --- UI ---
  function MenuScreen() {
    const [showCredits, setShowCredits] = useState(false);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-neutral-950 flex items-center justify-center">
        <div className="text-center animate-fade-in relative">
          <div className="absolute inset-0 blur-3xl opacity-30">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-800 rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-900 rounded-full animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 mb-2 animate-pulse shadow-red">
              Apocalipsis Zombie
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-300 mb-4">
              RPG
            </h2>
            <p className="text-xl text-red-400 mb-8">Sistema d20 · Edición Filosófica</p>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto italic">
              "En el fin del mundo, cada decisión revela quiénes somos realmente"
            </p>

            <div className="space-y-4">
              <button
                onClick={startNewGame}
                className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-xl transition-all transform hover:scale-105 shadow-2xl"
              >
                🎮 NUEVA PARTIDA
              </button>

              {hasSave && (
                <button
                  onClick={loadGame}
                  className="block mx-auto px-10 py-4 bg-gradient-to-r from-neutral-700 to-neutral-800 hover:from-neutral-600 hover:to-neutral-700 text-white font-bold rounded-xl text-xl transition-all transform hover:scale-105"
                >
                  💾 CONTINUAR
                </button>
              )}

              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={() =>
                    setDifficulty((prev) => {
                      const levels = ["easy", "normal", "hard"];
                      const current = levels.indexOf(prev);
                      return levels[(current + 1) % levels.length];
                    })
                  }
                  className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all"
                >
                  ⚔️ Dificultad:{" "}
                  {difficulty === "easy"
                    ? "Fácil"
                    : difficulty === "hard"
                    ? "Difícil"
                    : "Normal"}
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all"
                >
                  {soundEnabled ? "🔊" : "🔇"} Sonido
                </button>
                <button
                  onClick={() => setShowCredits(!showCredits)}
                  className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all"
                >
                  ℹ️ Info
                </button>
              </div>
            </div>

            {showCredits && (
              <div className="mt-8 p-4 bg-black/50 rounded-xl text-sm text-neutral-400">
                <p className="mb-2">Sistema completo de juego de rol</p>
                <p className="mb-2">Cartas narrativas (decisión) y de combate</p>
                <p className="mb-2">Sistema de combate táctico d20</p>
                <p>Múltiples finales y caminos narrativos</p>
              </div>
            )}

            <div className="mt-12 text-xs text-neutral-500">
              <p>Apocalipsis Zombie RPG · Sistema d20</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes progress {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
          .animate-progress {
            animation: progress 10s ease-out;
          }
        `}</style>
      </div>
    );
  }

  function PauseScreen() {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-fade-in backdrop-blur-md">
        <div className="bg-gradient-to-br from-neutral-900 to-black border-2 border-red-900 rounded-3xl p-8 max-w-md shadow-2xl">
          <h2 className="text-4xl font-bold text-red-500 mb-6">⏸️ JUEGO PAUSADO</h2>

          <div className="mb-6 p-4 bg-neutral-800/50 rounded-xl">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-neutral-400">Día:</div>
              <div className="text-neutral-200 font-bold">{day}</div>
              <div className="text-neutral-400">Supervivientes:</div>
              <div className="text-neutral-200 font-bold">
                {players.filter((p) => p.estado !== "muerto").length}/{players.length}
              </div>
              <div className="text-neutral-400">Moral:</div>
              <div className="text-neutral-200 font-bold">{morale}%</div>
              <div className="text-neutral-400">Amenaza:</div>
              <div className="text-red-400 font-bold">{threat}</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setGameState("playing")}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-xl font-bold transition-all transform hover:scale-105"
            >
              ▶️ Continuar
            </button>
            <button
              onClick={saveGame}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all"
            >
              💾 Guardar Partida
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-full px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all"
            >
              {soundEnabled ? "🔊 Sonido: ON" : "🔇 Sonido: OFF"}
            </button>
            <button
              onClick={() => {
                if (confirm("¿Seguro que quieres abandonar? El progreso no guardado se perderá.")) {
                  setGameState("menu");
                  setPlayers([]);
                }
              }}
              className="w-full px-6 py-3 bg-red-900 hover:bg-red-800 rounded-xl transition-all"
            >
              🏠 Menú Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  function GameHUD() {
    const survivorsAlive = players.filter((p) => p.estado !== "muerto").length;
    const dangerLevel =
      threat > 50 ? "text-red-500" : threat > 25 ? "text-yellow-500" : "text-green-500";
    return (
      <header className="sticky top-0 z-40 bg-gradient-to-b from-black via-neutral-950/95 to-transparent backdrop-blur-md">
        <div className="border-b border-red-900/50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                  🧟 Apocalipsis Zombie RPG
                </h1>
                <div className="flex gap-2 text-xs">
                  <StatusBadge icon="📅" label={`Día ${day}`} />
                  <StatusBadge
                    icon={time === "dawn" ? "🌅" : time === "day" ? "☀️" : time === "dusk" ? "🌆" : "🌙"}
                    label={time}
                  />
                  <StatusBadge icon="👥" label={`${survivorsAlive}/${players.length}`} />
                  <StatusBadge icon="⚠️" label={threat} className={dangerLevel} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ResourceBar />
                <button
                  onClick={() => setGameState("paused")}
                  className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all border border-neutral-700"
                >
                  ⏸️ Pausa
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-neutral-900/30 to-transparent">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <TabButton active={tab === "story"} onClick={() => setTab("story")}>
                📖 Historia
              </TabButton>
              <TabButton active={tab === "characters"} onClick={() => setTab("characters")}>
                👥 Personajes
              </TabButton>
              <TabButton active={tab === "combat"} onClick={() => setTab("combat")}>
                ⚔️ Combate
              </TabButton>
              <TabButton active={tab === "camp"} onClick={() => setTab("camp")}>
                🏕️ Campamento
              </TabButton>
              <TabButton active={tab === "inventory"} onClick={() => setTab("inventory")}>
                🎒 Inventario
              </TabButton>
              <TabButton active={tab === "dice"} onClick={() => setTab("dice")}>
                🎲 Dados
              </TabButton>
              <TabButton active={tab === "log"} onClick={() => setTab("log")}>
                📜 Registro
              </TabButton>
            </div>
          </div>
        </div>
      </header>
    );
  }

  function StatusBadge({ icon, label, className = "" }) {
    return (
      <span className={`px-2 py-1 bg-neutral-900 rounded-lg border border-neutral-800 ${className}`}>
        {icon} {label}
      </span>
    );
  }

  function ResourceBar() {
    const criticalResources = resources.food < 5 || resources.water < 5;
    return (
      <div
        className={`flex gap-3 text-sm px-3 py-1 rounded-lg ${
          criticalResources ? "bg-red-950 border border-red-800" : "bg-neutral-900 border border-neutral-800"
        }`}
      >
        <ResourceIcon icon="🍖" value={resources.food} critical={resources.food < 5} />
        <ResourceIcon icon="💧" value={resources.water} critical={resources.water < 5} />
        <ResourceIcon icon="💊" value={resources.medicine} critical={resources.medicine < 3} />
        <ResourceIcon icon="⛽" value={resources.fuel} />
        <ResourceIcon icon="🔫" value={resources.ammo} />
        <ResourceIcon icon="🔨" value={resources.materials} />
      </div>
    );
  }

  function ResourceIcon({ icon, value, critical = false }) {
    return (
      <span className={`flex items-center gap-1 ${critical ? "text-red-400 animate-pulse" : ""}`}>
        {icon} {value}
      </span>
    );
  }

  function TabButton({ active, onClick, children }) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
          active
            ? "bg-gradient-to-r from-red-900 to-red-800 text-red-100 border border-red-700 shadow-lg shadow-red-900/50"
            : "bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50 border border-neutral-800"
        }`}
      >
        {children}
      </button>
    );
  }

  // --- STORY TAB (incluye mazos y carta actual) ---
  function StoryTab() {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <DeckControls />

        {currentStoryCard ? (
          <CardDisplay />
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-neutral-900 to-black rounded-3xl border border-neutral-800">
            <p className="text-xl text-neutral-400 mb-6">El destino aguarda tu próxima decisión...</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() => drawFromDeck("decision")}
                className="px-8 py-4 bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                🎴 Robar Carta de Decisión
              </button>
              <button
                onClick={() => drawFromDeck("combat")}
                className="px-8 py-4 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                🩸 Robar Carta de Combate
              </button>
            </div>
          </div>
        )}

        <MoraleIndicator />
        <SurvivorsOverview />
      </div>
    );
  }

  function DeckControls() {
    const remainingDecision = deckDecision.current.length;
    const remainingCombat = deckCombat.current.length;
    const discDecisionCount = discDecision.current.length;
    const discCombatCount = discCombat.current.length;

    return (
      <div className="grid md:grid-cols-3 gap-4">
        <div
          onClick={() => {
            setSelectedDeck("decision");
            drawFromDeck("decision");
          }}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            selectedDeck === "decision"
              ? "bg-purple-950/40 border-purple-700 shadow-lg shadow-purple-900/30"
              : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-purple-300">Mazo de Decisión</h3>
            <span className="text-sm bg-purple-900/40 px-2 py-1 rounded">
              {remainingDecision} restantes
            </span>
          </div>
          <p className="text-neutral-400 text-sm mt-2">Dilemas y consecuencias para el grupo.</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                shuffleRemaining("decision");
              }}
              className="px-3 py-2 bg-purple-900 hover:bg-purple-800 rounded text-sm"
            >
              🔀 Barajar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reintegrateDiscards("decision");
              }}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
            >
              ♻️ Reintegrar ({discDecisionCount})
            </button>
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedDeck("combat");
            drawFromDeck("combat");
          }}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            selectedDeck === "combat"
              ? "bg-red-950/40 border-red-700 shadow-lg shadow-red-900/30"
              : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-red-300">Mazo de Combate</h3>
            <span className="text-sm bg-red-900/40 px-2 py-1 rounded">
              {remainingCombat} restantes
            </span>
          </div>
          <p className="text-neutral-400 text-sm mt-2">Encuentros y decisiones tácticas.</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                shuffleRemaining("combat");
              }}
              className="px-3 py-2 bg-red-900 hover:bg-red-800 rounded text-sm"
            >
              🔀 Barajar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reintegrateDiscards("combat");
              }}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
            >
              ♻️ Reintegrar ({discCombatCount})
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border-2 bg-neutral-900/50 border-neutral-800">
          <h3 className="text-lg font-bold mb-2">Consejo</h3>
          <p className="text-sm text-neutral-400">
            Roba del mazo que necesites. Puedes <span className="text-neutral-200">descartar</span> una carta para
            pasar el turno sin tomar su decisión.
          </p>
        </div>
      </div>
    );
  }

  function CardDisplay() {
    if (!currentStoryCard) return null;
    const isCombat = currentStoryCard.type === "combat";
    const borderColor = isCombat ? "border-red-900" : "border-purple-800";
    const titleGradient = isCombat
      ? "from-red-400 to-red-600"
      : "from-purple-300 to-purple-500";
    const quote = quotesByPhilosophy[currentStoryCard.philosophy];

    return (
      <div
        className={`bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-2 ${borderColor} rounded-3xl p-8 shadow-2xl animate-fade-in`}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${titleGradient}`}>
            {currentStoryCard.title}
          </h2>

          <span
            className={`px-3 py-1 ${
              isCombat ? "bg-red-900/30 text-red-400" : "bg-purple-900/30 text-purple-300"
            } rounded-full text-xs`}
          >
            {isCombat ? "🩸 COMBATE" : "💭 DECISIÓN"}
          </span>
        </div>

        <p className="text-neutral-300 leading-relaxed text-lg mb-6 italic">
          {renderCardText(currentStoryCard.text)}
        </p>

        {/* Cita filosófica (si existe mapeo) */}
        {currentStoryCard.type === "decision" && quote && (
          <div className="mb-6 p-4 bg-neutral-900 rounded-xl border border-neutral-800">
            <p className="text-sm text-neutral-300 italic">«{quote.text}»</p>
            <p className="text-xs text-neutral-500 mt-1">— {quote.author}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {currentStoryCard.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleStoryChoice(choice)}
              className={`group p-5 bg-gradient-to-br from-neutral-900 to-neutral-950 hover:from-${
                isCombat ? "red" : "purple"
              }-950 hover:to-neutral-950 border border-neutral-700 hover:border-${
                isCombat ? "red" : "purple"
              }-700 rounded-xl transition-all text-left transform hover:scale-105`}
            >
              <span
                className={`text-lg font-semibold group-hover:text-${
                  isCombat ? "red" : "purple"
                }-400 transition-colors`}
              >
                → {choice.text}
              </span>
              {choice.effect?.karma && (
                <div className="mt-2 text-xs text-neutral-500">
                  Karma: {choice.effect.karma > 0 ? "+" : ""}
                  {choice.effect.karma}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={passCard}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all font-bold"
          >
            ➡️ Pasar Turno (Descartar)
          </button>
          <button
            onClick={() => drawFromDeck(currentStoryCard.type)}
            className={`px-4 py-2 rounded-lg transition-all font-bold ${
              isCombat ? "bg-red-900 hover:bg-red-800" : "bg-purple-900 hover:bg-purple-800"
            }`}
          >
            🎴 Robar otra ({isCombat ? "Combate" : "Decisión"})
          </button>
        </div>
      </div>
    );
  }

  // Quita menciones directas a filósofos del texto original (si las hubiera)
  function renderCardText(text) {
    const patterns = [
      /Nietzsche/gi,
      /Sartre/gi,
      /Foucault/gi,
      /Popper/gi,
      /Rousseau/gi,
      /Locke/gi,
      /Borges/gi,
      /Searle/gi,
      /Epicuro/gi,
      /Hobbes/gi,
      /Wittgenstein/gi,
    ];
    let cleaned = text;
    patterns.forEach((re) => {
      cleaned = cleaned.replace(re, "—");
    });
    return cleaned;
  }

  function MoraleIndicator() {
    const moraleLevel = morale > 70 ? "Alta" : morale > 40 ? "Media" : "Baja";
    const moraleColor =
      morale > 70
        ? "from-green-600 to-green-400"
        : morale > 40
        ? "from-yellow-600 to-yellow-400"
        : "from-red-600 to-red-400";
    return (
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">💭 Moral del Grupo: {moraleLevel}</h3>
          <span className="text-2xl font-bold">{morale}%</span>
        </div>
        <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${moraleColor} transition-all duration-500`} style={{ width: `${morale}%` }} />
        </div>
        <p className="text-sm text-neutral-400 mt-2">
          {morale > 70
            ? "El grupo mantiene la esperanza"
            : morale > 40
            ? "Las tensiones aumentan"
            : "La desesperación se apodera del grupo"}
        </p>
      </div>
    );
  }

  function SurvivorsOverview() {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {players.map((player, idx) => (
          <div
            key={player.id}
            className={`relative p-5 rounded-2xl border-2 transition-all ${
              idx === activeIndex
                ? "bg-gradient-to-br from-red-950/50 to-neutral-950 border-red-700 shadow-xl shadow-red-900/30"
                : player.estado === "muerto"
                ? "bg-neutral-950 border-neutral-900 opacity-50"
                : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            {idx === activeIndex && (
              <div className="absolute -top-2 -right-2 px-2 py-1 bg-red-600 text-xs rounded-full animate-pulse">
                TURNO
              </div>
            )}

            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{player.nombre}</h3>
                <p className="text-sm text-neutral-400">
                  {player.profesión} • Nivel {player.nivel}
                </p>
              </div>
              <StatusIndicator estado={player.estado} />
            </div>

            <div className="space-y-2">
              <HealthBar current={player.pv} max={player.pvMax} />
              <EnergyBar current={player.energía} max={player.energíaMax} />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <StatMini label="Hambre" value={player.hambre} max={100} />
                <StatMini label="Sed" value={player.sed} max={100} />
                <StatMini label="Cordura" value={player.cordura} max={100} />
                <StatMini label="Infección" value={player.infección} max={100} danger />
              </div>
            </div>

            {player.habilidadEspecial && (
              <div className="mt-3 pt-3 border-t border-neutral-800">
                <p className="text-xs text-purple-400">⚡ {player.habilidadEspecial}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function StatusIndicator({ estado }) {
    const estados = {
      normal: { color: "bg-green-500", text: "Sano" },
      herido: { color: "bg-yellow-500", text: "Herido" },
      infectado: { color: "bg-purple-500", text: "Infectado" },
      muerto: { color: "bg-red-900", text: "Caído" },
    };
    const e = estados[estado] || estados.normal;
    return <span className={`px-2 py-1 rounded-full text-xs ${e.color} text-white`}>{e.text}</span>;
  }

  function HealthBar({ current, max }) {
    const percentage = Math.max(0, (current / Math.max(1, max)) * 100);
    const color =
      percentage > 60
        ? "from-green-600 to-green-400"
        : percentage > 30
        ? "from-yellow-600 to-yellow-400"
        : "from-red-600 to-red-400";
    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-neutral-400">PV</span>
          <span className={current < max / 3 ? "text-red-400 font-bold" : ""}>
            {current}/{max}
          </span>
        </div>
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  }

  function EnergyBar({ current, max }) {
    const percentage = Math.max(0, (current / Math.max(1, max)) * 100);
    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-neutral-400">Energía</span>
          <span>
            {current}/{max}
          </span>
        </div>
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  }

  function StatMini({ label, value, max, danger = false }) {
    const percentage = (value / max) * 100;
    const isLow = percentage < 30;
    const color = danger ? (percentage > 70 ? "text-red-400" : "") : isLow ? "text-yellow-400" : "";
    return (
      <div className={`${color}`}>
        <span className="text-neutral-500">{label}:</span> {value}%
      </div>
    );
  }

  function CharactersTab() {
    const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
    return (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              Gestión de Supervivientes
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {players.map((player, idx) => (
                <CharacterCard
                  key={player.id}
                  player={player}
                  idx={idx}
                  active={idx === activeIndex}
                  selected={selectedPlayer?.id === player.id}
                  onSelect={() => setSelectedPlayer(player)}
                  onUpdate={(updates) => updatePlayer(idx, updates)}
                />
              ))}
            </div>

            <button
              onClick={() => {
                const newPlayer = createPlayer(`Superviviente ${players.length + 1}`, "survivor");
                setPlayers((prev) => [...prev, newPlayer]);
                pushLog(`${newPlayer.nombre} se une al grupo`, "success");
              }}
              className="mt-6 w-full px-4 py-3 bg-green-900 hover:bg-green-800 rounded-xl transition-all"
            >
              ➕ Añadir Superviviente
            </button>
          </div>
        </div>

        <div>{selectedPlayer && <CharacterDetails player={selectedPlayer} />}</div>
      </div>
    );
  }

  function CharacterCard({ player, idx, active, selected, onSelect, onUpdate }) {
    return (
      <div
        onClick={onSelect}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          selected
            ? "border-red-600 bg-red-950/30"
            : active
            ? "border-yellow-600 bg-yellow-950/20"
            : player.estado === "muerto"
            ? "border-neutral-900 bg-neutral-950 opacity-50"
            : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <input
              value={player.nombre}
              onChange={(e) => onUpdate({ nombre: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="font-bold bg-transparent border-b border-neutral-700 outline-none focus:border-red-500 transition-colors"
            />
            <p className="text-sm text-neutral-400 mt-1">{player.profesión}</p>
          </div>
          <span className="text-sm font-bold text-yellow-400">Nv.{player.nivel}</span>
        </div>

        <div className="grid grid-cols-5 gap-1 mb-3">
          {Object.entries(player.atributos).map(([attr, value]) => (
            <div key={attr} className="text-center">
              <div className="text-xs text-neutral-500">{attr.substring(0, 3)}</div>
              <div className="font-bold">{value}</div>
            </div>
          ))}
        </div>

        <HealthBar current={player.pv} max={player.pvMax} />

        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ pv: Math.min(player.pvMax, player.pv + 5) });
              pushLog(`${player.nombre} recupera 5 PV`, "success");
            }}
            className="px-2 py-1 bg-green-900 hover:bg-green-800 rounded text-xs"
          >
            +5 PV
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              levelUp(idx);
            }}
            className="px-2 py-1 bg-purple-900 hover:bg-purple-800 rounded text-xs"
            disabled={player.experiencia < player.nivel * 50}
          >
            Level Up
          </button>
        </div>

        <div className="mt-2 text-xs text-neutral-400">EXP: {player.experiencia}/{player.nivel * 50}</div>
      </div>
    );
  }

  function CharacterDetails({ player }) {
    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">{player.nombre}</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-neutral-400 mb-2">Estadísticas</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>DEF: {player.defensa}</div>
              <div>Munición: {player.munición}</div>
              <div>Mochila: {player.inventario.length}/{player.mochila}</div>
              <div>Estado: {player.estado}</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-neutral-400 mb-2">Inventario</h4>
            <div className="flex flex-wrap gap-2">
              {player.inventario.map((item, i) => (
                <span key={i} className="px-2 py-1 bg-neutral-800 rounded text-xs">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {player.habilidades.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-neutral-400 mb-2">Habilidades</h4>
              <div className="space-y-1">
                {player.habilidades.map((skill, i) => (
                  <div key={i} className="px-2 py-1 bg-purple-900/30 rounded text-sm text-purple-400">
                    ⚡ {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function CombatTab() {
    const actor = players.filter((p) => p.estado !== "muerto")[activeIndex] || players[0];
    return (
      <div className="max-w-6xl mx-auto">
        {enemies.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <CombatArena enemies={enemies} actor={actor} />
            </div>
            <div>
              <CombatActions actor={actor} />
              <div className="mt-4">
                <DiceRoller context="combat" />
              </div>
            </div>
          </div>
        ) : (
          <NoCombat />
        )}
      </div>
    );
  }

  function CombatArena({ enemies, actor }) {
    return (
      <div className="bg-gradient-to-br from-red-950/30 to-black border-2 border-red-800 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-red-500 mb-6">⚔️ ZONA DE COMBATE</h3>

        <div className="mb-4 p-4 bg-neutral-900 rounded-xl border border-neutral-800">
          <p className="text-sm text-neutral-400">Turno actual:</p>
          <p className="text-xl font-bold">{actor?.nombre}</p>
          <p className="text-sm">
            DEF {actor?.defensa} • PV {actor?.pv}/{actor?.pvMax}
          </p>
        </div>

        <div className="grid gap-3">
          {enemies.map((enemy) => (
            <EnemyCard key={enemy.id} enemy={enemy} onAttack={() => performCombatAction("attack", enemy.id)} />
          ))}
        </div>
      </div>
    );
  }

  function EnemyCard({ enemy, onAttack }) {
    const hpPercentage = Math.max(0, (enemy.currentHp / Math.max(1, enemy.hp)) * 100);
    return (
      <div className="bg-neutral-900 border border-red-900 rounded-xl p-4 hover:border-red-700 transition-all">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-bold text-lg">{enemy.name}</h4>
            <div className="flex gap-4 text-sm text-neutral-400 mt-1">
              <span>DEF {enemy.def}</span>
              <span>ATK {enemy.attack}</span>
              <span>{enemy.speed}</span>
            </div>
          </div>
          <button onClick={onAttack} className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg transition-all font-bold">
            🗡️ Atacar
          </button>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>HP</span>
            <span>
              {enemy.currentHp}/{enemy.hp}
            </span>
          </div>
          <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                hpPercentage > 60
                  ? "bg-gradient-to-r from-green-600 to-green-400"
                  : hpPercentage > 30
                  ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                  : "bg-gradient-to-r from-red-600 to-red-400"
              }`}
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        {enemy.special && <div className="mt-2 text-xs text-purple-400">⚠️ Habilidad especial: {enemy.special}</div>}
      </div>
    );
  }

  function CombatActions({ actor }) {
    const hasAmmo = actor?.munición > 0;
    const hasMedicine = resources.medicine > 0;
    const hasEnergy = (actor?.energía || 0) >= 3;
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <h4 className="font-bold mb-4">Acciones de Combate</h4>
        <div className="space-y-2">
          <button
            onClick={() => performCombatAction("defend")}
            className="w-full px-4 py-3 bg-blue-900 hover:bg-blue-800 rounded-lg transition-all font-bold"
          >
            🛡️ Defender (+5 DEF)
          </button>

          <button
            onClick={() => performCombatAction("special")}
            disabled={!hasEnergy}
            className={`w-full px-4 py-3 rounded-lg transition-all font-bold ${
              hasEnergy ? "bg-purple-900 hover:bg-purple-800" : "bg-neutral-800 opacity-50 cursor-not-allowed"
            }`}
          >
            ⚡ Habilidad Especial (-3 Energía)
          </button>

          <button
            onClick={() => performCombatAction("heal")}
            disabled={!hasMedicine}
            className={`w-full px-4 py-3 rounded-lg transition-all font-bold ${
              hasMedicine ? "bg-green-900 hover:bg-green-800" : "bg-neutral-800 opacity-50 cursor-not-allowed"
            }`}
          >
            💊 Curar ({resources.medicine} disponibles)
          </button>

          <button
            onClick={() => performCombatAction("flee")}
            className="w-full px-4 py-3 bg-yellow-900 hover:bg-yellow-800 rounded-lg transition-all font-bold"
          >
            🏃 Huir (Destreza DC 15)
          </button>
        </div>

        <div className="mt-4 p-3 bg-neutral-800 rounded-lg text-sm">
          <div className="flex justify-between">
            <span>Munición:</span>
            <span className={!hasAmmo ? "text-red-400" : ""}>{actor?.munición ?? 0}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Energía:</span>
            <span className={(actor?.energía || 0) < 3 ? "text-yellow-400" : ""}>
              {actor?.energía ?? 0}/{actor?.energíaMax ?? 0}
            </span>
          </div>
        </div>
      </div>
    );
  }

  function NoCombat() {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-neutral-900 to-black rounded-3xl border border-neutral-800">
        <div className="mb-8">
          <p className="text-3xl mb-4">🕊️</p>
          <p className="text-xl text-neutral-400">No hay enemigos presentes</p>
          <p className="text-sm text-neutral-500 mt-2">La zona está temporalmente segura</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => spawnEnemies(Math.floor(Math.random() * 3) + 1)}
            className="px-6 py-3 bg-red-900 hover:bg-red-800 rounded-xl font-bold transition-all"
          >
            🧟 Explorar (Riesgo de encuentro)
          </button>
          <button
            onClick={() => {
              spawnEnemies(Math.floor(Math.random() * 2) + 3 + Math.floor(threat / 20));
              pushLog("¡Una horda se acerca!", "danger");
            }}
            className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-xl font-bold transition-all"
          >
            ⚠️ Provocar Horda
          </button>
        </div>

        <div className="mt-8 p-4 bg-neutral-900 rounded-xl max-w-md mx-auto">
          <p className="text-sm text-neutral-400">
            Nivel de amenaza actual: <span className="text-red-400 font-bold">{threat}</span>
          </p>
          <p className="text-xs text-neutral-500 mt-2">A mayor amenaza, más peligrosos serán los encuentros</p>
        </div>
      </div>
    );
  }

  function InventoryTab() {
    return (
      <div className="max-w-5xl mx-auto">
        <ResourceManagement />
        <div className="mt-6">
          <PlayerInventories />
        </div>
      </div>
    );
  }

  function ResourceManagement() {
    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-2xl font-bold mb-6">🎒 Gestión de Recursos</h3>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Object.entries(resources).map(([key, value]) => (
            <ResourceCard key={key} type={key} value={value} />
          ))}
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-800 rounded-xl">
            <h4 className="font-bold mb-2">Consumo Diario</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Comida:</span>
                <span>{players.filter((p) => p.estado !== "muerto").length}/día</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Agua:</span>
                <span>{players.filter((p) => p.estado !== "muerto").length}/día</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-neutral-800 rounded-xl">
            <h4 className="font-bold mb-2">Días Restantes</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Con comida actual:</span>
                <span className={resources.food < 5 ? "text-red-400 font-bold" : ""}>
                  {Math.floor(
                    resources.food / Math.max(1, players.filter((p) => p.estado !== "muerto").length)
                  )}{" "}
                  días
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Con agua actual:</span>
                <span className={resources.water < 5 ? "text-red-400 font-bold" : ""}>
                  {Math.floor(
                    resources.water / Math.max(1, players.filter((p) => p.estado !== "muerto").length)
                  )}{" "}
                  días
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ResourceCard({ type, value }) {
    const icons = {
      food: "🍖",
      water: "💧",
      medicine: "💊",
      fuel: "⛽",
      ammo: "🔫",
      materials: "🔨",
    };
    const critical = (type === "food" || type === "water") && value < 5;
    return (
      <div
        className={`p-4 rounded-xl text-center ${
          critical ? "bg-red-950 border border-red-800 animate-pulse" : "bg-neutral-800"
        }`}
      >
        <div className="text-3xl mb-2">{icons[type]}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-neutral-400 capitalize">{type}</div>
      </div>
    );
  }

  function PlayerInventories() {
    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Inventarios Personales</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {players.map((player, idx) => (
            <div key={player.id} className="bg-neutral-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold">{player.nombre}</h4>
                <span className="text-sm text-neutral-400">
                  {player.inventario.length}/{player.mochila} slots
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">Munición:</span>
                  <span className="font-bold">{player.munición}</span>
                  <button
                    onClick={() => {
                      if (resources.ammo > 0) {
                        updatePlayer(idx, { munición: player.munición + 10 });
                        setResources((prev) => ({ ...prev, ammo: prev.ammo - 1 }));
                        pushLog(`${player.nombre} recarga munición`, "info");
                      }
                    }}
                    className="ml-auto px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-xs"
                    disabled={resources.ammo === 0}
                  >
                    +10
                  </button>
                </div>

                <div>
                  <p className="text-sm text-neutral-400 mb-1">Objetos:</p>
                  <div className="flex flex-wrap gap-1">
                    {player.inventario.length === 0 ? (
                      <span className="text-xs text-neutral-500">Vacío</span>
                    ) : (
                      player.inventario.map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-neutral-700 rounded text-xs">
                          {item}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function DiceTab() {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <DiceRoller detailed={true} />
          <ReferenceGuide />
        </div>
        <div className="mt-6">
          <DiceHistory />
        </div>
      </div>
    );
  }

  function DiceRoller({ detailed = false, context = "general" }) {
    const [lastRoll, setLastRoll] = useState(null);
    const [modifier, setModifier] = useState(0);
    const [rollHistory, setRollHistory] = useState([]);

    function performRoll(dice, sides) {
      const result = roll(dice, sides, modifier);
      const rollData = {
        dice,
        sides,
        result,
        modifier,
        time: new Date().toLocaleTimeString(),
        context,
      };
      setLastRoll(rollData);
      setRollHistory((prev) => [rollData, ...prev.slice(0, 9)]);
      pushLog(
        `Tirada ${dice}d${sides}${modifier !== 0 ? (modifier > 0 ? "+" : "") + modifier : ""}: ${
          result.rolls.join(", ")
        } = ${result.total}`,
        context === "combat" ? "combat" : "info"
      );
    }

    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">🎲 Sistema de Dados</h3>

        {detailed && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="text-sm text-neutral-400">Modificador:</label>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setModifier((prev) => prev - 1)} className="px-3 py-2 bg-neutral-800 rounded">
                  -
                </button>
                <input
                  type="number"
                  value={modifier}
                  onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-neutral-800 rounded text-center outline-none focus:ring-2 ring-red-800"
                />
                <button onClick={() => setModifier((prev) => prev + 1)} className="px-3 py-2 bg-neutral-800 rounded">
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-400">Tiradas Rápidas:</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button onClick={() => performRoll(3, 6)} className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded">
                  3d6
                </button>
                <button onClick={() => performRoll(2, 10)} className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded">
                  2d10
                </button>
                <button onClick={() => performRoll(4, 6)} className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded">
                  4d6
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {[4, 6, 8, 10, 12, 20].map((sides) => (
            <button
              key={sides}
              onClick={() => performRoll(1, sides)}
              className="px-4 py-3 bg-gradient-to-br from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 rounded-lg transition-all font-bold text-lg"
            >
              d{sides}
            </button>
          ))}
        </div>

        {lastRoll && (
          <div className="mt-6 p-4 bg-gradient-to-br from-red-950/50 to-neutral-900 rounded-xl text-center animate-fade-in border border-red-800">
            <div className="text-5xl font-black text-red-400 mb-2">{lastRoll.result.total}</div>
            <div className="text-sm text-neutral-400">
              {lastRoll.dice}d{lastRoll.sides}: [{lastRoll.result.rolls.join(", ")}]
              {lastRoll.modifier !== 0 && ` ${lastRoll.modifier > 0 ? "+" : ""}${lastRoll.modifier}`}
            </div>
            {lastRoll.result.natural === 20 && lastRoll.dice === 1 && lastRoll.sides === 20 && (
              <div className="text-yellow-400 font-bold mt-2 animate-pulse">⭐ ¡CRÍTICO! ⭐</div>
            )}
            {lastRoll.result.natural === 1 && lastRoll.dice === 1 && lastRoll.sides === 20 && (
              <div className="text-red-600 font-bold mt-2">💀 ¡PIFIA! 💀</div>
            )}
          </div>
        )}
      </div>
    );
  }

  function ReferenceGuide() {
    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">📊 Guía de Referencia Rápida</h3>

        <div className="space-y-3 text-sm">
          <ReferenceRow label="Ataque" formula="1d20 + mod(Atributo) ≥ DEF objetivo" />
          <ReferenceRow label="Daño" formula="1d20 + Atributo completo" />
          <ReferenceRow label="Defensa" formula="10 + mod(Destreza)" />
          <ReferenceRow label="Iniciativa" formula="1d20 + mod(Destreza)" />
          <ReferenceRow label="PV Máximo" formula="Constitución × 2 + Nivel × 5" />
          <ReferenceRow label="Habilidad" formula="1d20 + mod(Atributo) ≥ DC" />
          <ReferenceRow label="Salvación" formula="1d20 + mod(Atributo) ≥ 15" />
        </div>

        <div className="mt-4 p-3 bg-neutral-800 rounded-xl">
          <h4 className="font-bold mb-2">Dificultades (DC)</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Fácil: 10</div>
            <div>Media: 15</div>
            <div>Difícil: 20</div>
            <div>Épica: 25</div>
          </div>
        </div>
      </div>
    );
  }

  function ReferenceRow({ label, formula }) {
    return (
      <div className="flex justify-between py-2 border-b border-neutral-800">
        <span className="text-neutral-400">{label}:</span>
        <span className="font-mono text-xs">{formula}</span>
      </div>
    );
  }

  function DiceHistory() {
    const recentRolls = log.filter((entry) => entry.includes("Tirada")).slice(0, 5);
    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">📜 Historial de Tiradas</h3>
        {recentRolls.length === 0 ? (
          <p className="text-neutral-500 text-center py-4">No hay tiradas recientes</p>
        ) : (
          <div className="space-y-2">
            {recentRolls.map((entry, idx) => (
              <div key={idx} className="p-3 bg-neutral-800 rounded-lg text-sm animate-fade-in">
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function LogTab() {
    const [filter, setFilter] = useState("all");
    const filteredLog =
      filter === "all"
        ? log
        : log.filter((entry) => {
            if (filter === "combat") return entry.includes("⚔️");
            if (filter === "story") return entry.includes("📖");
            if (filter === "resource") return entry.includes("📦");
            return true;
          });

    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">📜 Registro de Eventos</h3>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 bg-neutral-800 rounded-lg text-sm"
              >
                <option value="all">Todos</option>
                <option value="combat">Combate</option>
                <option value="story">Historia</option>
                <option value="resource">Recursos</option>
              </select>
              <button onClick={() => setLog([])} className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded-lg text-sm transition-all">
                🗑️ Limpiar
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
            {filteredLog.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No hay eventos registrados</p>
            ) : (
              filteredLog.map((entry, idx) => <LogEntry key={idx} entry={entry} />)
            )}
          </div>
        </div>
      </div>
    );
  }

  function LogEntry({ entry }) {
    const getEntryStyle = () => {
      if (entry.includes("⚔️")) return "border-red-800 bg-red-950/20";
      if (entry.includes("✅")) return "border-green-800 bg-green-950/20";
      if (entry.includes("⚠️")) return "border-yellow-800 bg-yellow-950/20";
      if (entry.includes("💀")) return "border-red-900 bg-red-950/50";
      if (entry.includes("📖")) return "border-purple-800 bg-purple-950/20";
      return "border-neutral-700 bg-neutral-800/50";
    };
    return <div className={`text-sm p-3 rounded-lg border animate-fade-in ${getEntryStyle()}`}>{entry}</div>;
  }

  function VictoryScreen() {
    const karma = achievements.find((a) => a.type === "karma")?.value || 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-black to-neutral-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-7xl font-black text-green-500 mb-4">¡VICTORIA!</h1>
          <p className="text-2xl text-neutral-300 mb-8">Has sobrevivido al apocalipsis</p>

          <div className="bg-black/50 rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-neutral-400">Días sobrevividos:</span>
                <span className="ml-2 text-xl font-bold">{day}</span>
              </div>
              <div>
                <span className="text-neutral-400">Supervivientes:</span>
                <span className="ml-2 text-xl font-bold">{players.filter((p) => p.estado !== "muerto").length}</span>
              </div>
              <div>
                <span className="text-neutral-400">Zombis eliminados:</span>
                <span className="ml-2 text-xl font-bold">{Math.floor(Math.random() * 100) + 50}</span>
              </div>
              <div>
                <span className="text-neutral-400">Karma final:</span>
                <span className="ml-2 text-xl font-bold">{karma > 0 ? "+" : ""}{karma}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-800">
              <p className="text-neutral-400 italic">
                {karma > 50
                  ? "Tu bondad será recordada en las leyendas"
                  : karma < -50
                  ? "Sobreviviste, pero a qué costo..."
                  : "Hiciste lo necesario para sobrevivir"}
              </p>
            </div>
          </div>

          <button onClick={() => setGameState("menu")} className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl transition-all">
            🏠 Menú Principal
          </button>
        </div>
      </div>
    );
  }

  function GameOverScreen() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-8xl font-black text-red-600 mb-4 animate-pulse">GAME OVER</h1>
          <p className="text-2xl text-neutral-400 mb-8">La humanidad ha caído...</p>

          <div className="bg-black/50 rounded-2xl p-6 max-w-md mx-auto mb-8">
            <p className="text-neutral-300 mb-4">Sobreviviste {day} días</p>
            <p className="text-sm text-neutral-500 italic">"En el fin, todos somos iguales ante la muerte"</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={startNewGame}
              className="px-8 py-4 bg-red-900 hover:bg-red-800 rounded-xl font-bold text-xl transition-all"
            >
              🔄 Intentar de Nuevo
            </button>
            <button
              onClick={() => setGameState("menu")}
              className="block mx-auto px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all"
            >
              Menú Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render principal ---
  if (gameState === "menu") return <MenuScreen />;
  if (gameState === "victory") return <VictoryScreen />;
  if (gameState === "gameover") return <GameOverScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950 text-neutral-100">
      {gameState === "paused" && <PauseScreen />}

      <GameHUD />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === "story" && <StoryTab />}
        {tab === "characters" && <CharactersTab />}
        {tab === "combat" && <CombatTab />}
        {tab === "camp" && <CampTab />}
        {tab === "inventory" && <InventoryTab />}
        {tab === "dice" && <DiceTab />}
        {tab === "log" && <LogTab />}
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .shadow-red {
          text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #171717;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #525252;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );

  // --- Camp Tab (reutiliza componentes existentes) ---
  function CampTab() {
    return (
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <CampManagement />
        <CampUpgrades />
      </div>
    );
  }

  function CampManagement() {
    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-2xl font-bold mb-6">🏕️ Gestión del Campamento</h3>

        <div className="space-y-4">
          <CampStat icon="🛡️" label="Defensa" value={camp.defense} max={20} description="Protección contra ataques" />
          <CampStat icon="🛏️" label="Comodidad" value={camp.comfort} max={20} description="Recuperación de energía" />
          <CampStat icon="📦" label="Almacenamiento" value={camp.storage} max={50} description="Capacidad de recursos" />
        </div>

        <div className="mt-6 p-4 bg-neutral-800 rounded-xl">
          <h4 className="font-bold mb-3">Estado del Campamento</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Seguridad:</span>
              <span className={camp.defense > 10 ? "text-green-400" : "text-yellow-400"}>
                {camp.defense > 15 ? "Fortificado" : camp.defense > 10 ? "Seguro" : camp.defense > 5 ? "Vulnerable" : "Crítico"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Moral por comodidad:</span>
              <span>+{Math.floor(camp.comfort / 4)}/día</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Capacidad usada:</span>
              <span>{Object.values(resources).reduce((a, b) => a + b, 0)}/{camp.storage}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function CampStat({ icon, label, value, max, description }) {
    const percentage = (value / max) * 100;
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <div className="font-bold">{label}</div>
              <div className="text-xs text-neutral-400">{description}</div>
            </div>
          </div>
          <span className="text-xl font-bold">
            {value}/{max}
          </span>
        </div>
        <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  }

  function CampUpgrades() {
    const upgrades = [
      {
        name: "Fortificar Muros",
        cost: { materials: 10 },
        effect: "Defensa +5",
        action: () => {
          if (resources.materials >= 10) {
            setCamp((prev) => ({ ...prev, defense: Math.min(20, prev.defense + 5) }));
            setResources((prev) => ({ ...prev, materials: prev.materials - 10 }));
            pushLog("Muros fortificados", "success");
          }
        },
      },
      {
        name: "Mejorar Dormitorios",
        cost: { materials: 5, food: 3 },
        effect: "Comodidad +3",
        action: () => {
          if (resources.materials >= 5 && resources.food >= 3) {
            setCamp((prev) => ({ ...prev, comfort: Math.min(20, prev.comfort + 3) }));
            setResources((prev) => ({ ...prev, materials: prev.materials - 5, food: prev.food - 3 }));
            pushLog("Dormitorios mejorados", "success");
          }
        },
      },
      {
        name: "Expandir Almacén",
        cost: { materials: 8 },
        effect: "Almacenamiento +10",
        action: () => {
          if (resources.materials >= 8) {
            setCamp((prev) => ({ ...prev, storage: Math.min(50, prev.storage + 10) }));
            setResources((prev) => ({ ...prev, materials: prev.materials - 8 }));
            pushLog("Almacén expandido", "success");
          }
        },
      },
    ];

    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-2xl font-bold mb-6">🔨 Mejoras Disponibles</h3>

        <div className="space-y-3">
          {upgrades.map((upgrade, idx) => (
            <UpgradeCard key={idx} upgrade={upgrade} resources={resources} />
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded-xl">
          <p className="text-sm text-yellow-400">💡 Consejo: Mantén las defensas altas para reducir los ataques nocturnos</p>
        </div>
      </div>
    );
  }

  function UpgradeCard({ upgrade, resources }) {
    const canAfford = Object.entries(upgrade.cost).every(([res, amount]) => resources[res] >= amount);
    return (
      <div className={`p-4 rounded-xl border ${canAfford ? "bg-neutral-800 border-neutral-700" : "bg-neutral-900 border-neutral-800 opacity-50"}`}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold">{upgrade.name}</h4>
            <p className="text-sm text-green-400 mt-1">{upgrade.effect}</p>
            <div className="flex gap-2 mt-2">
              {Object.entries(upgrade.cost).map(([res, amount]) => (
                <span key={res} className="text-xs bg-neutral-900 px-2 py-1 rounded">
                  {res}: {amount}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={upgrade.action}
            disabled={!canAfford}
            className={`px-4 py-2 rounded-lg transition-all ${canAfford ? "bg-blue-900 hover:bg-blue-800" : "bg-neutral-800 cursor-not-allowed"}`}
          >
            Construir
          </button>
        </div>
      </div>
    );
  }
}
