export type CombatChoice = {
  text: string;
  effect: {
    damage?: number;
    selfDamage?: number;
    heal?: number;
    ammo?: number;
    morale?: number;
    zombies?: number;
    materials?: number;
    medicine?: number;
    stunEnemy?: boolean;
    bleedEnemy?: boolean;
    block?: number;          // 0..1 mitigación del próximo golpe
    escape?: boolean;
    loot?: Record<string, number>;
    time?: number;           // coste de tiempo en ms
  };
  tags?: string[];
};

export type CombatCard = {
  id: number;
  title: string;
  text: string;
  enemy: {
    type: string;
    hp: number;
    damage: number;
    armor?: number;
    critRate?: number;       // 0..1
  };
  difficulty: "easy" | "medium" | "hard" | "boss";
  choices: CombatChoice[];
};

export const combatCards: CombatCard[] = [
  {
    id: 301,
    title: "Eco en la fábrica vacía",
    text: `Las latas resuenan a cada paso. Un zombi corredor emerge entre cintas transportadoras.\nEl olor a metal viejo arde en la garganta. Si disparamos, el eco podría invitar invitados no deseados.\n¿Nos vuelve el miedo más precisos… o más crueles?`,
    enemy: { type: "Zombi corredor", hp: 24, damage: 6, critRate: 0.12 },
    difficulty: "easy",
    choices: [
      { text: "Ataque rápido al tendón", effect: { damage: 6, zombies: 1, time: 8000 }, tags: ["melee"] },
      { text: "Apuntar a la cabeza (−1 munición)", effect: { damage: 10, ammo: -1, zombies: 2, time: 10000 }, tags: ["ranged"] },
      { text: "Bloquear con bandeja metálica", effect: { block: 0.35, materials: -1, time: 7000 }, tags: ["defense"] },
      { text: "Replegarse a pasillo estrecho", effect: { morale: -1, escape: true, time: 6000 }, tags: ["escape"] }
    ]
  },
  {
    id: 302,
    title: "Pasillo del hospital",
    text: `Camillas volcadas, luz intermitente. Un cazador nocturno sisea desde la puerta de rayos X.\nLa piedad compite con la supervivencia: ¿somos lo que salvamos o lo que dejamos caer?`,
    enemy: { type: "Cazador nocturno", hp: 32, damage: 8, critRate: 0.18, armor: 1 },
    difficulty: "medium",
    choices: [
      { text: "Cegar con linterna y golpear", effect: { damage: 8, stunEnemy: true, time: 12000 }, tags: ["utility","melee"] },
      { text: "Curarse tras el mostrador (−1 medicina)", effect: { heal: 6, medicine: -1, zombies: 1, time: 9000 }, tags: ["heal"] },
      { text: "Tiro controlado (−2 munición)", effect: { damage: 14, ammo: -2, zombies: 2, time: 12000 }, tags: ["ranged"] }
    ]
  },
  {
    id: 303,
    title: "Puente con barandas rotas",
    text: `El río golpea abajo. Un bruto mutado avanza, piel tensa como cable.\nSi caemos, no habrá segunda oportunidad. La fuerza sin juicio… ¿es coraje o ruido?`,
    enemy: { type: "Bruto mutado", hp: 44, damage: 10, critRate: 0.2, armor: 2 },
    difficulty: "hard",
    choices: [
      { text: "Cortar rodilla con machete", effect: { damage: 10, bleedEnemy: true, time: 14000 }, tags: ["melee"] },
      { text: "Trampa con baranda y gancho (−2 materiales)", effect: { damage: 8, stunEnemy: true, materials: -2, time: 15000 }, tags: ["trap"] },
      { text: "Disparo al cráneo (−2 munición)", effect: { damage: 16, ammo: -2, zombies: 1, time: 13000 }, tags: ["ranged"] },
      { text: "Retroceder paso a paso", effect: { morale: -2, escape: true, time: 9000 }, tags: ["escape"] }
    ]
  },
  {
    id: 304,
    title: "Supermercado a oscuras",
    text: `Las góndolas forman callejones. Un enjambre famélico se arrastra por el suelo entre latas abolladas.\nLa abundancia vacía ridiculiza el hambre; ¿vale el riesgo por unas calorías?`,
    enemy: { type: "Enjambre hambriento", hp: 26, damage: 6, critRate: 0.1 },
    difficulty: "easy",
    choices: [
      { text: "Golpe en barrido con pala", effect: { damage: 7, zombies: 1, time: 9000 } },
      { text: "Encender bengala y atraer a un pasillo", effect: { damage: 5, stunEnemy: true, materials: -1, time: 11000 } },
      { text: "Escopetazo cercano (−1 munición)", effect: { damage: 12, ammo: -1, zombies: 2, time: 10000 } }
    ]
  },
  {
    id: 305,
    title: "Patio ferroviario",
    text: `Vagones inmóviles, graffitis como grietas de color. Un acechador trepa entre escalerillas.\nEl silencio industrial pregunta si el orden volverá alguna vez.`,
    enemy: { type: "Acechador", hp: 30, damage: 7, critRate: 0.16, armor: 1 },
    difficulty: "medium",
    choices: [
      { text: "Esconderse bajo vagón y apuñalar", effect: { damage: 9, time: 12000 } },
      { text: "Cegar con polvo del freno", effect: { stunEnemy: true, damage: 5, time: 9000 } },
      { text: "Disparo en altura (−1 munición)", effect: { damage: 12, ammo: -1, zombies: 1, time: 11000 } }
    ]
  },
  {
    id: 306,
    title: "Teatro derrumbado",
    text: `Butacas rasgadas, telón como mortaja. Un zombi ágil se desliza por el foso de orquesta.\n¿Puede el arte sobrevivir a un mundo que ya no aplaude?`,
    enemy: { type: "Zombi ágil", hp: 28, damage: 7, critRate: 0.14 },
    difficulty: "medium",
    choices: [
      { text: "Atravesar con estaca de tramoya", effect: { damage: 9, bleedEnemy: true, time: 12000 } },
      { text: "Cortina encima y rematar", effect: { stunEnemy: true, damage: 6, time: 10000 } },
      { text: "Pistoletazo silenciado (−1 munición)", effect: { damage: 11, ammo: -1, zombies: 1, time: 9000 } }
    ]
  },
  {
    id: 307,
    title: "Azotea con antenas",
    text: `Cables tensos, viento sucio. Un corredor trepa por la escalera metálica.\nAltura y vértigo: arriba no siempre es seguro.`,
    enemy: { type: "Corredor", hp: 22, damage: 6, critRate: 0.1 },
    difficulty: "easy",
    choices: [
      { text: "Patear la escalera al llegar", effect: { damage: 6, stunEnemy: true, time: 8000 } },
      { text: "Gancho y tirón con cable (−1 material)", effect: { damage: 8, materials: -1, time: 10000 } },
      { text: "Tiro corto a la cabeza (−1 munición)", effect: { damage: 12, ammo: -1, time: 9000 } }
    ]
  },
  {
    id: 308,
    title: "Gimnasio municipal",
    text: `Colchonetas, olor a caucho. Un zombi pesado embiste desde las barras.\nLa disciplina del cuerpo, ¿sirve cuando el mundo no tiene reglas?`,
    enemy: { type: "Pesado", hp: 36, damage: 9, critRate: 0.15, armor: 1 },
    difficulty: "medium",
    choices: [
      { text: "Derribo con barra olímpica", effect: { damage: 10, stunEnemy: true, time: 12000 } },
      { text: "Rodar y apuñalar costillas", effect: { damage: 9, time: 9000 } },
      { text: "Disparo doble al torso (−2 munición)", effect: { damage: 15, ammo: -2, zombies: 1, time: 13000 } }
    ]
  },
  {
    id: 309,
    title: "Túnel de metro",
    text: `Carteles descoloridos, eco de gotas. Un mutado ciego olfatea el aire.\nLa oscuridad escucha más que nosotros hablamos.`,
    enemy: { type: "Mutado ciego", hp: 40, damage: 9, critRate: 0.18, armor: 2 },
    difficulty: "hard",
    choices: [
      { text: "Pisar vidrio a propósito y atraer a trampa (−2 materiales)", effect: { damage: 10, stunEnemy: true, materials: -2, time: 14000 } },
      { text: "Respirar hondo y apuñalar suave", effect: { damage: 8, time: 12000 } },
      { text: "Tiro al oído interno (−1 munición)", effect: { damage: 14, ammo: -1, time: 12000 } }
    ]
  },
  {
    id: 310,
    title: "Planta de tratamiento de agua",
    text: `Pasarelas húmedas, olor químico. Un chasqueador tamborilea con los dedos rotos.\nSi caemos, el agua nos juzgará.`,
    enemy: { type: "Chasqueador", hp: 34, damage: 8, critRate: 0.16 },
    difficulty: "medium",
    choices: [
      { text: "Empujarlo al tanque", effect: { damage: 9, stunEnemy: true, time: 11000 } },
      { text: "Clavar gancho en mandíbula", effect: { damage: 10, bleedEnemy: true, time: 12000 } },
      { text: "Disparo en salto (−1 munición)", effect: { damage: 13, ammo: -1, zombies: 1, time: 11000 } }
    ]
  },
  {
    id: 311,
    title: "Vertedero ácido",
    text: `Charcos verdosos escupen vapor. Un mutado ácido rezuma por grietas de la piel.\nCada paso responde: la tierra también arde.`,
    enemy: { type: "Mutado ácido", hp: 42, damage: 10, critRate: 0.2, armor: 2 },
    difficulty: "hard",
    choices: [
      { text: "Barricada de contenedores (−2 materiales)", effect: { damage: 8, block: 0.3, materials: -2, time: 13000 } },
      { text: "Cortar tendón y retroceder", effect: { damage: 10, time: 12000 } },
      { text: "Tiro preciso a glándula (−2 munición)", effect: { damage: 16, ammo: -2, time: 14000 } }
    ]
  },
  {
    id: 312,
    title: "Estacionamiento espiral",
    text: `Sirenas mudas, olor a caucho viejo. Un sabueso infectado aparece entre pilares.\nLa fidelidad sin mente todavía muerde.`,
    enemy: { type: "Sabueso infectado", hp: 25, damage: 7, critRate: 0.14 },
    difficulty: "easy",
    choices: [
      { text: "Palo entre dientes y giro", effect: { damage: 7, stunEnemy: true, time: 9000 } },
      { text: "Cuchillo al cuello al pasar", effect: { damage: 9, bleedEnemy: true, time: 9000 } },
      { text: "Tiro corto (−1 munición)", effect: { damage: 12, ammo: -1, time: 8000 } }
    ]
  },
  {
    id: 313,
    title: "Cementerio bajo lluvia",
    text: `Lápidas torcidas, barro traicionero. Un arrastrado se levanta una y otra vez.\nLa memoria pesa; el barro también.`,
    enemy: { type: "Arrastrado obstinado", hp: 30, damage: 7, critRate: 0.12 },
    difficulty: "medium",
    choices: [
      { text: "Estaca profunda en clavícula", effect: { damage: 9, time: 10000 } },
      { text: "Pisar cráneo contra lápida", effect: { damage: 11, time: 11000 } },
      { text: "Disparo misericordioso (−1 munición)", effect: { damage: 12, ammo: -1, morale: 1, time: 9000 } }
    ]
  },
  {
    id: 314,
    title: "Invernadero roto",
    text: `Vidrios como dientes, humedad tibia. Un enjambre de pequeños se agita entre macetas.\nLo frágil sobrevive cuando aprendemos a no romper más.`,
    enemy: { type: "Enjambre de invernadero", hp: 22, damage: 5, critRate: 0.1 },
    difficulty: "easy",
    choices: [
      { text: "Barrer con azadón", effect: { damage: 7, time: 8000 } },
      { text: "Encender nebulizador (−1 material)", effect: { stunEnemy: true, damage: 6, materials: -1, time: 9000 } },
      { text: "Ráfaga breve (−1 munición)", effect: { damage: 10, ammo: -1, zombies: 1, time: 8000 } }
    ]
  },
  {
    id: 315,
    title: "Comisaría saqueada",
    text: `Taquillas abiertas, casquillos en el suelo. Un carroñero humano apunta por la puerta del calabozo.\n¿La ley sin ley somos nosotros?`,
    enemy: { type: "Carroñero armado", hp: 30, damage: 8, critRate: 0.18, armor: 1 },
    difficulty: "medium",
    choices: [
      { text: "Flanquear por archivo", effect: { damage: 9, time: 11000 } },
      { text: "Disparo a mano armada (−1 munición)", effect: { damage: 13, ammo: -1, time: 10000 } },
      { text: "Aturdir con flash casera (−1 material)", effect: { stunEnemy: true, damage: 6, materials: -1, time: 12000 } }
    ]
  },
  {
    id: 316,
    title: "Banco fortificado",
    text: `Cristales antibalas, bóveda muda. Un guardián mutado vigila con mandíbula doble.\nEl valor se mide en vidas, no en cajas.`,
    enemy: { type: "Guardián mutado", hp: 45, damage: 11, critRate: 0.22, armor: 3 },
    difficulty: "hard",
    choices: [
      { text: "Tirar archivadores al paso (−2 materiales)", effect: { damage: 8, block: 0.3, materials: -2, time: 13000 } },
      { text: "Golpe a la articulación interna", effect: { damage: 11, bleedEnemy: true, time: 14000 } },
      { text: "Doble disparo a intersticios (−2 munición)", effect: { damage: 17, ammo: -2, time: 15000 } }
    ]
  },
  {
    id: 317,
    title: "Biblioteca subterránea",
    text: `Estantes inclinados, polvo noble. Un lector perdido convertido acecha con silencio obstinado.\nSi olvidamos leer el peligro, él nos leerá a nosotros.`,
    enemy: { type: "Zombi silencioso", hp: 28, damage: 7, critRate: 0.14 },
    difficulty: "medium",
    choices: [
      { text: "Empujar estante para aplastarlo", effect: { damage: 10, stunEnemy: true, time: 12000 } },
      { text: "Puñalada entre atlas", effect: { damage: 8, time: 9000 } },
      { text: "Tiro a través del lomo (−1 munición)", effect: { damage: 12, ammo: -1, time: 10000 } }
    ]
  },
  {
    id: 318,
    title: "Foso de ascensor",
    text: `Cables tensos, eco de profundidad. Un trepador con uñas negras avanza por el cableado.\nSubir no siempre significa escapar.`,
    enemy: { type: "Trepador", hp: 33, damage: 8, critRate: 0.18 },
    difficulty: "hard",
    choices: [
      { text: "Cortar cable secundario", effect: { damage: 10, stunEnemy: true, time: 13000 } },
      { text: "Garfio a la clavícula", effect: { damage: 9, bleedEnemy: true, time: 12000 } },
      { text: "Disparo al cráneo colgante (−1 munición)", effect: { damage: 14, ammo: -1, time: 12000 } }
    ]
  },
  {
    id: 319,
    title: "Cantera de grava",
    text: `Polvo en los dientes, resonancia en los huesos. Un bruto de cantera embiste con hombros de piedra.\n¿Romper para construir o romper por romper?`,
    enemy: { type: "Bruto de cantera", hp: 40, damage: 10, critRate: 0.2, armor: 2 },
    difficulty: "hard",
    choices: [
      { text: "Tirar grava al rostro", effect: { stunEnemy: true, damage: 7, time: 11000 } },
      { text: "Clavar pico en rodilla", effect: { damage: 11, bleedEnemy: true, time: 14000 } },
      { text: "Tiro a coyuntura (−2 munición)", effect: { damage: 16, ammo: -2, time: 15000 } }
    ]
  },
  {
    id: 320,
    title: "Barrio inundado",
    text: `Agua tibia hasta la cintura. Un hinchado acuoso avanza dejando estelas.\nHasta el agua guarda muertos que no fluyen.`,
    enemy: { type: "Hinchado acuoso", hp: 34, damage: 8, critRate: 0.16 },
    difficulty: "medium",
    choices: [
      { text: "Empujón bajo y cuchillada", effect: { damage: 9, time: 11000 } },
      { text: "Cuerda a tobillos (−1 material)", effect: { stunEnemy: true, damage: 6, materials: -1, time: 12000 } },
      { text: "Disparo a flotabilidad (−1 munición)", effect: { damage: 12, ammo: -1, time: 10000 } }
    ]
  },
  {
    id: 321,
    title: "Puerto de contenedores",
    text: `Pasillos laberínticos entre metal. Golpes lejanos como tambores.\nUn titán encadenado arrastra grilletes con furia antigua.`,
    enemy: { type: "Titán encadenado", hp: 80, damage: 14, critRate: 0.28, armor: 4 },
    difficulty: "boss",
    choices: [
      { text: "Soltar grúa sobre su espalda (−3 materiales)", effect: { damage: 18, stunEnemy: true, materials: -3, time: 16000 } },
      { text: "Cortar tendón de Aquiles", effect: { damage: 14, bleedEnemy: true, time: 15000 } },
      { text: "Disparo concentrado a la nuca (−3 munición)", effect: { damage: 22, ammo: -3, time: 16000 } },
      { text: "Replegarse al corredor angosto", effect: { block: 0.35, morale: -2, time: 14000 } }
    ]
  },
  {
    id: 322,
    title: "Puente peatonal colgante",
    text: `Cables cantan con el viento. Un corredor frenético zigzaguea por las tablas sueltas.\nTemblor de tobillos, temblor de manos.`,
    enemy: { type: "Corredor frenético", hp: 24, damage: 7, critRate: 0.14 },
    difficulty: "easy",
    choices: [
      { text: "Romper tabla bajo sus pies", effect: { damage: 8, stunEnemy: true, time: 9000 } },
      { text: "Estocada en avance", effect: { damage: 7, time: 8000 } },
      { text: "Tiro al salto (−1 munición)", effect: { damage: 12, ammo: -1, time: 9000 } }
    ]
  },
  {
    id: 323,
    title: "Túnel de servicio",
    text: `Tuberías sudorosas, vapor que ciega. Un esbelto radia golpear y huir.\nEl mantenimiento de lo que fuimos sigue latiendo.`,
    enemy: { type: "Zombi esbelto", hp: 27, damage: 7, critRate: 0.16 },
    difficulty: "medium",
    choices: [
      { text: "Válvula abierta: chorro caliente", effect: { stunEnemy: true, damage: 7, time: 10000 } },
      { text: "Corte a la ingle y retroceso", effect: { damage: 9, time: 11000 } },
      { text: "Ráfaga corta (−1 munición)", effect: { damage: 12, ammo: -1, zombies: 1, time: 10000 } }
    ]
  },
  {
    id: 324,
    title: "Helipuerto vacío",
    text: `Pintura descascarada, horizonte abierto. Un mutado saltador se adelanta con fuerza elástica.\n¿Escaparías si pudieras o te quedarías con los tuyos?`,
    enemy: { type: "Saltador", hp: 36, damage: 10, critRate: 0.2 },
    difficulty: "hard",
    choices: [
      { text: "Agarre al vuelo y tirón", effect: { damage: 11, time: 13000 } },
      { text: "Red de cuerda improvisada (−2 materiales)", effect: { stunEnemy: true, damage: 8, materials: -2, time: 14000 } },
      { text: "Doble tiro en caída (−2 munición)", effect: { damage: 16, ammo: -2, time: 15000 } }
    ]
  },
  {
    id: 325,
    title: "Feria abandonada",
    text: `Caballitos inmóviles, premios polvorientos. Un payaso podrido corre con cuchillo oxidado.\nLa risa se oxidó antes que el metal.`,
    enemy: { type: "Carroñero payaso", hp: 29, damage: 8, critRate: 0.18 },
    difficulty: "medium",
    choices: [
      { text: "Derribo con poste de carpa", effect: { damage: 9, time: 11000 } },
      { text: "Nube de cal (−1 material)", effect: { stunEnemy: true, damage: 6, materials: -1, time: 10000 } },
      { text: "Tiro entre pintura corrida (−1 munición)", effect: { damage: 13, ammo: -1, time: 11000 } }
    ]
  },
  {
    id: 326,
    title: "Observatorio en la colina",
    text: `Cúpula agrietada mirando un cielo que ya no responde. Un flaco veloz zigzaguea entre telescopios.\nMirar lejos no evita lo cercano.`,
    enemy: { type: "Flaco veloz", hp: 25, damage: 7, critRate: 0.14 },
    difficulty: "easy",
    choices: [
      { text: "Trabar pierna con trípode", effect: { damage: 7, stunEnemy: true, time: 9000 } },
      { text: "Empujón y estocada", effect: { damage: 8, time: 9000 } },
      { text: "Tiro en corredor curvo (−1 munición)", effect: { damage: 12, ammo: -1, time: 9000 } }
    ]
  },
  {
    id: 327,
    title: "Corredor de hotel",
    text: `Alfombras manchadas, puertas entreabiertas. Un portero carnívoro avanza con guantes rotos.\nLa cortesía murió antes que la ciudad.`,
    enemy: { type: "Portero carnívoro", hp: 31, damage: 8, critRate: 0.16 },
    difficulty: "medium",
    choices: [
      { text: "Empujar carro de servicio", effect: { stunEnemy: true, damage: 7, time: 10000 } },
      { text: "Cortar tendón tras giro", effect: { damage: 9, time: 10000 } },
      { text: "Disparo a quemarropa (−1 munición)", effect: { damage: 13, ammo: -1, time: 9000 } }
    ]
  },
  {
    id: 328,
    title: "Central eléctrica",
    text: `Transformadores zumban como colmenas. Un guardia chisporroteante carga con piel ampollada.\nLa luz tiene deuda con la noche.`,
    enemy: { type: "Guardia chisporroteante", hp: 44, damage: 11, critRate: 0.22, armor: 2 },
    difficulty: "hard",
    choices: [
      { text: "Aislar con alfombra de goma (−1 material)", effect: { block: 0.35, materials: -1, time: 12000 } },
      { text: "Cortar muslo con hacha", effect: { damage: 12, bleedEnemy: true, time: 14000 } },
      { text: "Tiro al cuello (−2 munición)", effect: { damage: 18, ammo: -2, time: 15000 } }
    ]
  },
  {
    id: 329,
    title: "Bosque de antenas",
    text: `Estructuras como esqueletos. Un depredador sigiloso roza el metal sin ruido.\nLa comunicación falla cuando el miedo habla más fuerte.`,
    enemy: { type: "Depredador sigiloso", hp: 33, damage: 9, critRate: 0.2 },
    difficulty: "medium",
    choices: [
      { text: "Trampa con cable tensor (−2 materiales)", effect: { stunEnemy: true, damage: 8, materials: -2, time: 13000 } },
      { text: "Estocada cuando muerde", effect: { damage: 10, time: 12000 } },
      { text: "Tiro a reflejo en placa (−1 munición)", effect: { damage: 14, ammo: -1, time: 12000 } }
    ]
  },
  {
    id: 330,
    title: "Patio escolar",
    text: `Aros oxidados, líneas borradas. Un conserje muerto abre y cierra tijeras industriales.\nLa infancia fue un lugar seguro; ahora es un recuerdo que corta.`,
    enemy: { type: "Conserje cortante", hp: 35, damage: 9, critRate: 0.18 },
    difficulty: "medium",
    choices: [
      { text: "Atrapar tijeras con mochila", effect: { block: 0.3, damage: 6, time: 11000 } },
      { text: "Patada a la rótula y remate", effect: { damage: 10, time: 11000 } },
      { text: "Disparo a la sien (−1 munición)", effect: { damage: 14, ammo: -1, time: 10000 } }
    ]
  },
  {
    id: 331,
    title: "Mina subterránea",
    text: `Travesaños húmedos, sonido de goteo. Un minero encorvado con casco y linterna rota.\nLo profundo no perdona errores superficiales.`,
    enemy: { type: "Minero encorvado", hp: 38, damage: 10, critRate: 0.2, armor: 1 },
    difficulty: "hard",
    choices: [
      { text: "Hundir pico en clavícula", effect: { damage: 12, bleedEnemy: true, time: 14000 } },
      { text: "Derribar puntal (−2 materiales)", effect: { stunEnemy: true, damage: 9, materials: -2, time: 15000 } },
      { text: "Tiro al casco roto (−2 munición)", effect: { damage: 16, ammo: -2, time: 14000 } }
    ]
  },
  {
    id: 332,
    title: "Monasterio amurallado",
    text: `Piedras frías, ecos de cantos. Un guardián penitente avanza con paso torpe.\nLa fe, vacía o llena, igual exige sacrificios.`,
    enemy: { type: "Penitente", hp: 36, damage: 9, critRate: 0.18, armor: 1 },
    difficulty: "medium",
    choices: [
      { text: "Atrapar con manto (−1 material)", effect: { stunEnemy: true, damage: 7, materials: -1, time: 11000 } },
      { text: "Estocada al diafragma", effect: { damage: 10, time: 12000 } },
      { text: "Disparo limpio (−1 munición)", effect: { damage: 13, ammo: -1, time: 10000 } }
    ]
  },
  {
    id: 333,
    title: "Estadio del coloso",
    text: `Gradas huecas, césped amarillo. Un coloso con armadura de placas avanza con rugido vacío.\nLa multitud no está; el miedo hace olas igual.`,
    enemy: { type: "Coloso acorazado", hp: 85, damage: 15, critRate: 0.28, armor: 5 },
    difficulty: "boss",
    choices: [
      { text: "Cadenas a tobillos (−3 materiales)", effect: { stunEnemy: true, damage: 15, materials: -3, time: 16000 } },
      { text: "Cortar axila sin placas", effect: { damage: 18, bleedEnemy: true, time: 16000 } },
      { text: "Ráfaga pesada a ranuras (−3 munición)", effect: { damage: 24, ammo: -3, time: 17000 } },
      { text: "Aguantar tras barrera", effect: { block: 0.4, morale: -2, time: 14000 } }
    ]
  },
  {
    id: 334,
    title: "Mercado nocturno",
    text: `Toldos negros, velas temblorosas. Un cambista armado quiere tu mochila.\nEl trueque sin confianza es robo con ceremonia.`,
    enemy: { type: "Cambista traidor", hp: 34, damage: 9, critRate: 0.2 },
    difficulty: "medium",
    choices: [
      { text: "Volcar mesa y golpear", effect: { damage: 10, time: 11000 } },
      { text: "Cegar con polvo de pimienta (−1 material)", effect: { stunEnemy: true, damage: 6, materials: -1, time: 10000 } },
      { text: "Doble tiro al pecho (−2 munición)", effect: { damage: 16, ammo: -2, time: 12000 } }
    ]
  },
  {
    id: 335,
    title: "Trinchera en autopista",
    text: `Chatarra en filas, ruedas como murallas. Un enjambre disciplinado se acerca en bloque.\nLa organización también mata.`,
    enemy: { type: "Enjambre disciplinado", hp: 37, damage: 10, critRate: 0.18, armor: 1 },
    difficulty: "hard",
    choices: [
      { text: "Coctel a la primera fila (−1 material)", effect: { damage: 12, zombies: 1, materials: -1, time: 13000 } },
      { text: "Empujar coche a la bajada", effect: { stunEnemy: true, damage: 10, time: 14000 } },
      { text: "Ráfaga en abanico (−2 munición)", effect: { damage: 16, ammo: -2, time: 13000 } }
    ]
  },
  {
    id: 336,
    title: "Depósito municipal",
    text: `Estanterías amarillas, cintas de peligro. Un encargado monstruoso lanza llaves como cuchillas.\nEl orden se defendió hasta el fin.`,
    enemy: { type: "Encargado monstruoso", hp: 39, damage: 10, critRate: 0.2, armor: 1 },
    difficulty: "hard",
    choices: [
      { text: "Taparse con escudo de plástico", effect: { block: 0.35, damage: 6, time: 12000 } },
      { text: "Golpe al plexo con barra", effect: { damage: 11, time: 12000 } },
      { text: "Tiro a la garganta (−2 munición)", effect: { damage: 17, ammo: -2, time: 13000 } }
    ]
  },
  {
    id: 337,
    title: "Catedral en ruinas",
    text: `Vitrales rotos como ojos. Un cantor furioso ruge desde el ambón.\nLa belleza puede cortar al caer.`,
    enemy: { type: "Cantor furioso", hp: 42, damage: 11, critRate: 0.22 },
    difficulty: "hard",
    choices: [
      { text: "Atrapar con manto rasgado (−1 material)", effect: { stunEnemy: true, damage: 8, materials: -1, time: 12000 } },
      { text: "Cuchillada al diafragma", effect: { damage: 12, time: 13000 } },
      { text: "Bala a la sien (−2 munición)", effect: { damage: 18, ammo: -2, time: 14000 } }
    ]
  },
  {
    id: 338,
    title: "Barricada en la autopista",
    text: `Autos cruzados, humo ligero. Un saqueador con casco de moto y tubo de escape.\nProtección barata, violencia cara.`,
    enemy: { type: "Saqueador motero", hp: 30, damage: 9, critRate: 0.18, armor: 1 },
    difficulty: "medium",
    choices: [
      { text: "Enganchar casco y jalar", effect: { damage: 10, time: 11000 } },
      { text: "Cegar con espejo lateral (−1 material)", effect: { stunEnemy: true, damage: 6, materials: -1, time: 10000 } },
      { text: "Tiro frontal (−1 munición)", effect: { damage: 13, ammo: -1, time: 10000 } }
    ]
  },
  {
    id: 339,
    title: "Refectorio del convento",
    text: `Mesas largas, platos vacíos. Un cocinero putrefacto blande cuchillo de pan.\nEl hambre no santifica a nadie.`,
    enemy: { type: "Cocinero putrefacto", hp: 32, damage: 8, critRate: 0.16 },
    difficulty: "medium",
    choices: [
      { text: "Mesa al suelo para trabarlo", effect: { stunEnemy: true, damage: 7, time: 11000 } },
      { text: "Corte al codo", effect: { damage: 9, time: 10000 } },
      { text: "Disparo al ojo (−1 munición)", effect: { damage: 13, ammo: -1, time: 10000 } }
    ]
  },
  {
    id: 340,
    title: "Aduana abandonada",
    text: `Caseta con vidrios blindados. Un inspector corrompido muerde aún con reglamento en mano.\nLas reglas que ya no protegen sólo pesan.`,
    enemy: { type: "Inspector corrupto", hp: 34, damage: 9, critRate: 0.18, armor: 1 },
    difficulty: "medium",
    choices: [
      { text: "Empujar contra torniquete", effect: { damage: 10, stunEnemy: true, time: 11000 } },
      { text: "Cuchillada lateral", effect: { damage: 9, time: 10000 } },
      { text: "Doble tiro a través (−2 munición)", effect: { damage: 15, ammo: -2, time: 12000 } }
    ]
  },
  {
    id: 341,
    title: "Caverna de servicio",
    text: `Eco redondo, aire húmedo. Un alimañero humano lanza trampas de pinchos.\nLa astucia sin compasión es otra forma de podredumbre.`,
    enemy: { type: "Alimañero", hp: 33, damage: 9, critRate: 0.2 },
    difficulty: "medium",
    choices: [
      { text: "Hundirlo en su propia trampa (−1 material)", effect: { stunEnemy: true, damage: 8, materials: -1, time: 12000 } },
      { text: "Estocada cuando recupera trampa", effect: { damage: 10, time: 11000 } },
      { text: "Tiro a la mano (−1 munición)", effect: { damage: 12, ammo: -1, time: 10000 } }
    ]
  },
  {
    id: 342,
    title: "Garaje comunitario",
    text: `Olor a aceite, sombras entre autos. Un mecánico revenido empuña llave cruz.\nReparar o romper, cada uno elige su oficio.`,
    enemy: { type: "Mecánico revenido", hp: 35, damage: 10, critRate: 0.2 },
    difficulty: "hard",
    choices: [
      { text: "Bloquear con capó y golpear", effect: { block: 0.3, damage: 7, time: 12000 } },
      { text: "Cortar tendón cuando carga", effect: { damage: 11, bleedEnemy: true, time: 13000 } },
      { text: "Tiro al pecho (−2 munición)", effect: { damage: 16, ammo: -2, time: 13000 } }
    ]
  },
  {
    id: 343,
    title: "Rampa de carga",
    text: `Palés rotos, montacargas mudo. Un cargador sin alma levanta como si aún hubiera sueldo.\nEl trabajo no te salva si olvidaste por quién trabajas.`,
    enemy: { type: "Cargador sin alma", hp: 36, damage: 10, critRate: 0.2, armor: 1 },
    difficulty: "hard",
    choices: [
      { text: "Soltar palé encima (−1 material)", effect: { stunEnemy: true, damage: 9, materials: -1, time: 13000 } },
      { text: "Estocada al hígado", effect: { damage: 11, time: 12000 } },
      { text: "Ráfaga corta (−2 munición)", effect: { damage: 16, ammo: -2, time: 12000 } }
    ]
  },
  {
    id: 344,
    title: "Atrio del museo",
    text: `Columnas altas, mármol frío. Un guardián de sala hecho bestia arrastra por el suelo un poste de cordón rojo.\nCustodia un vacío que ya no necesita guardianes.`,
    enemy: { type: "Guardián de sala", hp: 38, damage: 11, critRate: 0.22, armor: 1 },
    difficulty: "hard",
    choices: [
      { text: "Atrapar con cuerda roja (−1 material)", effect: { stunEnemy: true, damage: 8, materials: -1, time: 13000 } },
      { text: "Golpe al cuello con asta", effect: { damage: 12, time: 13000 } },
      { text: "Tiro a distancia de seguridad (−2 munición)", effect: { damage: 17, ammo: -2, time: 14000 } }
    ]
  },
  {
    id: 345,
    title: "Laboratorio subterráneo",
    text: `Puertas presurizadas, alarmas mudas. Un alfa experimental vibra como un cable tensado.\nLa ciencia sin testigos no rinde cuentas.`,
    enemy: { type: "Alfa experimental", hp: 78, damage: 14, critRate: 0.3, armor: 3 },
    difficulty: "boss",
    choices: [
      { text: "Descargar nitrógeno (−2 materiales)", effect: { stunEnemy: true, damage: 16, materials: -2, time: 16000 } },
      { text: "Cortar arteria expuesta", effect: { damage: 18, bleedEnemy: true, time: 16000 } },
      { text: "Tiro triple a sensores (−3 munición)", effect: { damage: 24, ammo: -3, time: 17000 } },
      { text: "Aguantar tras blindaje", effect: { block: 0.4, morale: -2, time: 14000 } }
    ]
  }
];

export default combatCards;
