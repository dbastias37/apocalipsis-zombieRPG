export type LeadType = 'combat' | 'cache' | null;

export interface NoteReward {
  food?: number; water?: number; materials?: number; ammo?: number; medicine?: number; fuel?: number;
  itemId?: string;
}

export interface GameNote {
  id: number;
  title: string;
  body: string;
  hintLocation?: string;
  leadType: LeadType;
  leadDifficulty?: 1 | 2 | 3;
  rewards?: NoteReward;
  resolved?: boolean;
}

export const GAME_NOTES: GameNote[] = [
  { id: 1, title: "Diario del guardia", body: "El primer día cerramos las puertas. El último, nadie quedó para abrirlas.", leadType: null },
  { id: 2, title: "Frecuencia 7.16", body: "La señal se repite cada medianoche. Dice: 'Resistid en la fábrica vieja'.", hintLocation: "Fábrica vieja", leadType: 'combat', leadDifficulty: 1, rewards: { ammo: 10, itemId: 'escopeta' } },
  { id: 3, title: "Lista de racionamiento", body: "Reducimos porciones; alguien empezó a robar de noche.", leadType: null },
  { id: 4, title: "Mapa del metro", body: "Un túnel sellado conduce a la cochera norte. Escuché pasos...", hintLocation: "Cochera norte", leadType: 'combat', leadDifficulty: 2, rewards: { medicine: 2, itemId: 'linterna' } },
  { id: 5, title: "Bitácora de enfermería", body: "La fiebre subía al caer el sol. La música los calmaba un poco.", leadType: null },
  { id: 6, title: "Garaje 12", body: "En el box 12 escondimos combustible antes de huir.", hintLocation: "Garaje comunal", leadType: 'cache', rewards: { fuel: 4, materials: 2 } },
  { id: 7, title: "Turno de vigilancia", body: "Turnos dobles agotaron a todos. Caímos dormidos cuando más nos necesitaban.", leadType: null },
  { id: 8, title: "Esquina del puerto", body: "Un viejo dejó su 'tesoro' bajo un tablón flojo.", hintLocation: "Muelle", leadType: 'cache', rewards: { itemId: 'cuerda', materials: 3 } },
  { id: 9, title: "Mensaje en la pared", body: "“No mires atrás.” Había rastros de arrastre hacia el este.", leadType: null },
  { id:10, title: "Cuaderno escolar", body: "“Si alguien encuentra esto, mamá dijo que corra al puente roto”.", hintLocation: "Puente roto", leadType: 'combat', leadDifficulty: 1, rewards: { food: 3, itemId: 'machete' } },
  { id:11, title: "Ruta de escape", body: "La azotea conecta tres edificios.", hintLocation: "Azoteas", leadType: 'cache', rewards: { materials: 4, itemId: 'toldo' } },
  { id:12, title: "Caja roja", body: "La señal flares bajo el tanque.", hintLocation: "Campo de autos", leadType: 'cache', rewards: { ammo: 10 } },
  { id:13, title: "Farmacia cerrada", body: "Rejas ceden con palanca.", hintLocation: "Farmacia central", leadType: 'cache', rewards: { medicine: 3, itemId: 'antibioticos' } },
  { id:14, title: "Viejo arsenal", body: "El sótano del club de tiro resiste.", hintLocation: "Club de tiro", leadType: 'combat', leadDifficulty: 2, rewards: { ammo: 15, itemId: 'rifle_caza' } },
  { id:15, title: "Bus sin salida", body: "Bajo el asiento trasero hay algo.", hintLocation: "Terminal", leadType: 'cache', rewards: { water: 3, food: 2 } },
  { id:16, title: "La voz del DJ", body: "“Ritmo vivo, muertos lejos”. Antena en la colina.", hintLocation: "Antena", leadType: 'combat', leadDifficulty: 1, rewards: { ammo: 8, itemId: 'radio' } },
  { id:17, title: "Clavos en caja", body: "Señalamos almacén detrás del taller.", hintLocation: "Taller", leadType: 'cache', rewards: { materials: 8, itemId: 'martillo' } },
  { id:18, title: "Sótano húmedo", body: "Huele a medicina y moho.", hintLocation: "Hospital viejo", leadType: 'cache', rewards: { medicine: 4 } },
  { id:19, title: "Chatarra útil", body: "Puertas arrancadas apiladas al norte.", hintLocation: "Depósito", leadType: 'cache', rewards: { materials: 10, itemId: 'placas' } },
  { id:20, title: "Silencio en la escuela", body: "Aula 3: “NO ENTRE” escrito con tiza.", hintLocation: "Escuela", leadType: 'combat', leadDifficulty: 2, rewards: { itemId: 'mochila', food: 2 } },
  { id:21, title: "Silo de grano", body: "Escotilla lateral no cerraba bien.", hintLocation: "Granero", leadType: 'cache', rewards: { food: 5 } },
  { id:22, title: "El relojero", body: "Guardó piezas en la caja fuerte rota.", hintLocation: "Relojería", leadType: 'cache', rewards: { materials: 6 } },
  { id:23, title: "El rezo final", body: "Encendimos velas en el atrio.", hintLocation: "Iglesia", leadType: 'combat', leadDifficulty: 1, rewards: { medicine: 2 } },
  { id:24, title: "Estación de tren", body: "Taquilla 7 tenía doble fondo.", hintLocation: "Estación", leadType: 'cache', rewards: { ammo: 10, itemId: 'pistola9' } },
  { id:25, title: "Depósito municipal", body: "Archivo E-14 marcaba “prohibido”.", hintLocation: "Municipalidad", leadType: 'combat', leadDifficulty: 3, rewards: { ammo: 12, materials: 6 } },
  { id:26, title: "Notas del chef", body: "Sótano con hornillas y bidones.", hintLocation: "Restaurante", leadType: 'cache', rewards: { fuel: 3, itemId: 'kit_cocina' } },
  { id:27, title: "Bitácora del bus", body: "Ruta 5 paraba en bodega olvidada.", hintLocation: "Bodega", leadType: 'cache', rewards: { water: 4, food: 3 } },
  { id:28, title: "Pista en grafiti", body: "“El norte canta, el sur mordisquea”.", leadType: null },
  { id:29, title: "Inventario fallido", body: "Conté 20, salieron 19. ¿Quién falta?", leadType: null },
  { id:30, title: "El mecánico", body: "Guardó una caja bajo el foso.", hintLocation: "Mecánica", leadType: 'cache', rewards: { materials: 4, itemId: 'destorn' } },
  { id:31, title: "Parque nocturno", body: "Luces atraen. No encender.", leadType: null },
  { id:32, title: "Campana rota", body: "El sonido llamó a muchos.", leadType: null },
  { id:33, title: "Puerta 3B", body: "Candado oxidado; fácil de abrir.", hintLocation: "Bloque 3B", leadType: 'cache', rewards: { materials: 5, itemId: 'alambre' } },
  { id:34, title: "La enfermera", body: "Dijo que “guarda algo” en su casillero.", hintLocation: "Clínica", leadType: 'cache', rewards: { medicine: 3, itemId: 'antiseptico' } },
  { id:35, title: "Pared sellada", body: "Se oyen golpes débiles.", leadType: null },
  { id:36, title: "Manga de viento", body: "La pista no sirve, pero el hangar sí.", hintLocation: "Aeródromo", leadType: 'combat', leadDifficulty: 2, rewards: { ammo: 12, fuel: 2 } },
  { id:37, title: "Caja con cruz", body: "Bajo la estantería de salmos.", hintLocation: "Biblioteca parroquial", leadType: 'cache', rewards: { medicine: 2 } },
  { id:38, title: "Notas del capitán", body: "Punta sur: escondimos bengalas y comida.", hintLocation: "Faro", leadType: 'cache', rewards: { food: 4, ammo: 6 } },
  { id:39, title: "Por el túnel", body: "Frío y seco. Algo se mueve.", hintLocation: "Túnel de servicio", leadType: 'combat', leadDifficulty: 3, rewards: { itemId: 'francotirador', ammo: 5 } },
  { id:40, title: "La tienda rota", body: "El toldo puede repararse.", leadType: null },
  { id:41, title: "Ruedas al norte", body: "Se oyen motores aún.", hintLocation: "Barrio talleres", leadType: 'cache', rewards: { fuel: 3, materials: 4 } },
  { id:42, title: "La radio calló", body: "Solo estática. Silencio pesado.", leadType: null },
  { id:43, title: "Caja de pesca", body: "Anzuelos y cuerda fina.", hintLocation: "Lago", leadType: 'cache', rewards: { food: 2, itemId: 'cuerda' } },
  { id:44, title: "Muelles vacíos", body: "Algo chapotea de noche.", leadType: null },
  { id:45, title: "Trincheras", body: "Sacos húmedos, balas secas.", hintLocation: "Terraplén", leadType: 'cache', rewards: { ammo: 10 } },
  { id:46, title: "El granero 2", body: "Animales huyeron. Comida quedó.", hintLocation: "Granja", leadType: 'cache', rewards: { food: 5 } },
  { id:47, title: "El club", body: "Sótano batiente. Poca luz.", hintLocation: "Club nocturno", leadType: 'combat', leadDifficulty: 1, rewards: { itemId: 'smg', ammo: 10 } },
  { id:48, title: "La escalera", body: "Corta camino a los tejados.", leadType: null },
  { id:49, title: "Señal de humo", body: "Alguien pide ayuda al oeste.", hintLocation: "Barrio antiguo", leadType: 'combat', leadDifficulty: 2, rewards: { medicine: 2, food: 3 } },
  { id:50, title: "Última entrada", body: "“Si fallamos, recuerda: fuimos humanos”.", leadType: null },
];
