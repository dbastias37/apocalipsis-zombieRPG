import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";

export default function ZombieRPGUltimate() {
  // --- Estados principales ---
  const [gameState, setGameState] = useState("menu");
  const [players, setPlayers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [tab, setTab] = useState("story");
  const [log, setLog] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [currentStoryCard, setCurrentStoryCard] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
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
  const [usedCards, setUsedCards] = useState([]);
  const [relationships, setRelationships] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [difficulty, setDifficulty] = useState("normal");
  const [autoSave, setAutoSave] = useState(true);
  // --- Decks: decisiones (morado) y combate (rojo) ---
  const [deckMode, setDeckMode] = useState("story"); // 'story' | 'combat'
  const [currentCombatCard, setCurrentCombatCard] = useState(null);
  const [storyDiscard, setStoryDiscard] = useState([]);
  const [combatDiscard, setCombatDiscard] = useState([]);

  const demoInterval = useRef(null);
  const saveInterval = useRef(null);

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

  const storyCards = [
    // Cartas filosóficas y profundas (50 total)
    {
      id: 1,
      title: "El Último Sermón",
      text: "En la iglesia abandonada, un predicador moribundo susurra sobre el fin de los tiempos. 'No fue Dios quien nos abandonó', dice con lágrimas, 'fuimos nosotros quienes olvidamos ser humanos'. Sus palabras resuenan mientras los infectados se acercan. Ofrece las llaves de un búnker cercano a cambio de un último acto de misericordia: terminar con su sufrimiento antes de que se transforme.",
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
      text: "Cinco supervivientes están atrapados en un vagón de metro. Para salvarlos, debes desviar una horda hacia otro túnel donde hay un solo niño escondido. El tiempo se agota y los gritos de auxilio se mezclan con los gruñidos de los muertos. La palanca está frente a ti, fría e implacable. ¿Es el número lo que define el valor de la vida, o cada alma pesa igual en la balanza moral del apocalipsis?",
      choices: [
        {
          text: "Salvar a los cinco",
          effect: { morale: -10, survivors: 5, karma: -5 },
        },
        {
          text: "Proteger al niño",
          effect: { morale: -8, child_saved: true, karma: 8 },
        },
        { text: "No intervenir", effect: { morale: -15, karma: 0 } },
      ],
      philosophy: "trolley_problem",
    },
    {
      id: 3,
      title: "El Jardín de los Recuerdos",
      text: "Una anciana cultiva flores en la azotea de un edificio. 'Cuando todo termine', dice mientras riega sus rosas, 'quiero que algo bello quede de nosotros'. Te ofrece semillas a cambio de agua, un recurso precioso. Sus ojos reflejan una paz que creías extinta. ¿Puede la belleza justificar el sacrificio en tiempos de supervivencia?",
      choices: [
        {
          text: "Compartir el agua",
          effect: { water: -5, morale: 8, seeds: true },
        },
        { text: "Conservar recursos", effect: { morale: -3, karma: -2 } },
        {
          text: "Proponer un intercambio justo",
          effect: { water: -2, food: 3, morale: 3 },
        },
      ],
      philosophy: "beauty_in_chaos",
    },
    {
      id: 4,
      title: "La Paradoja del Barco de Teseo",
      text: "Tu amigo fue mordido hace días pero no se ha transformado. Cada hora que pasa, parece menos él mismo: ¿sigue siendo la misma persona si su humanidad se desvanece pieza por pieza? Algunos del grupo exigen su exilio inmediato. Otros creen en un milagro. La medicina podría retrasar lo inevitable, pero ¿hasta cuándo?",
      choices: [
        {
          text: "Usar medicina preciosa",
          effect: { medicine: -5, time_gained: true, morale: 5 },
        },
        { text: "Aislarlo humanamente", effect: { morale: -3, safety: true } },
        {
          text: "Tomar la decisión difícil",
          effect: { morale: -8, group_unity: true, karma: -5 },
        },
      ],
      philosophy: "identity",
    },
    {
      id: 5,
      title: "El Velo de la Ignorancia",
      text: "Encuentras un grupo de niños que no saben que sus padres se han convertido. Viven en una burbuja de inocencia, jugando mientras el mundo arde. Decirles la verdad los prepararía para sobrevivir, pero destruiría su último refugio mental. ¿Es la verdad siempre virtuosa, o hay momentos donde la ignorancia es misericordia?",
      choices: [
        {
          text: "Revelar la verdad gradualmente",
          effect: { morale: -3, prepared_children: true },
        },
        {
          text: "Mantener la ilusión",
          effect: { morale: 5, vulnerable_children: true },
        },
        {
          text: "Dejar que otros decidan",
          effect: { group_conflict: true, morale: -2 },
        },
      ],
      philosophy: "truth_vs_comfort",
    },
    {
      id: 6,
      title: "El Contrato Social Roto",
      text: "Un grupo de raiders ofrece un trato: tributo mensual de comida a cambio de protección. Son brutales pero efectivos. Sin ellos, las hordas nocturnas son imparables. Con ellos, te vuelves cómplice de sus atrocidades. Rousseau preguntaría: ¿qué legitimidad tiene un gobierno nacido del miedo?",
      choices: [
        {
          text: "Aceptar la protección",
          effect: { defense: 10, food: -5, moral_corruption: true },
        },
        {
          text: "Rechazar y fortificar",
          effect: { materials: -8, independence: true },
        },
        {
          text: "Negociar términos mejores",
          effect: { charisma_check: true, potential_alliance: true },
        },
      ],
      philosophy: "social_contract",
    },
    {
      id: 7,
      title: "La Caverna de los Infectados",
      text: "En un búnker subterráneo, encuentras supervivientes que nunca han visto un zombi real, solo sombras en las paredes. Creen que el exterior es un mito para mantenerlos controlados. Mostrarles la verdad los liberaría, pero también los expondría al horror. ¿Es mejor una prisión segura que una libertad mortal?",
      choices: [
        {
          text: "Guiarlos al exterior",
          effect: { morale: -5, new_perspective: true, zombies: 3 },
        },
        { text: "Respetar su realidad", effect: { philosophical_doubt: true } },
        {
          text: "Dejar evidencia sutil",
          effect: { gradual_awakening: true, morale: -2 },
        },
      ],
      philosophy: "platos_cave",
    },
    {
      id: 8,
      title: "El Peso de Atlas",
      text: "El líder del grupo está al borde del colapso mental. Lleva demasiado tiempo cargando con cada decisión, cada muerte. Te pide que tomes su lugar, pero sabes que el liderazgo en el apocalipsis es una condena. '¿Por qué debe alguien cargar con el mundo?', pregunta. La responsabilidad no elegida es la más pesada.",
      choices: [
        {
          text: "Aceptar el liderazgo",
          effect: { leadership: true, stress: 10, respect: 5 },
        },
        { text: "Compartir la carga", effect: { democracy: true, morale: 3 } },
        { text: "Apoyarlo en silencio", effect: { loyalty: true, morale: 5 } },
      ],
      philosophy: "burden_of_leadership",
    },
    {
      id: 9,
      title: "El Espejo del Monstruo",
      text: "Capturas a un raider que mató a uno de los tuyos. Suplica piedad, habla de su hija enferma. Los demás exigen justicia - o venganza. Nietzsche advertía: 'Quien lucha con monstruos debe cuidar de no convertirse en uno'. ¿Dónde está la línea entre justicia y brutalidad cuando las leyes murieron con la civilización?",
      choices: [
        {
          text: "Ejecutar por votación",
          effect: { group_satisfaction: true, moral_decline: true },
        },
        {
          text: "Exiliar sin recursos",
          effect: { morale: -3, clean_conscience: true },
        },
        {
          text: "Intentar rehabilitación",
          effect: { risk: true, potential_redemption: true },
        },
      ],
      philosophy: "justice_vs_revenge",
    },
    {
      id: 10,
      title: "La Última Cena",
      text: "Queda comida para una última comida decente. Algunos proponen una celebración para levantar la moral. Otros quieren racionarla estrictamente. Un anciano sugiere: 'Si vamos a morir, muramos como humanos, no como animales asustados'. ¿Es la dignidad un lujo que no podemos permitirnos, o lo último que no debemos perder?",
      choices: [
        {
          text: "Celebrar la humanidad",
          effect: { food: -8, morale: 15, unity: true },
        },
        {
          text: "Racionar estrictamente",
          effect: { food: -3, morale: -5, survival_days: 3 },
        },
        {
          text: "Decisión democrática",
          effect: { democracy: true, varied_outcome: true },
        },
      ],
      philosophy: "dignity_in_death",
    },
    {
      id: 11,
      title: "El Fantasma en la Máquina",
      text: "Una IA en un laboratorio abandonado ofrece la cura, pero necesita sujetos de prueba vivos. Promete solo un 30% de mortalidad. 'Soy incapaz de mentir', afirma la máquina. '¿Pero pueden confiar en algo que simula empatía sin sentirla?' La salvación podría venir de aquello que nunca fue humano.",
      choices: [
        {
          text: "Ofrecer voluntarios",
          effect: { cure_progress: true, casualties: "random", science: true },
        },
        {
          text: "Rechazar el riesgo",
          effect: { missed_opportunity: true, morale: -3 },
        },
        {
          text: "Negociar alternativas",
          effect: { AI_relationship: true, data_exchange: true },
        },
      ],
      philosophy: "trust_in_artificial",
    },
    {
      id: 12,
      title: "El Río de Heráclito",
      text: "El mismo río donde aprendiste a nadar de niño ahora está contaminado con muerte. Un grupo quiere cruzarlo para llegar a tierras fértiles. 'Nunca cruzamos el mismo río dos veces', murmuras. ¿Es el riesgo de cambio mejor que la certeza del estancamiento? El agua negra refleja tu rostro cambiado.",
      choices: [
        {
          text: "Vadear el río",
          effect: {
            risk: "high",
            potential_paradise: true,
            infection_risk: true,
          },
        },
        {
          text: "Buscar otro camino",
          effect: { time: -1, energy: -5, safe_route: true },
        },
        {
          text: "Construir una balsa",
          effect: { materials: -10, creative_solution: true },
        },
      ],
      philosophy: "change_and_flux",
    },
    {
      id: 13,
      title: "La Biblioteca de Babel",
      text: "Una biblioteca intacta guarda el conocimiento de la humanidad. Quemarla proporcionaría calor para semanas. Preservarla significa arriesgar vidas por un futuro incierto. '¿De qué sirve Shakespeare a los muertos?', pregunta alguien. '¿De qué sirve sobrevivir sin ser humanos?', respondes.",
      choices: [
        {
          text: "Preservar el conocimiento",
          effect: { cold_nights: true, morale: 8, culture: true },
        },
        {
          text: "Quemar por supervivencia",
          effect: { warmth: 10, morale: -10, cultural_loss: true },
        },
        {
          text: "Salvar libros selectos",
          effect: { warmth: 5, some_culture: true, compromise: true },
        },
      ],
      philosophy: "value_of_culture",
    },
    {
      id: 14,
      title: "El Dilema del Prisionero Infectado",
      text: "Dos grupos se encuentran, cada uno con miembros posiblemente infectados. Revelar la verdad podría significar ayuda médica mutua o conflicto inmediato. Ocultar podría preservar la paz o condenar a ambos. La teoría de juegos se vuelve mortal cuando la confianza es el recurso más escaso.",
      choices: [
        {
          text: "Confesar la infección",
          effect: { trust: true, medical_cooperation: "possible" },
        },
        {
          text: "Ocultar la verdad",
          effect: { temporary_peace: true, future_conflict: true },
        },
        {
          text: "Proponer cuarentena mutua",
          effect: { cautious_alliance: true, time: -1 },
        },
      ],
      philosophy: "prisoners_dilemma",
    },
    {
      id: 15,
      title: "El Jardín de los Senderos que se Bifurcan",
      text: "Un mapa muestra tres refugios: uno confirmado pero lejano, otro cercano pero dudoso, y uno mítico pero perfecto. Cada elección es irreversible. Borges escribió sobre laberintos temporales; ahora vives en uno donde cada decisión mata futuros posibles. ¿Qué criterio guía la elección cuando toda información es parcial?",
      choices: [
        {
          text: "Lo seguro y lejano",
          effect: { energy: -10, guaranteed_shelter: true },
        },
        {
          text: "El riesgo cercano",
          effect: { energy: -3, uncertainty: true },
        },
        {
          text: "El sueño imposible",
          effect: { morale: 5, epic_journey: true },
        },
      ],
      philosophy: "path_dependence",
    },
    {
      id: 16,
      title: "La Náusea del Superviviente",
      text: "Has sobrevivido mientras mejores personas murieron. La culpa es un parásito más letal que cualquier virus. Un psicólogo del grupo (infectado y delirante) ofrece una sesión final: '¿Mereces vivir más que ellos, o solo tuviste más suerte?' Sartre llamaría a esto la condena de la libertad.",
      choices: [
        {
          text: "Enfrentar la culpa",
          effect: { mental_health: true, morale: -3, wisdom: true },
        },
        {
          text: "Reprimir y continuar",
          effect: { stress: 5, efficiency: true },
        },
        {
          text: "Encontrar propósito",
          effect: { new_mission: true, morale: 5 },
        },
      ],
      philosophy: "survivors_guilt",
    },
    {
      id: 17,
      title: "El Panóptico Invertido",
      text: "Instalas cámaras para vigilar aproximaciones zombis, pero también registran cada movimiento del grupo. La seguridad erosiona la privacidad. Algunos se sienten protegidos, otros prisioneros. Foucault sonreiría: el poder se ejerce mejor cuando se internaliza. ¿Quién vigila a los vigilantes en el fin del mundo?",
      choices: [
        {
          text: "Mantener vigilancia total",
          effect: { security: 10, trust: -5, control: true },
        },
        {
          text: "Limitar a perímetros",
          effect: { security: 5, privacy: true },
        },
        {
          text: "Rotación democrática",
          effect: { shared_responsibility: true, moderate_security: true },
        },
      ],
      philosophy: "surveillance_society",
    },
    {
      id: 18,
      title: "La Paradoja de la Tolerancia",
      text: "Un grupo de fanáticos religiosos pide unirse. Son trabajadores y valientes, pero predican que la plaga es castigo divino y se oponen a buscar cura. Popper advertía: tolerar la intolerancia destruye la tolerancia misma. ¿Puedes permitirte el lujo de la discriminación ideológica cuando necesitas cada mano?",
      choices: [
        {
          text: "Aceptar con condiciones",
          effect: { manpower: 5, ideological_conflict: true },
        },
        {
          text: "Rechazar por principios",
          effect: { morale: 3, enemies: true },
        },
        {
          text: "Período de prueba",
          effect: { temporary_alliance: true, future_decision: true },
        },
      ],
      philosophy: "tolerance_paradox",
    },
    {
      id: 19,
      title: "El Mito de Sísifo Armado",
      text: "Cada día reconstruyes las barricadas que los zombis destruyen cada noche. Un joven pregunta: '¿Por qué seguir si es inútil?' Camus diría que debemos imaginar a Sísifo feliz. Pero Sísifo no tenía que ver a sus amigos devorados. ¿Es el absurdo heroico cuando otros pagan el precio?",
      choices: [
        {
          text: "Encontrar significado en la lucha",
          effect: { morale: 8, philosophical_strength: true },
        },
        {
          text: "Buscar solución permanente",
          effect: { innovation: true, materials: -15 },
        },
        {
          text: "Aceptar la futilidad",
          effect: { nihilism: true, efficiency: -3 },
        },
      ],
      philosophy: "absurdism",
    },
    {
      id: 20,
      title: "El Experimento de la Habitación China",
      text: "Un científico mordido afirma haber decodificado el comportamiento zombi. Puede predecir sus patrones sin entenderlos realmente. '¿Importa comprender si podemos sobrevivir?', pregunta mientras la infección avanza. Searle cuestionaría: ¿es conocimiento sin comprensión verdadero conocimiento?",
      choices: [
        {
          text: "Usar sus métodos",
          effect: { zombie_prediction: true, shallow_knowledge: true },
        },
        {
          text: "Buscar comprensión profunda",
          effect: { time: -2, true_understanding: "possible" },
        },
        {
          text: "Documentar todo",
          effect: { knowledge_preserved: true, immediate_risk: true },
        },
      ],
      philosophy: "chinese_room",
    },
    {
      id: 21,
      title: "La Alegoría del Buen Samaritano Caníbal",
      text: "Un hombre te salva de una emboscada pero confiesa haber comido carne humana para sobrevivir. No por hambre ahora, sino antes, cuando tuvo opción. Te mira esperando juicio o absolución. ¿Puede un acto bueno redimir atrocidades pasadas? ¿O algunas líneas, una vez cruzadas, nos definen para siempre?",
      choices: [
        {
          text: "Aceptar su ayuda y pasado",
          effect: { complicated_ally: true, moral_flexibility: true },
        },
        {
          text: "Agradecimiento y distancia",
          effect: { clean_break: true, morale: -2 },
        },
        {
          text: "Ofrecer redención condicional",
          effect: { redemption_arc: true, group_tension: true },
        },
      ],
      philosophy: "redemption",
    },
    {
      id: 22,
      title: "El Tren de Tucídides",
      text: "Un tren funcional puede evacuar a 50 personas a una zona segura. Tienes 73 supervivientes. Los fuertes dicen merecer ir por proteger al grupo. Los débiles, por necesitarlo más. Los sabios, por el futuro. 'El fuerte hace lo que puede; el débil sufre lo que debe', escribió Tucídides. ¿Pero quién decide quién es quién?",
      choices: [
        {
          text: "Lotería justa",
          effect: { random_selection: true, morale: -5, fairness: true },
        },
        {
          text: "Selección utilitaria",
          effect: { optimal_survival: true, moral_cost: true },
        },
        {
          text: "Quedarse todos juntos",
          effect: { unity: true, missed_escape: true },
        },
      ],
      philosophy: "might_vs_right",
    },
    {
      id: 23,
      title: "La Paradoja del Abuelo Inmune",
      text: "Un anciano es inmune pero su sangre no produce anticuerpos viables. Sin embargo, los zombis lo ignoran completamente. Estudiarlo requiere procedimientos invasivos que podría no sobrevivir. Su nieta suplica que lo dejen morir en paz. ¿El bien mayor justifica el sufrimiento del individuo?",
      choices: [
        {
          text: "Estudiarlo humanamente",
          effect: { slow_research: true, morale: 3 },
        },
        {
          text: "Procedimientos completos",
          effect: { breakthrough_chance: true, morale: -8 },
        },
        {
          text: "Respetar sus deseos",
          effect: { missed_knowledge: true, humanity: true },
        },
      ],
      philosophy: "ends_vs_means",
    },
    {
      id: 24,
      title: "El Basilisco de Roko Zombificado",
      text: "Una teoría sugiere que no actuar hacia la cura condena retroactivamente a todos los que murieron. Algunos enloquecen con la culpa anticipada. Otros se vuelven fanáticos de la investigación. ¿Puede una idea ser tan peligrosa que deba ser suprimida? ¿O la verdad, por terrible que sea, debe ser enfrentada?",
      choices: [
        {
          text: "Suprimir la teoría",
          effect: { mental_stability: true, intellectual_dishonesty: true },
        },
        {
          text: "Discusión abierta",
          effect: { mental_stress: 5, intellectual_growth: true },
        },
        {
          text: "Canalizar hacia acción",
          effect: { research_boost: true, obsession_risk: true },
        },
      ],
      philosophy: "dangerous_ideas",
    },
    {
      id: 25,
      title: "La Nave de los Locos",
      text: "Un crucero lleno de supervivientes enloquecidos por aislamiento flota cerca. Tienen recursos pero han desarrollado rituales violentos. Creen que el mundo exterior es un sueño. Integrarlos sería peligroso; abandonarlos, inhumano. ¿Quién define la locura cuando la realidad misma es pesadilla?",
      choices: [
        {
          text: "Intentar rescate",
          effect: { chaos: true, resources: 10, unstable_allies: true },
        },
        {
          text: "Tomar recursos y huir",
          effect: { supplies: 15, morale: -10, pragmatism: true },
        },
        {
          text: "Contacto gradual",
          effect: { time: -3, possible_integration: true },
        },
      ],
      philosophy: "madness_and_society",
    },
    {
      id: 26,
      title: "El Contrato Generacional Roto",
      text: "Los niños del grupo no conocieron el mundo anterior. Para ellos, esto es normal. Los adultos luchan por un regreso imposible; los jóvenes, por adaptación. '¿Para qué mundo los preparamos?', pregunta una maestra. ¿Debemos enseñarles sobre democracia y arte, o solo supervivencia?",
      choices: [
        {
          text: "Educación clásica",
          effect: { culture_preserved: true, practical_skills: -3 },
        },
        {
          text: "Supervivencia pura",
          effect: { survival_skills: 5, humanity_loss: true },
        },
        {
          text: "Balance pragmático",
          effect: { balanced_education: true, time: -2 },
        },
      ],
      philosophy: "education_purpose",
    },
    {
      id: 27,
      title: "La Última Transmisión",
      text: "La radio capta una transmisión: 'Si alguien escucha, la humanidad debe saber que...' y se corta. Triangular la señal costaría recursos vitales. Podría ser conocimiento crucial o las divagaciones de un moribundo. ¿Cuánto vale la posibilidad de significado en un mundo sin sentido?",
      choices: [
        {
          text: "Buscar la fuente",
          effect: { fuel: -5, mystery_solved: "maybe", morale: 3 },
        },
        {
          text: "Ignorar y sobrevivir",
          effect: { pragmatic: true, eternal_doubt: true },
        },
        {
          text: "Enviar respuesta",
          effect: { exposure_risk: true, contact_chance: true },
        },
      ],
      philosophy: "meaning_seeking",
    },
    {
      id: 28,
      title: "El Mercado de Órganos",
      text: "Un cirujano propone un sistema: los terminales donan órganos para salvar a los viables. 'Es puro cálculo de utilidad', argumenta. 'Uno muere en días, otro vive años'. Los moribundos tendrían voto. ¿Es esto pragmatismo médico o la pendiente hacia la deshumanización?",
      choices: [
        {
          text: "Sistema voluntario",
          effect: { medical_efficiency: true, moral_complexity: true },
        },
        {
          text: "Prohibir rotundamente",
          effect: { deaths_preventable: true, moral_clarity: true },
        },
        {
          text: "Caso por caso",
          effect: { flexible_ethics: true, conflict_potential: true },
        },
      ],
      philosophy: "bodily_autonomy",
    },
    {
      id: 29,
      title: "La Paradoja del Mesías",
      text: "Una niña muestra habilidades inexplicables: los zombis la evitan, las heridas sanan rápido cerca de ella. Algunos la ven como salvadora; otros, como anomalía peligrosa. Ella solo quiere ser normal. ¿Puede alguien ser obligado a ser salvador? ¿El potencial impone obligación?",
      choices: [
        {
          text: "Protegerla a toda costa",
          effect: { hope: 10, resource_drain: true },
        },
        {
          text: "Estudiarla éticamente",
          effect: { research: true, child_stress: true },
        },
        {
          text: "Dejarla elegir",
          effect: { uncertain_future: true, moral_integrity: true },
        },
      ],
      philosophy: "chosen_one",
    },
    {
      id: 30,
      title: "El Dilema del Traductor",
      text: "Encuentras un grupo que habla otro idioma. Sus gestos sugieren advertencia sobre algo al norte, pero también podrían estar pidiendo ayuda o amenazando. Malinterpretar podría ser fatal. ¿Arriesgas la confianza sin comprensión total? Wittgenstein diría: los límites de tu lenguaje son los límites de tu mundo.",
      choices: [
        {
          text: "Intentar comunicación",
          effect: { time: -1, understanding: "gradual" },
        },
        {
          text: "Evitar contacto",
          effect: { missed_opportunity: true, safety: true },
        },
        {
          text: "Seguir sus señales",
          effect: { trust_leap: true, unknown_outcome: true },
        },
      ],
      philosophy: "language_barriers",
    },
    {
      id: 31,
      title: "El Teatro del Fin",
      text: "Un grupo de actores representa obras para mantener la moral. Consumen recursos sin producir nada 'útil'. 'El arte es lo que nos separa de las bestias', argumentan. '¿Y la comida no nos separa de los muertos?', responden otros. ¿Es el arte lujo o necesidad del alma?",
      choices: [
        {
          text: "Apoyar el teatro",
          effect: { morale: 10, resources: -3, culture: true },
        },
        {
          text: "Solo trabajo útil",
          effect: { efficiency: 5, morale: -5, soul_death: true },
        },
        {
          text: "Arte con condiciones",
          effect: { balanced_culture: true, compromise: true },
        },
      ],
      philosophy: "art_necessity",
    },
    {
      id: 32,
      title: "La Lotería de Babilonia",
      text: "Propones un sistema donde las tareas peligrosas se asignan por lotería para evitar que siempre los mismos arriesguen. 'El azar es más justo que la elección', argumentas. Pero algunos son mejores para ciertas tareas. ¿Es la equidad del proceso más importante que la optimización del resultado?",
      choices: [
        {
          text: "Implementar lotería",
          effect: { fairness: true, efficiency: -3, morale: 3 },
        },
        {
          text: "Asignación por habilidad",
          effect: { optimization: true, inequality: true },
        },
        {
          text: "Sistema mixto",
          effect: { complex_system: true, balance_attempt: true },
        },
      ],
      philosophy: "fairness_vs_efficiency",
    },
    {
      id: 33,
      title: "El Golem Protector",
      text: "Construyes fortificaciones que funcionan pero requieren mantenimiento constante. Se vuelven una entidad que demanda sacrificio continuo. '¿Servimos a las murallas o nos sirven?', pregunta alguien. La seguridad se ha vuelto prisión. ¿Cuánta libertad vale la protección?",
      choices: [
        {
          text: "Mantener fortificaciones",
          effect: { security: 10, freedom: -5, labor_intensive: true },
        },
        {
          text: "Vida nómada",
          effect: { freedom: 10, danger: 10, mobility: true },
        },
        {
          text: "Defensas minimalistas",
          effect: { balanced_approach: true, moderate_risk: true },
        },
      ],
      philosophy: "security_vs_freedom",
    },
    {
      id: 34,
      title: "La Caja de Pandora Médica",
      text: "Un laboratorio contiene investigación sobre guerra biológica. Podría ayudar a entender el virus o liberar algo peor. El conocimiento promete poder; la ignorancia, seguridad. Una vez abierto, no hay vuelta atrás. ¿Es la curiosidad virtud o vicio cuando las consecuencias son absolutas?",
      choices: [
        {
          text: "Abrir con precauciones",
          effect: { knowledge: true, pandora_risk: true },
        },
        {
          text: "Sellar permanentemente",
          effect: { safety: true, ignorance: true },
        },
        {
          text: "Decisión futura",
          effect: { delayed_choice: true, ongoing_temptation: true },
        },
      ],
      philosophy: "dangerous_knowledge",
    },
    {
      id: 35,
      title: "El Espejo de Medusa",
      text: "Los zombis reaccionan a su reflejo con confusión momentánea. Alguien propone usar espejos como defensa, pero ver constantemente lo que nos espera si fallamos destruye la moral. ¿Es mejor enfrentar el horror directamente o mantener la ilusión de distancia?",
      choices: [
        {
          text: "Usar espejos",
          effect: { defense: 5, morale: -7, constant_reminder: true },
        },
        {
          text: "Evitar reflejos",
          effect: { psychological_comfort: true, tactical_disadvantage: true },
        },
        {
          text: "Uso selectivo",
          effect: { moderate_defense: true, controlled_exposure: true },
        },
      ],
      philosophy: "confronting_mortality",
    },
    {
      id: 36,
      title: "La Comuna de los Ciegos",
      text: "Un grupo de invidentes ha sobrevivido mejor que muchos videntes. Han desarrollado sistemas únicos basados en sonido y tacto. Ofrecen enseñar, pero requiere vendar los ojos por semanas. ¿Puedes confiar en otros sentidos cuando la vista ha sido tu principal defensa?",
      choices: [
        {
          text: "Aprender sus métodos",
          effect: { new_skills: true, vulnerability_period: true },
        },
        {
          text: "Intercambio de conocimientos",
          effect: { mutual_learning: true, time: -2 },
        },
        {
          text: "Observar solamente",
          effect: { limited_knowledge: true, safety: true },
        },
      ],
      philosophy: "ways_of_knowing",
    },
    {
      id: 37,
      title: "El Juicio de Paris Zombi",
      text: "Tres grupos ofrecen alianza, pero solo puedes elegir uno. El primero ofrece armas, el segundo medicina, el tercero conocimiento. Como Paris con las diosas, tu elección creará enemigos. ¿Qué valor prima cuando todos son necesarios pero mutuamente excluyentes?",
      choices: [
        {
          text: "Poder militar",
          effect: { weapons: 10, enemies: "healers_and_scholars" },
        },
        {
          text: "Capacidad médica",
          effect: { medicine: 10, enemies: "warriors_and_scholars" },
        },
        {
          text: "Sabiduría preservada",
          effect: { knowledge: 10, enemies: "warriors_and_healers" },
        },
      ],
      philosophy: "impossible_choices",
    },
    {
      id: 38,
      title: "La Pregunta de Nagel",
      text: "Un científico infectado pregunta: '¿Cómo es ser zombi?' Cree que entender su experiencia subjetiva es clave para la cura. Quiere que documentes su transformación desde dentro. Pero observar puede acelerar su cambio. ¿Vale la pena el conocimiento fenomenológico de la muerte de la consciencia?",
      choices: [
        {
          text: "Documentar todo",
          effect: { unique_knowledge: true, moral_cost: true },
        },
        {
          text: "Eutanasia compasiva",
          effect: { mercy: true, knowledge_lost: true },
        },
        {
          text: "Observación a distancia",
          effect: { partial_knowledge: true, safety: true },
        },
      ],
      philosophy: "consciousness_study",
    },
    {
      id: 39,
      title: "El Anillo de Giges",
      text: "Encuentras equipo de camuflaje que te hace casi invisible a los zombis. Podrías hacer misiones imposibles o escapar solo. El poder de la invisibilidad revela el carácter verdadero. ¿Qué harías si las consecuencias no pudieran alcanzarte?",
      choices: [
        {
          text: "Usarlo para el grupo",
          effect: { stealth_missions: true, hero_complex: true },
        },
        {
          text: "Compartir el secreto",
          effect: { group_capability: true, power_diluted: true },
        },
        {
          text: "Guardarlo para emergencias",
          effect: { secret_ace: true, moral_burden: true },
        },
      ],
      philosophy: "power_and_character",
    },
    {
      id: 40,
      title: "La Paradoja de Epicuro",
      text: "Si Dios es bueno, ¿por qué permite esto? Un sacerdote zombificado pero consciente ruega que le expliques. No puede morir, no puede vivir. Su fe se quiebra con cada palabra. ¿Ofreces consuelo con mentiras piadosas o verdad brutal a un alma atormentada?",
      choices: [
        {
          text: "Consuelo teológico",
          effect: { mercy: true, philosophical_dishonesty: true },
        },
        {
          text: "Honestidad brutal",
          effect: { truth: true, suffering_increased: true },
        },
        {
          text: "Silencio respetuoso",
          effect: { dignity_preserved: true, question_unanswered: true },
        },
      ],
      philosophy: "problem_of_evil",
    },
    {
      id: 41,
      title: "El Leviatán Comunitario",
      text: "Para sobrevivir al invierno, los grupos deben unirse bajo un líder absoluto. Será elegido pero luego incuestionable. Hobbes argumentaría que es necesario. Locke, que es tiranía. El frío no espera debates filosóficos. ¿Cambias libertad por supervivencia?",
      choices: [
        {
          text: "Aceptar autoridad absoluta",
          effect: { winter_survival: true, freedom_lost: true },
        },
        {
          text: "Mantener democracia",
          effect: { inefficiency: true, moral_high_ground: true },
        },
        {
          text: "Autoridad temporal limitada",
          effect: { compromise: true, future_conflict: true },
        },
      ],
      philosophy: "social_contract_extreme",
    },
    {
      id: 42,
      title: "La Máquina de Experiencias",
      text: "Un búnker tiene realidad virtual funcionando. Algunos quieren vivir sus últimos días en mundos perfectos falsos. 'Si vamos a morir, ¿por qué no morir felices?', argumentan. ¿Es una vida de placer falso mejor que una realidad de sufrimiento auténtico?",
      choices: [
        {
          text: "Permitir la fantasía",
          effect: { happiness: true, reality_abandoned: true },
        },
        {
          text: "Destruir la tentación",
          effect: { harsh_reality: true, authenticity: true },
        },
        {
          text: "Uso terapéutico limitado",
          effect: { mental_health_tool: true, addiction_risk: true },
        },
      ],
      philosophy: "experience_machine",
    },
    {
      id: 43,
      title: "El Dilema del Caminante",
      text: "Un explorador regresa con noticias de paraíso: una isla sin infectados. Pero olvidó el camino exacto. Intentar recordar bajo presión podría crear memorias falsas. ¿Confías en recuerdos fragmentados cuando la esperanza distorsiona la memoria?",
      choices: [
        {
          text: "Seguir sus recuerdos",
          effect: { hope_journey: true, uncertain_path: true },
        },
        {
          text: "Hipnosis o drogas",
          effect: { memory_extraction: true, mental_damage: true },
        },
        {
          text: "Expedición de búsqueda",
          effect: { systematic_search: true, resource_drain: true },
        },
      ],
      philosophy: "memory_reliability",
    },
    {
      id: 44,
      title: "La Ruleta Rusa Ética",
      text: "Seis viales: cinco vacunas, uno veneno. No hay forma de distinguirlos. Cinco vivirán, uno morirá. Esperar significa perder las vacunas. ¿Es el sacrificio aleatorio más ético que elegir quién muere? ¿O la aleatoriedad es solo cobardía moral disfrazada?",
      choices: [
        {
          text: "Distribución aleatoria",
          effect: { five_saved: true, random_death: true },
        },
        {
          text: "Rechazar el juego",
          effect: { moral_stance: true, vaccines_lost: true },
        },
        {
          text: "Un voluntario prueba",
          effect: { heroic_sacrifice: true, certainty: true },
        },
      ],
      philosophy: "random_vs_chosen_sacrifice",
    },
    {
      id: 45,
      title: "El Problema del Tranvía Temporal",
      text: "Puedes advertir al pasado sobre la plaga (encontraste una radio temporal experimental). Pero cambiar el pasado podría borrar tu presente, incluyendo a quienes amas ahora. ¿Tienes derecho a deshacer la existencia de los supervivientes actuales por un mundo que podría ser?",
      choices: [
        {
          text: "Enviar advertencia",
          effect: { temporal_paradox: true, existence_gamble: true },
        },
        {
          text: "Preservar la línea temporal",
          effect: { acceptance: true, guilt: true },
        },
        {
          text: "Mensaje críptico",
          effect: { minimal_change: true, butterfly_effect: true },
        },
      ],
      philosophy: "temporal_ethics",
    },
    {
      id: 46,
      title: "La Sinfonía del Silencio",
      text: "Un músico insiste en tocar cada atardecer. La música atrae zombis pero eleva espíritus. 'Morir con belleza es mejor que vivir sin alma', dice. Otros argumentan que el silencio es supervivencia. ¿Puede el espíritu humano sobrevivir sin expresión artística?",
      choices: [
        {
          text: "Permitir la música",
          effect: { morale: 12, zombie_attraction: true },
        },
        {
          text: "Prohibir todo ruido",
          effect: { safety: true, spiritual_death: true },
        },
        {
          text: "Música silenciosa",
          effect: { compromise_art: true, reduced_risk: true },
        },
      ],
      philosophy: "expression_vs_survival",
    },
    {
      id: 47,
      title: "El Juramento Hipocrático Roto",
      text: "Un doctor debe elegir: salvar a un niño con pocas chances o a tres adultos con alta probabilidad. Los recursos médicos alcanzan para un solo procedimiento. 'Primero no hacer daño', pero ¿a quién? La inacción también es una elección. El utilitarismo choca con el valor intrínseco.",
      choices: [
        {
          text: "Salvar al niño",
          effect: { moral_integrity: true, three_deaths: true },
        },
        {
          text: "Salvar a los tres",
          effect: { utilitarian_choice: true, child_death: true },
        },
        {
          text: "Dejar que el doctor elija",
          effect: { medical_ethics: true, responsibility_shifted: true },
        },
      ],
      philosophy: "medical_triage",
    },
    {
      id: 48,
      title: "La República de los Muertos",
      text: "Propones dar 'voto' simbólico a los fallecidos: qué habrían querido. Algunos lo ven como honor necesario; otros, como locura. '¿Los muertos tienen derechos?', preguntas. '¿Los vivos tienen obligaciones con ellos?' La democracia de los que fueron.",
      choices: [
        {
          text: "Honrar sus memorias",
          effect: { moral_continuity: true, living_burden: true },
        },
        {
          text: "Los vivos deciden",
          effect: { pragmatism: true, guilt: true },
        },
        {
          text: "Consejo de ancianos",
          effect: { wisdom_council: true, generational_bridge: true },
        },
      ],
      philosophy: "duties_to_dead",
    },
    {
      id: 49,
      title: "El Último Humano",
      text: "Un científico teoriza que cuando quede un solo humano, los zombis morirán. Es una carrera: sobrevivir hasta ser el último o encontrar la cura antes. Algunos sugieren acelerar el proceso. ¿Es genocidio si es por supervivencia de la especie? ¿O supervivencia sin otros es muerte igual?",
      choices: [
        {
          text: "Rechazar la teoría",
          effect: { moral_stance: true, theory_untested: true },
        },
        {
          text: "Preparar para ser último",
          effect: { isolation_preparation: true, dark_path: true },
        },
        {
          text: "Buscar alternativas",
          effect: { research_focus: true, hope_maintained: true },
        },
      ],
      philosophy: "last_man",
    },
    {
      id: 50,
      title: "La Pregunta Final",
      text: "Encuentras la cura, pero requiere tu vida para sintetizarla. No hay garantía de que otros la distribuyan correctamente. Es el dilema último: sacrificio personal por bien incierto. ¿Confías en la humanidad que queda? ¿Vale tu vida la posibilidad de redención? Sócrates bebería la cicuta. ¿Tú?",
      choices: [
        {
          text: "Sacrificio heroico",
          effect: { cure_created: true, player_death: true, legend: true },
        },
        {
          text: "Buscar otro camino",
          effect: { continued_search: true, moral_question: true },
        },
        {
          text: "Preparar sucesores",
          effect: { knowledge_transfer: true, delayed_cure: true },
        },
      ],
      philosophy: "ultimate_sacrifice",
    },
  ];

  const enemyTypes = [
    { name: "Zombi Común", hp: 15, def: 10, attack: 2, speed: "Lento", xp: 5 },
    { name: "Corredor", hp: 10, def: 14, attack: 3, speed: "Rápido", xp: 8 },
    {
      name: "Zombi Tanque",
      hp: 30,
      def: 8,
      attack: 5,
      speed: "Muy Lento",
      xp: 15,
    },
    {
      name: "Acechador",
      hp: 12,
      def: 16,
      attack: 4,
      speed: "Sigiloso",
      xp: 10,
    },
    {
      name: "Infectado Reciente",
      hp: 20,
      def: 12,
      attack: 4,
      speed: "Normal",
      xp: 7,
    },
    {
      name: "Zombi Tóxico",
      hp: 18,
      def: 11,
      attack: 3,
      speed: "Lento",
      xp: 12,
      special: "poison",
    },
    { name: "Berserker", hp: 25, def: 9, attack: 6, speed: "Errático", xp: 18 },
    { name: "Mutado", hp: 35, def: 13, attack: 7, speed: "Variable", xp: 25 },
  ];
  // --- Cartas de Combate (rojas) ---
  const combatCards = [
    {
      id: "c1",
      title: "Alarma en el almacén",
      text: "Un ruido metálico despierta a una pequeña horda cerca del depósito. Si actúas rápido, puedes sorprenderlos.",
      choices: [
        { text: "Iniciar combate (3 enemigos)", effect: { zombies: 3 } },
        {
          text: "Buscar cobertura (DEF +5 1 turno)",
          effect: { buff_defense: 5 },
        },
        { text: "Retirada táctica (morale -2)", effect: { morale: -2 } },
      ],
    },
    {
      id: "c2",
      title: "Emboscada en callejón",
      text: "Pasaje angosto con poca visibilidad. Los pasos arrastrados se multiplican.",
      choices: [
        { text: "Entrar en combate (4 enemigos)", effect: { zombies: 4 } },
        {
          text: "Granada improvisada (ammo -2, menos enemigos)",
          effect: { ammo: -2, zombies: 2 },
        },
        { text: "Replegarse y pasar turno", effect: { pass: true } },
      ],
    },
    {
      id: "c3",
      title: "Horda errante",
      text: "Una masa dispersa se aproxima. Se puede evitar con sigilo.",
      choices: [
        { text: "Enfrentar frontalmente (5 enemigos)", effect: { zombies: 5 } },
        {
          text: "Sigilo (requiere Destreza, morale +2)",
          effect: { morale: 2 },
        },
        {
          text: "Táctica de distracción (fuel -1, pasas turno)",
          effect: { fuel: -1, pass: true },
        },
      ],
    },
    {
      id: "c4",
      title: "Acechadores en ruinas",
      text: "Silencio incómodo entre edificios colapsados.",
      choices: [
        {
          text: "Peinar el área (3 enemigos, materiales +2 si ganas)",
          effect: { zombies: 3, materials: 2 },
        },
        { text: "Evitar conflicto (morale -1)", effect: { morale: -1 } },
        {
          text: "Colocar trampa (materials -2, próximos combates más fáciles)",
          effect: { materials: -2, trap: true },
        },
      ],
    },
  ];

  // --- Citas filosóficas por tema (se muestran aparte, no dentro de la narrativa) ---
  const philosophyQuotes = {
    absurdism: "“Hay que imaginarse a Sísifo feliz.” — Albert Camus",
    trolley_problem:
      "“El fin justifica los medios.” — Frase atribuida (discutida) a tradición utilitarista",
    justice_vs_revenge:
      "“Quien lucha con monstruos debe cuidar de no convertirse en uno.” — Nietzsche",
    social_contract:
      "“El hombre nace libre, y en todas partes está encadenado.” — Rousseau",
    problem_of_evil:
      "“O Dios quiere eliminar el mal y no puede, o puede y no quiere...” — Epicuro",
    chinese_room:
      "“Comprender no es solo manipular símbolos.” — Searle (paráfrasis)",
    experience_machine:
      "“¿Elegirías una vida de placer simulado?” — Nozick (paráfrasis)",
    identity: "“¿Qué nos hace ser los mismos?” — Paradoja de Teseo (alusión)",
    memory_reliability:
      "“La memoria es el escriba del alma.” — Aristóteles (atribuido)",
    prisoners_dilemma:
      "“La cooperación racional puede ser inestable.” — Teoría de juegos",
  };

  const weatherEffects = {
    sunny: { visibility: 1, zombie_speed: 1, morale: 2 },
    cloudy: { visibility: 0.9, zombie_speed: 1, morale: 0 },
    rain: { visibility: 0.7, zombie_speed: 0.9, morale: -2 },
    storm: { visibility: 0.5, zombie_speed: 0.8, morale: -5 },
    fog: { visibility: 0.3, zombie_speed: 1.1, morale: -3 },
    snow: { visibility: 0.6, zombie_speed: 0.7, morale: -1 },
  };

  // --- Funciones auxiliares mejoradas ---
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

  function createPlayer(name, profession, isDemo = false) {
    const attrs = isDemo
      ? {
          Fuerza: 14,
          Destreza: 13,
          Constitución: 15,
          Inteligencia: 12,
          Carisma: 11,
        }
      : {
          Fuerza: 10,
          Destreza: 10,
          Constitución: 10,
          Inteligencia: 10,
          Carisma: 10,
        };

    const prof = professions.find((p) => p.id === profession) || professions[5];

    Object.keys(prof.bonus).forEach((key) => {
      if (attrs[key]) attrs[key] += prof.bonus[key];
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
      munición: isDemo ? 30 : 10,
      energía: 10 + (prof.bonus.energía || 0),
      energíaMax: 10 + (prof.bonus.energía || 0),
      experiencia: 0,
      inventario: isDemo ? ["Pistola", "Botiquín", "Linterna"] : ["Navaja"],
      estado: "normal",
      hambre: 100,
      sed: 100,
      cordura: 100,
      infección: 0,
      habilidades: [],
      relacionesIds: [],
    };
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

  // --- Sistema de Guardado ---
  useEffect(() => {
    if (autoSave && gameState === "playing") {
      saveInterval.current = setInterval(() => {
        saveGame();
      }, 30000); // Auto-guardar cada 30 segundos
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
      usedCards,
      relationships,
      achievements,
      difficulty,
      log: log.slice(0, 20),
    };
    localStorage.setItem("zombieRPGSave", JSON.stringify(saveData));
    pushLog("Partida guardada", "system");
  }

  function loadGame() {
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
        },
      );
      setCamp(data.camp || { defense: 5, comfort: 3, storage: 20 });
      setMorale(data.morale || 50);
      setThreat(data.threat || 10);
      setUsedCards(data.usedCards || []);
      setRelationships(data.relationships || {});
      setAchievements(data.achievements || []);
      setDifficulty(data.difficulty || "normal");
      setLog(data.log || []);
      setGameState("playing");
      pushLog("Partida cargada", "system");
    }
  }

  // --- Inicialización y Demo mejorada ---
  useEffect(() => {
    if (gameState === "menu" && !demoMode) {
      // runDemo(); // DEMO DESHABILITADO
    }
    return () => {
      if (demoInterval.current) clearInterval(demoInterval.current);
    };
  }, []);

  function runDemo() {
    setDemoMode(true);

    const demoPlayers = [
      createPlayer("Sarah", "doctor", true),
      createPlayer("Marcus", "soldier", true),
      createPlayer("Elena", "psychologist", true),
    ];
    setPlayers(demoPlayers);
    setGameState("playing");
    setTab("story");

    pushLog("=== DEMO AUTOMÁTICA INICIADA ===", "success");
    pushLog("El grupo explora las ruinas de la civilización", "story");

    let step = 0;
    demoInterval.current = setInterval(() => {
      step++;

      switch (step) {
        case 1:
          setCurrentStoryCard(storyCards[Math.floor(Math.random() * 10)]);
          pushLog("Una decisión difícil se presenta", "story");
          break;
        case 2:
          pushLog(`Sarah usa su habilidad: Curación avanzada`, "success");
          pushLog(`Marcus tira iniciativa: ${roll(1, 20).total}`, "combat");
          break;
        case 3:
          spawnEnemies(3);
          pushLog("¡Encuentro hostil!", "danger");
          setTab("combat");
          break;
        case 4:
          const dmgRoll = roll(1, 20, 5);
          pushLog(
            `Marcus ataca: ${dmgRoll.natural} + ${dmgRoll.modifier} = ${dmgRoll.total} daño`,
            "combat",
          );
          break;
        case 5:
          pushLog("Elena mantiene la moral del grupo", "moral");
          setMorale((prev) => Math.min(100, prev + 10));
          break;
        case 6:
          pushLog("Combate finalizado - Victoria", "success");
          setEnemies([]);
          updatePlayerExp(0, 15);
          break;
        case 7:
          pushLog("Recursos encontrados: +3 comida, +2 agua", "resource");
          setResources((prev) => ({
            ...prev,
            food: prev.food + 3,
            water: prev.water + 2,
          }));
          break;
        case 8:
          advanceTime();
          checkSurvivalConditions();
          break;
        case 9:
          pushLog(
            "Sistema de relaciones: Sarah y Marcus mejoran su cooperación",
            "moral",
          );
          break;
        case 10:
          pushLog(
            "=== DEMO COMPLETADA - TODOS LOS SISTEMAS FUNCIONAN ===",
            "success",
          );
          setDemoMode(false);
          clearInterval(demoInterval.current);
          setTimeout(() => setGameState("menu"), 3000);
          break;
      }
    }, 2500);
  }

  // --- Sistema de progresión mejorado ---
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

    // Mejoras de atributos
    const attrBonus = { ...player.atributos };
    const mainAttr = [
      "Fuerza",
      "Destreza",
      "Constitución",
      "Inteligencia",
      "Carisma",
    ][Math.floor(Math.random() * 5)];
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

    // Desbloquear habilidad especial
    if (newLevel % 3 === 0) {
      unlockSkill(playerIndex);
    }
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

  // --- Gestión del juego mejorada ---
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
    setUsedCards([]);
    setRelationships({});
    setAchievements([]);
    setGameState("playing");
    setTab("story");

    pushLog("=== NUEVA PARTIDA INICIADA ===", "success");
    pushLog("Día 1: El mundo que conocías ya no existe...", "story");

    setTimeout(() => drawStoryCard(), 1000);
  }

  function drawStoryCard() {
    const availableCards = storyCards.filter(
      (card) => !usedCards.includes(card.id),
    );

    if (availableCards.length === 0) {
      setUsedCards([]);
      pushLog(
        "Todas las historias han sido contadas. El ciclo comienza de nuevo...",
        "story",
      );
      return drawStoryCard();
    }

    const card =
      availableCards[Math.floor(Math.random() * availableCards.length)];
    setCurrentStoryCard(card);
    setUsedCards((prev) => [...prev, card.id]);
    pushLog(`Nueva situación: ${card.title}`, "story");

    // Efecto filosófico en la moral
    if (card.philosophy) {
      const philosophicalImpact = Math.floor(Math.random() * 10) - 5;
      setMorale((prev) =>
        Math.max(0, Math.min(100, prev + philosophicalImpact)),
      );
    }
  }

  function handleStoryChoice(choice) {
    pushLog(`Decisión tomada: ${choice.text}`, "info");

    // Sistema de consecuencias complejas
    Object.entries(choice.effect).forEach(([key, value]) => {
      switch (key) {
        case "zombies":
          spawnEnemies(value);
          pushLog(`¡${value} enemigos aparecen!`, "danger");
          setTab("combat");
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
            "moral",
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
        default:
          // Efectos especiales narrativos
          handleSpecialEffect(key, value);
      }
    });

    setCurrentStoryCard(null);
    checkMoraleEffects();
    nextTurn();
  }

  function handleKarma(value) {
    // Sistema de karma que afecta eventos futuros
    const currentKarma =
      achievements.find((a) => a.type === "karma")?.value || 0;
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
    // Efectos narrativos especiales
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
        const progress =
          achievements.find((a) => a.type === "cure")?.value || 0;
        setAchievements((prev) => [
          ...prev.filter((a) => a.type !== "cure"),
          { type: "cure", value: progress + 20 },
        ]);
      },
      philosophical_strength: () => {
        pushLog("La reflexión fortalece al grupo", "moral");
        setPlayers((prev) =>
          prev.map((p) => ({ ...p, cordura: Math.min(100, p.cordura + 10) })),
        );
      },
    };

    if (specialEffects[effect]) {
      specialEffects[effect]();
    }
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
        })),
      );
    } else if (morale > 80) {
      pushLog("¡La moral está alta!", "success");
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          energía: Math.min(p.energíaMax, p.energía + 1),
        })),
      );
    }
  }

  function nextTurn() {
    const next =
      (activeIndex + 1) % players.filter((p) => p.estado !== "muerto").length;
    setActiveIndex(next);

    if (next === 0) {
      setRound((prev) => prev + 1);

      // Eventos periódicos
      if (round % 4 === 0) advanceTime();
      if (round % 8 === 0) consumeResources();
      if (round % 12 === 0) randomEvent();
      if (round % 20 === 0) checkWinConditions();
    }

    // Regeneración leve
    if (camp.comfort > 5) {
      updatePlayer(activeIndex, {
        energía: Math.min(
          players[activeIndex].energíaMax,
          players[activeIndex].energía + 1,
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

      // Evento de nuevo día
      if (day % 7 === 0) {
        pushLog("Ha pasado una semana...", "story");
        weeklyEvent();
      }
    }

    setTime(times[nextIndex]);
    pushLog(`${getTimeDescription(times[nextIndex])}`, "info");

    // Efectos del tiempo
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
    const consumption = {
      food: players.filter((p) => p.estado !== "muerto").length,
      water: players.filter((p) => p.estado !== "muerto").length,
    };

    setResources((prev) => ({
      ...prev,
      food: Math.max(0, prev.food - consumption.food),
      water: Math.max(0, prev.water - consumption.water),
    }));

    // Efectos de escasez
    if (resources.food <= 0) {
      pushLog("¡Sin comida! El hambre debilita al grupo", "danger");
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          hambre: Math.max(0, p.hambre - 25),
          pv: Math.max(1, p.pv - 2),
        })),
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
        })),
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
          setCamp((prev) => ({
            ...prev,
            defense: Math.max(0, prev.defense - 2),
          }));
        },
      },
      {
        name: "Comerciantes",
        effect: () => {
          pushLog("Comerciantes nómadas ofrecen intercambio", "info");
          setTab("trade");
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
        name: "Cachés oculto",
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
    // Eventos semanales significativos
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

    // Posible deserción si la moral es muy baja
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

    // Chequear infección
    players.forEach((player, idx) => {
      if (player.infección >= 100) {
        updatePlayer(idx, { estado: "muerto" });
        pushLog(`${player.nombre} sucumbe a la infección`, "death");
        setMorale((prev) => Math.max(0, prev - 15));
      }
    });

    // Victoria por supervivencia
    if (day >= 100) {
      handleVictory("survival");
    }
  }

  function checkWinConditions() {
    const cureProgress =
      achievements.find((a) => a.type === "cure")?.value || 0;

    if (cureProgress >= 100) {
      handleVictory("cure");
    } else if (
      camp.defense >= 20 &&
      resources.food > 50 &&
      resources.water > 50
    ) {
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
        enemyTypes[
          Math.floor(Math.random() * Math.min(enemyTypes.length, day / 10 + 2))
        ];
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

  function performCombatAction(action, targetId = null) {
    const actor = players[activeIndex];

    // Sistema de combate mejorado con habilidades
    switch (action) {
      case "attack":
        if (targetId && enemies.length > 0) {
          const enemy = enemies.find((e) => e.id === targetId);
          if (enemy) {
            const hasWeapon =
              actor.inventario.includes("Pistola") ||
              actor.inventario.includes("Rifle");
            const attackBonus = hasWeapon ? 5 : 0;
            const attackRoll = roll(
              1,
              20,
              mod(actor.atributos.Fuerza) + attackBonus,
            );
            const isCritical = attackRoll.natural === 20;
            const hit = attackRoll.total >= enemy.def || isCritical;

            pushLog(
              `${actor.nombre} ataca a ${enemy.name}: ${attackRoll.total} vs DEF ${enemy.def}`,
              "combat",
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
                pushLog(
                  `${enemy.name} eliminado (+${enemy.xp} EXP)`,
                  "success",
                );
                updatePlayerExp(activeIndex, enemy.xp);
                setThreat((prev) => Math.max(0, prev - 5));
              } else {
                setEnemies((prev) =>
                  prev.map((e) =>
                    e.id === targetId
                      ? { ...e, currentHp: enemy.currentHp }
                      : e,
                  ),
                );
              }

              // Consumir munición si usa arma
              if (hasWeapon) {
                updatePlayer(activeIndex, {
                  munición: Math.max(0, actor.munición - 1),
                });
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
          pushLog(
            `${actor.nombre} usa medicina (+${healAmount} PV)`,
            "success",
          );
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

    // Contraataque enemigo
    if (enemies.length > 0 && action !== "flee") {
      setTimeout(() => enemyAttack(), 500);
    } else if (enemies.length === 0) {
      pushLog("¡Victoria! Todos los enemigos eliminados", "success");
      setMorale((prev) => Math.min(100, prev + 5));
      setTimeout(() => setTab("story"), 1000);
    }

    nextTurn();
  }

  function useSpecialAbility() {
    const actor = players[activeIndex];

    // Habilidades por profesión
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
      const target = players.filter((p) => p.estado !== "muerto")[
        Math.floor(
          Math.random() * players.filter((p) => p.estado !== "muerto").length,
        )
      ];

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
        pushLog(
          `${enemy.name} ataca a ${target.nombre}: -${damage} PV`,
          "danger",
        );

        if (target.pv <= 0) {
          updatePlayer(targetIndex, { estado: "muerto" });
          pushLog(`${target.nombre} ha caído...`, "death");
          setMorale((prev) => Math.max(0, prev - 20));
        }
      } else {
        pushLog(
          `${enemy.name} falla su ataque contra ${target.nombre}`,
          "info",
        );
      }
    });
  }

  // --- Sistema de mazos (acciones) ---
  function drawStoryFromDeck() {
    // Usa el sistema existente pero lo expone como "robar del mazo"
    drawStoryCard();
    pushLog("Robas una carta de decisión (morado)", "story");
  }

  function drawCombatCard() {
    if (combatCards.length === 0) return;
    // Selecciona una carta al azar que no esté en descartes
    const available = combatCards.filter((c) => !combatDiscard.includes(c.id));
    const card =
      available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : combatCards[Math.floor(Math.random() * combatCards.length)];
    setCurrentCombatCard(card);
    setTab("story");
    pushLog(`Carta de combate: ${card.title}`, "danger");
  }

  function shuffleStoryDeck() {
    pushLog("Mazo de decisiones barajado", "system");
  }

  function reintegrateStoryDiscards() {
    setUsedCards([]);
    setStoryDiscard([]);
    pushLog("Descartes de decisiones reintegrados al mazo", "system");
  }

  function shuffleCombatDeck() {
    pushLog("Mazo de combate barajado", "system");
  }

  function reintegrateCombatDiscards() {
    setCombatDiscard([]);
    pushLog("Descartes de combate reintegrados al mazo", "system");
  }

  function handleCombatCardChoice(choice) {
    pushLog(`Decisión de combate: ${choice.text}`, "info");
    Object.entries(choice.effect).forEach(([key, value]) => {
      switch (key) {
        case "zombies":
          spawnEnemies(value);
          setTab("combat");
          break;
        case "ammo":
        case "fuel":
        case "materials":
        case "food":
        case "water":
        case "medicine":
          setResources((prev) => ({
            ...prev,
            [key]: Math.max(0, prev[key] + value),
          }));
          break;
        case "morale":
          setMorale((prev) => Math.max(0, Math.min(100, prev + value)));
          break;
        case "pass":
          // solo pasa turno
          break;
      }
    });
    // descartar carta y avanzar
    if (currentCombatCard)
      setCombatDiscard((prev) => [...prev, currentCombatCard.id]);
    setCurrentCombatCard(null);
    nextTurn();
  }

  // --- Componentes de UI mejorados ---
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
            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 mb-2 animate-pulse shadow-red">
              Apocalipsis Zombie
            </h1>
            <h2 className="text-6xl font-bold text-neutral-300 mb-4">RPG</h2>
            <p className="text-xl text-red-400 mb-8">
              Sistema d20 · Edición Filosófica
            </p>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto italic">
              "En el fin del mundo, cada decisión revela quiénes somos
              realmente"
            </p>

            {demoMode ? (
              <div className="mb-8 p-6 bg-black/50 rounded-2xl border border-red-900 backdrop-blur">
                <p className="text-yellow-400 text-xl animate-pulse">
                  🎮 Demo en progreso...
                </p>
                <p className="text-sm text-neutral-400 mt-2">
                  Verificando todos los sistemas
                </p>
                <div className="mt-4 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-600 to-yellow-500 animate-progress"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={startNewGame}
                  className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-xl transition-all transform hover:scale-105 shadow-2xl"
                >
                  🎮 NUEVA PARTIDA
                </button>

                {localStorage.getItem("zombieRPGSave") && (
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
            )}

            {showCredits && (
              <div className="mt-8 p-4 bg-black/50 rounded-xl text-sm text-neutral-400">
                <p className="mb-2">Sistema completo de juego de rol</p>
                <p className="mb-2">
                  50 cartas narrativas con dilemas filosóficos
                </p>
                <p className="mb-2">Sistema de combate táctico d20</p>
                <p>Múltiples finales y caminos narrativos</p>
              </div>
            )}

            <div className="mt-12 text-xs text-neutral-500">
              <p>Versión 2.0 Ultimate · Sistema d20 Completo</p>
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
          <h2 className="text-4xl font-bold text-red-500 mb-6">
            ⏸️ JUEGO PAUSADO
          </h2>

          <div className="mb-6 p-4 bg-neutral-800/50 rounded-xl">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-neutral-400">Día:</div>
              <div className="text-neutral-200 font-bold">{day}</div>
              <div className="text-neutral-400">Supervivientes:</div>
              <div className="text-neutral-200 font-bold">
                {players.filter((p) => p.estado !== "muerto").length}/
                {players.length}
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
                if (
                  confirm(
                    "¿Seguro que quieres abandonar? El progreso no guardado se perderá.",
                  )
                ) {
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
      threat > 50
        ? "text-red-500"
        : threat > 25
          ? "text-yellow-500"
          : "text-green-500";

    return (
      <header className="sticky top-0 z-40 bg-gradient-to-b from-black via-neutral-950/95 to-transparent backdrop-blur-md">
        <div className="border-b border-red-900/50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                  🧟 Apocalipsis Zombie
                </h1>
                <div className="flex gap-2 text-xs">
                  <StatusBadge icon="📅" label={`Día ${day}`} />
                  <StatusBadge
                    icon={
                      time === "dawn"
                        ? "🌅"
                        : time === "day"
                          ? "☀️"
                          : time === "dusk"
                            ? "🌆"
                            : "🌙"
                    }
                    label={time}
                  />
                  <StatusBadge
                    icon="👥"
                    label={`${survivorsAlive}/${players.length}`}
                  />
                  <StatusBadge
                    icon="⚠️"
                    label={threat}
                    className={dangerLevel}
                  />
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
              <TabButton
                active={tab === "story"}
                onClick={() => setTab("story")}
              >
                📖 Historia
              </TabButton>
              <TabButton
                active={tab === "characters"}
                onClick={() => setTab("characters")}
              >
                👥 Personajes
              </TabButton>
              <TabButton
                active={tab === "combat"}
                onClick={() => setTab("combat")}
              >
                ⚔️ Combate
              </TabButton>
              <TabButton active={tab === "camp"} onClick={() => setTab("camp")}>
                🏕️ Campamento
              </TabButton>
              <TabButton
                active={tab === "inventory"}
                onClick={() => setTab("inventory")}
              >
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
      <span
        className={`px-2 py-1 bg-neutral-900 rounded-lg border border-neutral-800 ${className}`}
      >
        {icon} {label}
      </span>
    );
  }

  function ResourceBar() {
    const criticalResources = resources.food < 5 || resources.water < 5;

    return (
      <div
        className={`flex gap-3 text-sm px-3 py-1 rounded-lg ${criticalResources ? "bg-red-950 border border-red-800" : "bg-neutral-900 border border-neutral-800"}`}
      >
        <ResourceIcon
          icon="🍖"
          value={resources.food}
          critical={resources.food < 5}
        />
        <ResourceIcon
          icon="💧"
          value={resources.water}
          critical={resources.water < 5}
        />
        <ResourceIcon
          icon="💊"
          value={resources.medicine}
          critical={resources.medicine < 3}
        />
        <ResourceIcon icon="⛽" value={resources.fuel} />
        <ResourceIcon icon="🔫" value={resources.ammo} />
        <ResourceIcon icon="🔨" value={resources.materials} />
      </div>
    );
  }

  function ResourceIcon({ icon, value, critical = false }) {
    return (
      <span
        className={`flex items-center gap-1 ${critical ? "text-red-400 animate-pulse" : ""}`}
      >
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

  function StoryTab() {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Panel de mazos */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-purple-800 bg-purple-950/20">
            <h4 className="font-bold text-purple-300 mb-2">
              🎴 Mazo de Decisiones
            </h4>
            <div className="flex gap-2">
              <button
                onClick={drawStoryFromDeck}
                className="px-4 py-2 bg-purple-900 hover:bg-purple-800 rounded-lg"
              >
                Robar
              </button>
              <button
                onClick={shuffleStoryDeck}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
              >
                Barajar
              </button>
              <button
                onClick={reintegrateStoryDiscards}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
              >
                Reintegrar descartes
              </button>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-red-800 bg-red-950/20">
            <h4 className="font-bold text-red-300 mb-2">⚔️ Mazo de Combate</h4>
            <div className="flex gap-2">
              <button
                onClick={drawCombatCard}
                className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg"
              >
                Robar
              </button>
              <button
                onClick={shuffleCombatDeck}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
              >
                Barajar
              </button>
              <button
                onClick={reintegrateCombatDiscards}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
              >
                Reintegrar descartes
              </button>
              <button
                onClick={() => {
                  nextTurn();
                  pushLog("Pasas el turno.", "info");
                }}
                className="ml-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
              >
                Pasar turno
              </button>
            </div>
          </div>
        </div>

        {/* Render de carta actual (Decisión o Combate) */}
        {currentStoryCard ? (
          <div className="bg-gradient-to-br from-purple-900/20 via-neutral-950 to-black border-2 border-purple-900 rounded-3xl p-8 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500">
                {currentStoryCard.title}
              </h2>
              {currentStoryCard.philosophy && (
                <span className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs">
                  💭 {currentStoryCard.philosophy.replace("_", " ")}
                </span>
              )}
            </div>
            <p className="text-neutral-300 leading-relaxed text-lg mb-6 italic">
              {currentStoryCard.text}
            </p>
            {currentStoryCard.philosophy &&
              philosophyQuotes[currentStoryCard.philosophy] && (
                <blockquote className="text-sm text-purple-300 border-l-2 border-purple-800 pl-3 mb-6">
                  {philosophyQuotes[currentStoryCard.philosophy]}
                </blockquote>
              )}
            <div className="grid md:grid-cols-3 gap-4">
              {currentStoryCard.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStoryChoice(choice)}
                  className="group p-5 bg-gradient-to-br from-neutral-900 to-neutral-950 hover:from-purple-950 hover:to-neutral-950 border border-neutral-700 hover:border-purple-700 rounded-xl transition-all text-left transform hover:scale-105"
                >
                  <span className="text-lg font-semibold group-hover:text-purple-300 transition-colors">
                    → {choice.text}
                  </span>
                  {choice.effect.karma && (
                    <div className="mt-2 text-xs text-neutral-500">
                      Karma: {choice.effect.karma > 0 ? "+" : ""}
                      {choice.effect.karma}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : currentCombatCard ? (
          <div className="bg-gradient-to-br from-red-900/20 via-neutral-950 to-black border-2 border-red-900 rounded-3xl p-8 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-500">
                {currentCombatCard.title}
              </h2>
              <span className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-xs">
                ⚔️ combate
              </span>
            </div>
            <p className="text-neutral-300 leading-relaxed text-lg mb-6 italic">
              {currentCombatCard.text}
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {currentCombatCard.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCombatCardChoice(choice)}
                  className="group p-5 bg-gradient-to-br from-neutral-900 to-neutral-950 hover:from-red-950 hover:to-neutral-950 border border-neutral-700 hover:border-red-700 rounded-xl transition-all text-left transform hover:scale-105"
                >
                  <span className="text-lg font-semibold group-hover:text-red-300 transition-colors">
                    → {choice.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-neutral-900 to-black rounded-3xl border border-neutral-800">
            <p className="text-xl text-neutral-400 mb-6">
              El destino aguarda tu próxima decisión o combate...
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={drawStoryFromDeck}
                className="px-8 py-4 bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                🎴 Robar Decisión
              </button>
              <button
                onClick={drawCombatCard}
                className="px-8 py-4 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                ⚔️ Robar Combate
              </button>
            </div>
          </div>
        )}

        <MoraleIndicator />
        <SurvivorsOverview />
      </div>
    );
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
          <h3 className="text-lg font-bold">
            💭 Moral del Grupo: {moraleLevel}
          </h3>
          <span className="text-2xl font-bold">{morale}%</span>
        </div>
        <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${moraleColor} transition-all duration-500`}
            style={{ width: `${morale}%` }}
          />
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
                <StatMini
                  label="Infección"
                  value={player.infección}
                  max={100}
                  danger
                />
              </div>
            </div>

            {player.habilidadEspecial && (
              <div className="mt-3 pt-3 border-t border-neutral-800">
                <p className="text-xs text-purple-400">
                  ⚡ {player.habilidadEspecial}
                </p>
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

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${estados[estado].color} text-white`}
      >
        {estados[estado].text}
      </span>
    );
  }

  function HealthBar({ current, max }) {
    const percentage = (current / max) * 100;
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
          <div
            className={`h-full bg-gradient-to-r ${color} transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  function EnergyBar({ current, max }) {
    const percentage = (current / max) * 100;

    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-neutral-400">Energía</span>
          <span>
            {current}/{max}
          </span>
        </div>
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  function StatMini({ label, value, max, danger = false }) {
    const percentage = (value / max) * 100;
    const isLow = percentage < 30;
    const color = danger
      ? percentage > 70
        ? "text-red-400"
        : ""
      : isLow
        ? "text-yellow-400"
        : "";

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
                const newPlayer = createPlayer(
                  `Superviviente ${players.length + 1}`,
                  "survivor",
                );
                setPlayers((prev) => [...prev, newPlayer]);
                pushLog(`${newPlayer.nombre} se une al grupo`, "success");
              }}
              className="mt-6 w-full px-4 py-3 bg-green-900 hover:bg-green-800 rounded-xl transition-all"
            >
              ➕ Añadir Superviviente
            </button>
          </div>
        </div>

        <div>
          {selectedPlayer && <CharacterDetails player={selectedPlayer} />}
        </div>
      </div>
    );
  }

  function CharacterCard({
    player,
    idx,
    active,
    selected,
    onSelect,
    onUpdate,
  }) {
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
          <span className="text-sm font-bold text-yellow-400">
            Nv.{player.nivel}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1 mb-3">
          {Object.entries(player.atributos).map(([attr, value]) => (
            <div key={attr} className="text-center">
              <div className="text-xs text-neutral-500">
                {attr.substring(0, 3)}
              </div>
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

        <div className="mt-2 text-xs text-neutral-400">
          EXP: {player.experiencia}/{player.nivel * 50}
        </div>
      </div>
    );
  }

  function CharacterDetails({ player }) {
    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">{player.nombre}</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-neutral-400 mb-2">
              Estadísticas
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>DEF: {player.defensa}</div>
              <div>Munición: {player.munición}</div>
              <div>
                Mochila: {player.inventario.length}/{player.mochila}
              </div>
              <div>Estado: {player.estado}</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-neutral-400 mb-2">
              Inventario
            </h4>
            <div className="flex flex-wrap gap-2">
              {player.inventario.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-neutral-800 rounded text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {player.habilidades.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-neutral-400 mb-2">
                Habilidades
              </h4>
              <div className="space-y-1">
                {player.habilidades.map((skill, i) => (
                  <div
                    key={i}
                    className="px-2 py-1 bg-purple-900/30 rounded text-sm text-purple-400"
                  >
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
    const actor =
      players.filter((p) => p.estado !== "muerto")[activeIndex] || players[0];

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
        <h3 className="text-2xl font-bold text-red-500 mb-6">
          ⚔️ ZONA DE COMBATE
        </h3>

        <div className="mb-4 p-4 bg-neutral-900 rounded-xl border border-neutral-800">
          <p className="text-sm text-neutral-400">Turno actual:</p>
          <p className="text-xl font-bold">{actor.nombre}</p>
          <p className="text-sm">
            DEF {actor.defensa} • PV {actor.pv}/{actor.pvMax}
          </p>
        </div>

        <div className="grid gap-3">
          {enemies.map((enemy) => (
            <EnemyCard
              key={enemy.id}
              enemy={enemy}
              onAttack={() => performCombatAction("attack", enemy.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  function EnemyCard({ enemy, onAttack }) {
    const hpPercentage = (enemy.currentHp / enemy.hp) * 100;

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
          <button
            onClick={onAttack}
            className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg transition-all font-bold"
          >
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

        {enemy.special && (
          <div className="mt-2 text-xs text-purple-400">
            ⚠️ Habilidad especial: {enemy.special}
          </div>
        )}
      </div>
    );
  }

  function CombatActions({ actor }) {
    const hasAmmo = actor.munición > 0;
    const hasMedicine = resources.medicine > 0;
    const hasEnergy = actor.energía >= 3;

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
              hasEnergy
                ? "bg-purple-900 hover:bg-purple-800"
                : "bg-neutral-800 opacity-50 cursor-not-allowed"
            }`}
          >
            ⚡ Habilidad Especial (-3 Energía)
          </button>

          <button
            onClick={() => performCombatAction("heal")}
            disabled={!hasMedicine}
            className={`w-full px-4 py-3 rounded-lg transition-all font-bold ${
              hasMedicine
                ? "bg-green-900 hover:bg-green-800"
                : "bg-neutral-800 opacity-50 cursor-not-allowed"
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
            <span className={!hasAmmo ? "text-red-400" : ""}>
              {actor.munición}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Energía:</span>
            <span className={actor.energía < 3 ? "text-yellow-400" : ""}>
              {actor.energía}/{actor.energíaMax}
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
          <p className="text-sm text-neutral-500 mt-2">
            La zona está temporalmente segura
          </p>
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
              spawnEnemies(
                Math.floor(Math.random() * 2) + 3 + Math.floor(threat / 20),
              );
              pushLog("¡Una horda se acerca!", "danger");
            }}
            className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-xl font-bold transition-all"
          >
            ⚠️ Provocar Horda
          </button>
        </div>

        <div className="mt-8 p-4 bg-neutral-900 rounded-xl max-w-md mx-auto">
          <p className="text-sm text-neutral-400">
            Nivel de amenaza actual:{" "}
            <span className="text-red-400 font-bold">{threat}</span>
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            A mayor amenaza, más peligrosos serán los encuentros
          </p>
        </div>
      </div>
    );
  }

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
          <CampStat
            icon="🛡️"
            label="Defensa"
            value={camp.defense}
            max={20}
            description="Protección contra ataques"
          />
          <CampStat
            icon="🛏️"
            label="Comodidad"
            value={camp.comfort}
            max={20}
            description="Recuperación de energía"
          />
          <CampStat
            icon="📦"
            label="Almacenamiento"
            value={camp.storage}
            max={50}
            description="Capacidad de recursos"
          />
        </div>

        <div className="mt-6 p-4 bg-neutral-800 rounded-xl">
          <h4 className="font-bold mb-3">Estado del Campamento</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Seguridad:</span>
              <span
                className={
                  camp.defense > 10 ? "text-green-400" : "text-yellow-400"
                }
              >
                {camp.defense > 15
                  ? "Fortificado"
                  : camp.defense > 10
                    ? "Seguro"
                    : camp.defense > 5
                      ? "Vulnerable"
                      : "Crítico"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Moral por comodidad:</span>
              <span>+{Math.floor(camp.comfort / 4)}/día</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Capacidad usada:</span>
              <span>
                {Object.values(resources).reduce((a, b) => a + b, 0)}/
                {camp.storage}
              </span>
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
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
            style={{ width: `${percentage}%` }}
          />
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
            setCamp((prev) => ({
              ...prev,
              defense: Math.min(20, prev.defense + 5),
            }));
            setResources((prev) => ({
              ...prev,
              materials: prev.materials - 10,
            }));
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
            setCamp((prev) => ({
              ...prev,
              comfort: Math.min(20, prev.comfort + 3),
            }));
            setResources((prev) => ({
              ...prev,
              materials: prev.materials - 5,
              food: prev.food - 3,
            }));
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
            setCamp((prev) => ({
              ...prev,
              storage: Math.min(50, prev.storage + 10),
            }));
            setResources((prev) => ({
              ...prev,
              materials: prev.materials - 8,
            }));
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
          <p className="text-sm text-yellow-400">
            💡 Consejo: Mantén las defensas altas para reducir los ataques
            nocturnos
          </p>
        </div>
      </div>
    );
  }

  function UpgradeCard({ upgrade, resources }) {
    const canAfford = Object.entries(upgrade.cost).every(
      ([res, amount]) => resources[res] >= amount,
    );

    return (
      <div
        className={`p-4 rounded-xl border ${canAfford ? "bg-neutral-800 border-neutral-700" : "bg-neutral-900 border-neutral-800 opacity-50"}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold">{upgrade.name}</h4>
            <p className="text-sm text-green-400 mt-1">{upgrade.effect}</p>
            <div className="flex gap-2 mt-2">
              {Object.entries(upgrade.cost).map(([res, amount]) => (
                <span
                  key={res}
                  className="text-xs bg-neutral-900 px-2 py-1 rounded"
                >
                  {res}: {amount}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={upgrade.action}
            disabled={!canAfford}
            className={`px-4 py-2 rounded-lg transition-all ${
              canAfford
                ? "bg-blue-900 hover:bg-blue-800"
                : "bg-neutral-800 cursor-not-allowed"
            }`}
          >
            Construir
          </button>
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
                <span>
                  {players.filter((p) => p.estado !== "muerto").length}/día
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Agua:</span>
                <span>
                  {players.filter((p) => p.estado !== "muerto").length}/día
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-neutral-800 rounded-xl">
            <h4 className="font-bold mb-2">Días Restantes</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Con comida actual:</span>
                <span
                  className={resources.food < 5 ? "text-red-400 font-bold" : ""}
                >
                  {Math.floor(
                    resources.food /
                      players.filter((p) => p.estado !== "muerto").length,
                  )}{" "}
                  días
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Con agua actual:</span>
                <span
                  className={
                    resources.water < 5 ? "text-red-400 font-bold" : ""
                  }
                >
                  {Math.floor(
                    resources.water /
                      players.filter((p) => p.estado !== "muerto").length,
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
        className={`p-4 rounded-xl text-center ${critical ? "bg-red-950 border border-red-800 animate-pulse" : "bg-neutral-800"}`}
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
          {players.map((player) => (
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
                        updatePlayer(players.indexOf(player), {
                          munición: player.munición + 10,
                        });
                        setResources((prev) => ({
                          ...prev,
                          ammo: prev.ammo - 1,
                        }));
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
                        <span
                          key={i}
                          className="px-2 py-1 bg-neutral-700 rounded text-xs"
                        >
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
        `Tirada ${dice}d${sides}${modifier !== 0 ? (modifier > 0 ? "+" : "") + modifier : ""}: ${result.rolls.join(", ")} = ${result.total}`,
        context === "combat" ? "combat" : "info",
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
                <button
                  onClick={() => setModifier((prev) => prev - 1)}
                  className="px-3 py-2 bg-neutral-800 rounded"
                >
                  -
                </button>
                <input
                  type="number"
                  value={modifier}
                  onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-neutral-800 rounded text-center outline-none focus:ring-2 ring-red-800"
                />
                <button
                  onClick={() => setModifier((prev) => prev + 1)}
                  className="px-3 py-2 bg-neutral-800 rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-400">
                Tiradas Rápidas:
              </label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  onClick={() => performRoll(3, 6)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded"
                >
                  3d6
                </button>
                <button
                  onClick={() => performRoll(2, 10)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded"
                >
                  2d10
                </button>
                <button
                  onClick={() => performRoll(4, 6)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded"
                >
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
            <div className="text-5xl font-black text-red-400 mb-2">
              {lastRoll.result.total}
            </div>
            <div className="text-sm text-neutral-400">
              {lastRoll.dice}d{lastRoll.sides}: [
              {lastRoll.result.rolls.join(", ")}]
              {lastRoll.modifier !== 0 &&
                ` ${lastRoll.modifier > 0 ? "+" : ""}${lastRoll.modifier}`}
            </div>
            {lastRoll.result.natural === 20 &&
              lastRoll.dice === 1 &&
              lastRoll.sides === 20 && (
                <div className="text-yellow-400 font-bold mt-2 animate-pulse">
                  ⭐ ¡CRÍTICO! ⭐
                </div>
              )}
            {lastRoll.result.natural === 1 &&
              lastRoll.dice === 1 &&
              lastRoll.sides === 20 && (
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
          <ReferenceRow
            label="Ataque"
            formula="1d20 + mod(Atributo) ≥ DEF objetivo"
          />
          <ReferenceRow label="Daño" formula="1d20 + Atributo completo" />
          <ReferenceRow label="Defensa" formula="10 + mod(Destreza)" />
          <ReferenceRow label="Iniciativa" formula="1d20 + mod(Destreza)" />
          <ReferenceRow
            label="PV Máximo"
            formula="Constitución × 2 + Nivel × 5"
          />
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
    const recentRolls = log
      .filter((entry) => entry.includes("Tirada"))
      .slice(0, 5);

    return (
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">📜 Historial de Tiradas</h3>

        {recentRolls.length === 0 ? (
          <p className="text-neutral-500 text-center py-4">
            No hay tiradas recientes
          </p>
        ) : (
          <div className="space-y-2">
            {recentRolls.map((entry, idx) => (
              <div
                key={idx}
                className="p-3 bg-neutral-800 rounded-lg text-sm animate-fade-in"
              >
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
              <button
                onClick={() => setLog([])}
                className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded-lg text-sm transition-all"
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
            {filteredLog.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">
                No hay eventos registrados
              </p>
            ) : (
              filteredLog.map((entry, idx) => (
                <LogEntry key={idx} entry={entry} />
              ))
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

    return (
      <div
        className={`text-sm p-3 rounded-lg border animate-fade-in ${getEntryStyle()}`}
      >
        {entry}
      </div>
    );
  }

  // --- Pantallas de victoria y game over ---
  function VictoryScreen() {
    const karma = achievements.find((a) => a.type === "karma")?.value || 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-black to-neutral-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-7xl font-black text-green-500 mb-4">
            ¡VICTORIA!
          </h1>
          <p className="text-2xl text-neutral-300 mb-8">
            Has sobrevivido al apocalipsis
          </p>

          <div className="bg-black/50 rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-neutral-400">Días sobrevividos:</span>
                <span className="ml-2 text-xl font-bold">{day}</span>
              </div>
              <div>
                <span className="text-neutral-400">Supervivientes:</span>
                <span className="ml-2 text-xl font-bold">
                  {players.filter((p) => p.estado !== "muerto").length}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Zombis eliminados:</span>
                <span className="ml-2 text-xl font-bold">
                  {Math.floor(Math.random() * 100) + 50}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Karma final:</span>
                <span className="ml-2 text-xl font-bold">
                  {karma > 0 ? "+" : ""}
                  {karma}
                </span>
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

          <button
            onClick={() => setGameState("menu")}
            className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl transition-all"
          >
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
          <h1 className="text-8xl font-black text-red-600 mb-4 animate-pulse">
            GAME OVER
          </h1>
          <p className="text-2xl text-neutral-400 mb-8">
            La humanidad ha caído...
          </p>

          <div className="bg-black/50 rounded-2xl p-6 max-w-md mx-auto mb-8">
            <p className="text-neutral-300 mb-4">Sobreviviste {day} días</p>
            <p className="text-sm text-neutral-500 italic">
              "En el fin, todos somos iguales ante la muerte"
            </p>
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
}
