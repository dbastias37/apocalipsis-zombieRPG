// Baraja de CARTAS DE DECISIÓN (moradas)
// Mantiene compatibilidad con la lógica existente:
// - Conserva los mismos IDs (1..50)
// - Conserva claves de efectos ya soportadas por handleStoryChoice
// - Añade category:"story" para pintar en morado
// - Añade campo opcional `citation` para mostrar una cita corta de filósofo
//   (la narrativa ya no nombra filósofos directamente)

export type StoryCard = {
  id: number;
  category: "story"; // usado para color morado y ruteo
  title: string;
  text: string;
  choices: Array<{
    text: string;
    effect: {
      zombies?: number;
      morale?: number;
      food?: number;
      water?: number;
      medicine?: number;
      fuel?: number;
      ammo?: number;
      materials?: number;
      survivors?: number;
      casualties?: "random";
      karma?: number;
      // claves narrativas “neutras” que ya maneja handleSpecialEffect/karma:
      // (si no se usan, no afectan)
      // time?: number | string; energy?: number; knowledge?: boolean; etc.
    };
  }>;
  philosophy?: string;
  citation?: { quote: string; author: string };
};

export const storyCards: StoryCard[] = [
  {
    id: 1,
    category: "story",
    title: "El Último Sermón",
    text: "En una iglesia abandonada, un predicador moribundo te ofrece las llaves de un búnker a cambio de un último acto de misericordia.",
    choices: [
      { text: "Cumplir su última voluntad", effect: { morale: -2, karma: 5 } },
      { text: "Dejarlo a su destino", effect: { morale: -5, zombies: 1, karma: -3 } },
      { text: "Intentar salvarlo", effect: { medicine: -3, karma: 10 } }
    ],
    philosophy: "mercy",
    citation: { quote: "La compasión es base de la moral.", author: "Schopenhauer" }
  },
  {
    id: 2,
    category: "story",
    title: "El Dilema del Tranvía Viviente",
    text: "Cinco sobreviven atrapados en un vagón. Desviarás la horda hacia un túnel con un niño escondido o no intervendrás.",
    choices: [
      { text: "Salvar a los cinco", effect: { morale: -10, survivors: 5, karma: -5 } },
      { text: "Proteger al niño", effect: { morale: -8, karma: 8 } },
      { text: "No intervenir", effect: { morale: -15, karma: 0 } }
    ],
    philosophy: "trolley_problem",
    citation: { quote: "La suma no decide el deber.", author: "Kant" }
  },
  {
    id: 3,
    category: "story",
    title: "El Jardín de los Recuerdos",
    text: "Una anciana cultiva flores en la azotea. Te ofrece semillas a cambio de agua: belleza o supervivencia.",
    choices: [
      { text: "Compartir el agua", effect: { water: -5, morale: 8 } },
      { text: "Conservar recursos", effect: { morale: -3, karma: -2 } },
      { text: "Intercambio justo", effect: { water: -2, food: 3, morale: 3 } }
    ],
    philosophy: "beauty_in_chaos",
    citation: { quote: "Amamos lo bello por sí mismo.", author: "Aristóteles" }
  },
  {
    id: 4,
    category: "story",
    title: "La Paradoja del Barco de Teseo",
    text: "Un amigo mordido cambia poco a poco. ¿Sigue siendo el mismo si la humanidad se desvanece pieza a pieza?",
    choices: [
      { text: "Usar medicina preciosa", effect: { medicine: -5, morale: 5 } },
      { text: "Aislarlo humanamente", effect: { morale: -3 } },
      { text: "Tomar la decisión difícil", effect: { morale: -8, karma: -5 } }
    ],
    philosophy: "identity",
    citation: { quote: "La identidad es continuidad en el cambio.", author: "Heráclito" }
  },
  {
    id: 5,
    category: "story",
    title: "El Velo de la Ignorancia",
    text: "Niños juegan ajenos al destino de sus padres. Decir la verdad los prepara, pero rompe su refugio mental.",
    choices: [
      { text: "Revelar gradualmente", effect: { morale: -3 } },
      { text: "Mantener la ilusión", effect: { morale: 5 } },
      { text: "Dejar que otros decidan", effect: { morale: -2 } }
    ],
    philosophy: "truth_vs_comfort",
    citation: { quote: "La verdad, aunque duela, libera.", author: "Séneca" }
  },
  {
    id: 6,
    category: "story",
    title: "Contrato Social Roto",
    text: "Un grupo exige tributo de comida por protección. Sin ellos, las hordas nocturnas te superan.",
    choices: [
      { text: "Aceptar la protección", effect: { food: -5, karma: -2 } },
      { text: "Rechazar y fortificar", effect: { materials: -8 } },
      { text: "Negociar mejores términos", effect: { karma: 2 } }
    ],
    philosophy: "social_contract",
    citation: { quote: "El poder necesita legitimidad.", author: "Rousseau" }
  },
  {
    id: 7,
    category: "story",
    title: "La Caverna de los Infectados",
    text: "En un búnker subterráneo nunca han visto un zombi; solo sombras. Mostrar la realidad podría matarlos de miedo… o liberarlos.",
    choices: [
      { text: "Guiarlos al exterior", effect: { morale: -5, zombies: 3 } },
      { text: "Respetar su realidad", effect: {} },
      { text: "Dejar evidencia sutil", effect: { morale: -2 } }
    ],
    philosophy: "platos_cave",
    citation: { quote: "De la sombra al sol: dolor y verdad.", author: "Platón" }
  },
  {
    id: 8,
    category: "story",
    title: "El Peso de Atlas",
    text: "El líder colapsa. Te pide que tomes su lugar o compartas la carga.",
    choices: [
      { text: "Aceptar el liderazgo", effect: { morale: 5 } },
      { text: "Compartir la carga", effect: { morale: 3 } },
      { text: "Apoyo silencioso", effect: { morale: 5 } }
    ],
    philosophy: "burden_of_leadership",
    citation: { quote: "Gobernar es servir.", author: "Marco Aurelio" }
  },
  {
    id: 9,
    category: "story",
    title: "El Espejo del Monstruo",
    text: "Capturas a un raider que mató a uno de los tuyos. Piden justicia inmediata; él suplica piedad.",
    choices: [
      { text: "Ejecutar por votación", effect: { karma: -4, morale: 1 } },
      { text: "Exilio sin recursos", effect: { morale: -3, karma: 2 } },
      { text: "Intentar rehabilitación", effect: { morale: -1, karma: 4 } }
    ],
    philosophy: "justice_vs_revenge",
    citation: { quote: "Al luchar con monstruos, cuídate.", author: "Nietzsche" }
  },
  {
    id: 10,
    category: "story",
    title: "La Última Cena",
    text: "Queda comida para un banquete digno. ¿Celebración humana o racionamiento férreo?",
    choices: [
      { text: "Celebrar", effect: { food: -8, morale: 15 } },
      { text: "Racionar", effect: { food: -3, morale: -5 } },
      { text: "Votar en grupo", effect: {} }
    ],
    philosophy: "dignity_in_death",
    citation: { quote: "La dignidad no es lujo.", author: "Cicerón" }
  },
  {
    id: 11,
    category: "story",
    title: "Fantasma en la Máquina",
    text: "Una IA ofrece avance hacia la cura a cambio de sujetos de prueba vivos.",
    choices: [
      { text: "Voluntarios", effect: { casualties: "random", karma: -3 } },
      { text: "Rechazar el riesgo", effect: { morale: -3 } },
      { text: "Negociar alternativas", effect: { karma: 2 } }
    ],
    philosophy: "trust_in_artificial",
    citation: { quote: "La técnica no decide el bien.", author: "Heidegger" }
  },
  {
    id: 12,
    category: "story",
    title: "El Río de Heráclito",
    text: "Cruzar aguas negras hacia tierras fértiles o buscar otro camino más lento.",
    choices: [
      { text: "Vadear el río", effect: { morale: -2 } },
      { text: "Buscar otro camino", effect: { morale: -1 } },
      { text: "Construir balsa", effect: { materials: -10 } }
    ],
    philosophy: "change_and_flux",
    citation: { quote: "Todo fluye, nada permanece.", author: "Heráclito" }
  },
  {
    id: 13,
    category: "story",
    title: "La Biblioteca",
    text: "Una biblioteca intacta: calor para semanas si se quema o legado para el futuro si se preserva.",
    choices: [
      { text: "Preservar", effect: { morale: 8 } },
      { text: "Quemar para sobrevivir", effect: { morale: -10 } },
      { text: "Salvar libros selectos", effect: { morale: 3 } }
    ],
    philosophy: "value_of_culture",
    citation: { quote: "La cultura es memoria viva.", author: "T. S. Eliot" }
  },
  {
    id: 14,
    category: "story",
    title: "Prisionero Infectado",
    text: "Dos grupos con posibles infectados. Confesar, ocultar o cuarentena mutua.",
    choices: [
      { text: "Confesar", effect: {} },
      { text: "Ocultar", effect: { morale: -1 } },
      { text: "Cuarentena mutua", effect: { morale: -1 } }
    ],
    philosophy: "prisoners_dilemma",
    citation: { quote: "La confianza es un riesgo.", author: "Luhmann" }
  },
  {
    id: 15,
    category: "story",
    title: "Senderos que se Bifurcan",
    text: "Tres refugios: uno seguro y lejano, otro cercano e incierto, otro mítico y perfecto.",
    choices: [
      { text: "Seguro y lejano", effect: { morale: -1 } },
      { text: "Riesgo cercano", effect: { morale: -1 } },
      { text: "El sueño imposible", effect: { morale: 5 } }
    ],
    philosophy: "path_dependence",
    citation: { quote: "Elegir es renunciar a futuros.", author: "Sartre" }
  },
  {
    id: 16,
    category: "story",
    title: "La Náusea del Superviviente",
    text: "Has vivido mientras otros mejores cayeron. La culpa te persigue.",
    choices: [
      { text: "Enfrentar la culpa", effect: { morale: -3 } },
      { text: "Reprimir y seguir", effect: {} },
      { text: "Encontrar propósito", effect: { morale: 5 } }
    ],
    philosophy: "survivors_guilt",
    citation: { quote: "Estamos condenados a ser libres.", author: "Sartre" }
  },
  {
    id: 17,
    category: "story",
    title: "Panóptico Invertido",
    text: "Cámaras vigilan el perímetro… y al grupo. Seguridad vs. privacidad.",
    choices: [
      { text: "Vigilancia total", effect: { morale: -3 } },
      { text: "Solo perímetros", effect: {} },
      { text: "Rotación democrática", effect: { morale: 1 } }
    ],
    philosophy: "surveillance_society",
    citation: { quote: "Ver es ejercer poder.", author: "Foucault" }
  },
  {
    id: 18,
    category: "story",
    title: "Paradoja de la Tolerancia",
    text: "Fanáticos eficientes pero intolerantes piden unirse. ¿Condiciones, rechazo o prueba?",
    choices: [
      { text: "Aceptar con condiciones", effect: { morale: -1 } },
      { text: "Rechazar por principios", effect: { morale: 3 } },
      { text: "Período de prueba", effect: {} }
    ],
    philosophy: "tolerance_paradox",
    citation: { quote: "Tolerar lo intolerante destruye.", author: "Popper" }
  },
  {
    id: 19,
    category: "story",
    title: "El Mito de Sísifo Armado",
    text: "Las barricadas se reconstruyen cada día. ¿Futilidad o sentido en la lucha?",
    choices: [
      { text: "Hallarle sentido", effect: { morale: 8 } },
      { text: "Buscar solución permanente", effect: { materials: -15 } },
      { text: "Aceptar la futilidad", effect: { morale: -3 } }
    ],
    philosophy: "absurdism",
    citation: { quote: "Hay que imaginar a Sísifo feliz.", author: "Camus" }
  },
  {
    id: 20,
    category: "story",
    title: "Habitación China",
    text: "Un científico predice a los zombis sin comprenderlos. ¿Sirve el conocimiento sin entendimiento?",
    choices: [
      { text: "Usar sus métodos", effect: {} },
      { text: "Buscar comprensión profunda", effect: { morale: -1 } },
      { text: "Documentarlo todo", effect: { morale: -1 } }
    ],
    philosophy: "chinese_room",
    citation: { quote: "Simular no es comprender.", author: "Searle" }
  },
  {
    id: 21,
    category: "story",
    title: "Buen Samaritano Caníbal",
    text: "Alguien te salva, pero confiesa haber comido carne humana en el pasado.",
    choices: [
      { text: "Aceptar y seguir", effect: { karma: -1 } },
      { text: "Agradecer y alejarse", effect: { morale: -2, karma: 1 } },
      { text: "Redención condicional", effect: { morale: -1, karma: 2 } }
    ],
    philosophy: "redemption",
    citation: { quote: "Nadie es solo su peor acto.", author: "Hannah Arendt" }
  },
  {
    id: 22,
    category: "story",
    title: "El Tren",
    text: "Un tren salva a 50, pero tienes 73. ¿Lotería, utilidad o quedarse juntos?",
    choices: [
      { text: "Lotería justa", effect: { morale: -5, karma: 2 } },
      { text: "Selección utilitaria", effect: { karma: -3 } },
      { text: "Quedarse juntos", effect: { morale: 2 } }
    ],
    philosophy: "might_vs_right",
    citation: { quote: "El fuerte hace lo que puede.", author: "Tucídides" }
  },
  {
    id: 23,
    category: "story",
    title: "El Abuelo Inmune",
    text: "Un anciano inmune que los zombis ignoran podría ser estudiado, con riesgos.",
    choices: [
      { text: "Estudiarlo humanamente", effect: { morale: 3 } },
      { text: "Procedimientos completos", effect: { morale: -8 } },
      { text: "Respetar sus deseos", effect: { morale: 2 } }
    ],
    philosophy: "ends_vs_means",
    citation: { quote: "El fin no justifica medios.", author: "Kant" }
  },
  {
    id: 24,
    category: "story",
    title: "Basilisco Zombificado",
    text: "Una idea obsesiva: no actuar condena retroactivamente a todos. ¿Suprimir, debatir o canalizar?",
    choices: [
      { text: "Suprimir la teoría", effect: {} },
      { text: "Discusión abierta", effect: { morale: -1 } },
      { text: "Dirigir hacia acción", effect: { morale: -1 } }
    ],
    philosophy: "dangerous_ideas",
    citation: { quote: "Algunas ideas son cuchillos.", author: "Francis Bacon" }
  },
  {
    id: 25,
    category: "story",
    title: "La Nave de los Locos",
    text: "Un crucero con supervivientes inestables: recursos sí, integración difícil.",
    choices: [
      { text: "Intentar rescate", effect: { morale: -1, food: 5, water: 5 } },
      { text: "Tomar recursos y huir", effect: { food: 15, morale: -10 } },
      { text: "Contacto gradual", effect: { morale: -1 } }
    ],
    philosophy: "madness_and_society",
    citation: { quote: "La norma define la locura.", author: "Foucault" }
  },
  {
    id: 26,
    category: "story",
    title: "Contrato Generacional",
    text: "Niños nacidos en ruinas. ¿Educar en arte y civismo, supervivencia pura o balance?",
    choices: [
      { text: "Educación clásica", effect: { morale: 2 } },
      { text: "Supervivencia pura", effect: { morale: -1 } },
      { text: "Balance pragmático", effect: { morale: 2 } }
    ],
    philosophy: "education_purpose",
    citation: { quote: "Educar es sembrar futuro.", author: "Aristóteles" }
  },
  {
    id: 27,
    category: "story",
    title: "La Última Transmisión",
    text: "Una radio dice: “Si alguien escucha, la humanidad debe saber que…”. ¿Investigar, ignorar o responder?",
    choices: [
      { text: "Buscar la fuente", effect: { fuel: -5, morale: 3 } },
      { text: "Ignorar y sobrevivir", effect: {} },
      { text: "Enviar respuesta", effect: { morale: -1 } }
    ],
    philosophy: "meaning_seeking",
    citation: { quote: "El hombre busca sentido.", author: "Viktor Frankl" }
  },
  {
    id: 28,
    category: "story",
    title: "El Mercado de Órganos",
    text: "Un cirujano propone donación de terminales a viables. ¿Voluntario, prohibir o caso por caso?",
    choices: [
      { text: "Sistema voluntario", effect: { morale: -1 } },
      { text: "Prohibir", effect: { morale: 1 } },
      { text: "Caso por caso", effect: { morale: -1 } }
    ],
    philosophy: "bodily_autonomy",
    citation: { quote: "El cuerpo es tuyo.", author: "John Stuart Mill" }
  },
  {
    id: 29,
    category: "story",
    title: "La Paradoja del Mesías",
    text: "Una niña con dones extraños. ¿Proteger, estudiar éticamente o dejarla elegir?",
    choices: [
      { text: "Proteger a toda costa", effect: { morale: 2 } },
      { text: "Estudiarla éticamente", effect: { morale: -1 } },
      { text: "Dejarla elegir", effect: { morale: 1 } }
    ],
    philosophy: "chosen_one",
    citation: { quote: "El deber nace de la libertad.", author: "Kierkegaard" }
  },
  {
    id: 30,
    category: "story",
    title: "El Dilema del Traductor",
    text: "Un grupo de otro idioma. Gestos ambiguos: advertencia, ayuda o amenaza.",
    choices: [
      { text: "Intentar comunicación", effect: { morale: -1 } },
      { text: "Evitar contacto", effect: {} },
      { text: "Seguir sus señales", effect: { morale: -1 } }
    ],
    philosophy: "language_barriers",
    citation: { quote: "Los límites del lenguaje limitan el mundo.", author: "Wittgenstein" }
  },
  {
    id: 31,
    category: "story",
    title: "El Teatro del Fin",
    text: "Actores elevan la moral, pero consumen recursos. ¿Apoyar, solo trabajo útil o condiciones?",
    choices: [
      { text: "Apoyar el teatro", effect: { morale: 10, food: -1, water: -1 } },
      { text: "Solo trabajo útil", effect: { morale: -5 } },
      { text: "Arte con condiciones", effect: { morale: 4 } }
    ],
    philosophy: "art_necessity",
    citation: { quote: "El arte lava el polvo del alma.", author: "Picasso" }
  },
  {
    id: 32,
    category: "story",
    title: "Lotería de Babilonia",
    text: "Asignar tareas peligrosas por azar o por habilidad, o sistema mixto.",
    choices: [
      { text: "Implementar lotería", effect: { morale: 3 } },
      { text: "Por habilidad", effect: { morale: -1 } },
      { text: "Sistema mixto", effect: { morale: 1 } }
    ],
    philosophy: "fairness_vs_efficiency",
    citation: { quote: "La justicia es imparcialidad.", author: "Rawls" }
  },
  {
    id: 33,
    category: "story",
    title: "El Golem Protector",
    text: "Las defensas exigen sacrificio continuo. ¿Prisión segura o libertad peligrosa?",
    choices: [
      { text: "Mantener fortificaciones", effect: { morale: -1 } },
      { text: "Vida nómada", effect: { morale: -2 } },
      { text: "Defensas minimalistas", effect: {} }
    ],
    philosophy: "security_vs_freedom",
    citation: { quote: "La libertad se arriesga o no es tal.", author: "Kierkegaard" }
  },
  {
    id: 34,
    category: "story",
    title: "Caja de Pandora Médica",
    text: "Un laboratorio de bioguerra: entender el virus o desatar algo peor.",
    choices: [
      { text: "Abrir con precaución", effect: { morale: -1 } },
      { text: "Sellar permanentemente", effect: {} },
      { text: "Decidir más adelante", effect: {} }
    ],
    philosophy: "dangerous_knowledge",
    citation: { quote: "Saber es poder y peligro.", author: "Francis Bacon" }
  },
  {
    id: 35,
    category: "story",
    title: "El Espejo de Medusa",
    text: "Los zombis se confunden con su reflejo; el grupo se deprime al verse reflejado en el horror.",
    choices: [
      { text: "Usar espejos", effect: { morale: -7 } },
      { text: "Evitar reflejos", effect: {} },
      { text: "Uso selectivo", effect: { morale: -1 } }
    ],
    philosophy: "confronting_mortality",
    citation: { quote: "Mirar al abismo tiene precio.", author: "Nietzsche" }
  },
  {
    id: 36,
    category: "story",
    title: "La Comuna de los Ciegos",
    text: "Invidentes sobrevivieron mejor. Ofrecen enseñar métodos a cambio de vendarse semanas.",
    choices: [
      { text: "Aprender sus métodos", effect: { morale: -1 } },
      { text: "Intercambio de saberes", effect: { morale: -1 } },
      { text: "Observar solamente", effect: {} }
    ],
    philosophy: "ways_of_knowing",
    citation: { quote: "Conocer es ampliar sentidos.", author: "Merleau-Ponty" }
  },
  {
    id: 37,
    category: "story",
    title: "Juicio de París Zombi",
    text: "Tres alianzas exclusivas: armas, medicina o conocimiento.",
    choices: [
      { text: "Poder militar", effect: { ammo: 10 } },
      { text: "Capacidad médica", effect: { medicine: 10 } },
      { text: "Sabiduría preservada", effect: { materials: 5 } }
    ],
    philosophy: "impossible_choices",
    citation: { quote: "Elegir es crear enemigos.", author: "Machiavelo" }
  },
  {
    id: 38,
    category: "story",
    title: "La Pregunta de Nagel",
    text: "Un infectado consciente pide documentar su transformación desde dentro.",
    choices: [
      { text: "Documentar todo", effect: { morale: -1 } },
      { text: "Eutanasia compasiva", effect: { karma: 2 } },
      { text: "Observación a distancia", effect: {} }
    ],
    philosophy: "consciousness_study",
    citation: { quote: "¿Cómo es ser otro?", author: "Thomas Nagel" }
  },
  {
    id: 39,
    category: "story",
    title: "Anillo de Giges",
    text: "Equipo de camuflaje casi invisible. ¿Usarlo para el grupo, compartir o guardarlo?",
    choices: [
      { text: "Para el grupo", effect: { morale: 1 } },
      { text: "Compartir el secreto", effect: { morale: 2 } },
      { text: "As para emergencias", effect: { morale: -1 } }
    ],
    philosophy: "power_and_character",
    citation: { quote: "El poder revela al carácter.", author: "Platón" }
  },
  {
    id: 40,
    category: "story",
    title: "Paradoja de Epicuro",
    text: "Un sacerdote consciente pero zombificado pregunta por qué el mal persiste.",
    choices: [
      { text: "Consuelo piadoso", effect: { morale: 1 } },
      { text: "Honestidad brutal", effect: { morale: -1 } },
      { text: "Silencio respetuoso", effect: {} }
    ],
    philosophy: "problem_of_evil",
    citation: { quote: "El mal desafía la razón.", author: "Epicuro" }
  },
  {
    id: 41,
    category: "story",
    title: "Leviatán Comunitario",
    text: "Invierno inminente: unión bajo líder absoluto, democracia lenta o autoridad temporal.",
    choices: [
      { text: "Autoridad absoluta", effect: { morale: -2 } },
      { text: "Democracia", effect: { morale: 1 } },
      { text: "Autoridad temporal", effect: {} }
    ],
    philosophy: "social_contract_extreme",
    citation: { quote: "Sin orden, guerra de todos.", author: "Hobbes" }
  },
  {
    id: 42,
    category: "story",
    title: "Máquina de Experiencias",
    text: "Realidad virtual funcionando. ¿Vivir felices en lo falso, destruirla o uso terapéutico?",
    choices: [
      { text: "Permitir la fantasía", effect: { morale: 2 } },
      { text: "Destruir la tentación", effect: { morale: -1 } },
      { text: "Terapéutico limitado", effect: { morale: 1 } }
    ],
    philosophy: "experience_machine",
    citation: { quote: "El placer no basta para la vida.", author: "Nozick" }
  },
  {
    id: 43,
    category: "story",
    title: "El Caminante",
    text: "Un explorador recuerda una isla sin infectados, pero el camino es difuso.",
    choices: [
      { text: "Seguir recuerdos", effect: { morale: 2 } },
      { text: "Hipnosis o drogas", effect: { morale: -2 } },
      { text: "Expedición de búsqueda", effect: { fuel: -3, morale: 1 } }
    ],
    philosophy: "memory_reliability",
    citation: { quote: "La memoria inventa lo vivido.", author: "Borges" }
  },
  {
    id: 44,
    category: "story",
    title: "Ruleta Rusa Ética",
    text: "Seis viales: cinco vacunas, uno veneno. ¿Azar, rechazo o voluntario?",
    choices: [
      { text: "Distribución aleatoria", effect: { morale: -1 } },
      { text: "Rechazar el juego", effect: {} },
      { text: "Un voluntario", effect: { karma: 3 } }
    ],
    philosophy: "random_vs_chosen_sacrifice",
    citation: { quote: "El azar no absuelve.", author: "Camus" }
  },
  {
    id: 45,
    category: "story",
    title: "Tranvía Temporal",
    text: "Puedes advertir al pasado. Cambiarlo borraría tu presente.",
    choices: [
      { text: "Enviar advertencia", effect: { morale: -1 } },
      { text: "Preservar la línea", effect: {} },
      { text: "Mensaje críptico", effect: { morale: -1 } }
    ],
    philosophy: "temporal_ethics",
    citation: { quote: "Cada elección reescribe el ser.", author: "Heidegger" }
  },
  {
    id: 46,
    category: "story",
    title: "Sinfonía del Silencio",
    text: "Un músico toca al atardecer; sube la moral pero atrae zombis.",
    choices: [
      { text: "Permitir la música", effect: { morale: 12 } },
      { text: "Prohibir el ruido", effect: { morale: -3 } },
      { text: "Música contenida", effect: { morale: 4 } }
    ],
    philosophy: "expression_vs_survival",
    citation: { quote: "Sin música, la vida sería un error.", author: "Nietzsche" }
  },
  {
    id: 47,
    category: "story",
    title: "Juramento Roto",
    text: "Salvar a un niño con pocas chances o a tres adultos con alta probabilidad.",
    choices: [
      { text: "Salvar al niño", effect: { karma: 2 } },
      { text: "Salvar a los tres", effect: { karma: -2 } },
      { text: "El médico decide", effect: {} }
    ],
    philosophy: "medical_triage",
    citation: { quote: "Primero, no hacer daño.", author: "Hipócrates" }
  },
  {
    id: 48,
    category: "story",
    title: "República de los Muertos",
    text: "Voto simbólico a los fallecidos o decisión de los vivos.",
    choices: [
      { text: "Honrar memorias", effect: { morale: 2 } },
      { text: "Deciden los vivos", effect: {} },
      { text: "Consejo de ancianos", effect: { morale: 1 } }
    ],
    philosophy: "duties_to_dead",
    citation: { quote: "Respetar a los muertos dignifica.", author: "Cicerón" }
  },
  {
    id: 49,
    category: "story",
    title: "El Último Humano",
    text: "Una teoría: cuando quede uno, los zombis caerán. ¿Negarla, prepararte o buscar alternativas?",
    choices: [
      { text: "Rechazar la teoría", effect: {} },
      { text: "Prepararte para ser último", effect: { morale: -3 } },
      { text: "Buscar alternativas", effect: { morale: 2 } }
    ],
    philosophy: "last_man",
    citation: { quote: "Solo no es humano.", author: "Aristóteles" }
  },
  {
    id: 50,
    category: "story",
    title: "La Pregunta Final",
    text: "La cura existe, pero requiere tu vida para sintetizarla. No hay garantía de distribución.",
    choices: [
      { text: "Sacrificio heroico", effect: { karma: 5 } },
      { text: "Buscar otro camino", effect: {} },
      { text: "Preparar sucesores", effect: { morale: 1 } }
    ],
    philosophy: "ultimate_sacrifice",
    citation: { quote: "Dar la vida por el bien común.", author: "Sócrates" }
  }
];

export default storyCards;
