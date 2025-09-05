// Baraja de CARTAS DE COMBATE (rojas)
// Nota: estas cartas están pensadas para integrarse con el mismo
// manejador de decisiones (handleStoryChoice). Por eso sus efectos
// usan solo claves ya soportadas allí: zombies, morale, food, water,
// ammo, medicine, materials, fuel, survivors, casualties ('random'),
// karma. Evitamos tocar estado profundo (camp.defense, etc.) aquí.

export type CombatCard = {
  id: number;
  category: "combat";          // usado para pintar en rojo y rutear la lógica
  title: string;
  text: string;                // narrativa breve sin cambiar el estilo visual general
  choices: Array<{
    text: string;
    effect: {
      zombies?: number;
      morale?: number;
      food?: number;
      water?: number;
      ammo?: number;
      medicine?: number;
      materials?: number;
      fuel?: number;
      survivors?: number;
      casualties?: "random";
      karma?: number;
    };
  }>;
};

// ⚠️ Mantén los IDs únicos en todo el mazo de combate
export const combatCards: CombatCard[] = [
  {
    id: 1001,
    category: "combat",
    title: "Emboscada en el Callejón",
    text: "Al doblar la esquina, los gruñidos retumban: una pequeña horda bloquea la salida del callejón.",
    choices: [
      { text: "Cargar de frente", effect: { zombies: 3, morale: -2 } },
      { text: "Disparos selectivos", effect: { zombies: 2, ammo: -2 } },
      { text: "Retroceder con calma", effect: { morale: -1 } }
    ]
  },
  {
    id: 1002,
    category: "combat",
    title: "Azotea Asediada",
    text: "En lo alto, el grupo queda atrapado. Los infectados trepan torpemente por las escaleras.",
    choices: [
      { text: "Defender la escalera", effect: { zombies: 4, ammo: -1 } },
      { text: "Lanzar objetos pesados", effect: { zombies: 3, materials: -2 } },
      { text: "Retirada controlada", effect: { morale: -1 } }
    ]
  },
  {
    id: 1003,
    category: "combat",
    title: "Corredores en la Avenida",
    text: "Corredores salen entre autos destrozados. Su velocidad sorprende al grupo.",
    choices: [
      { text: "Fuego de supresión", effect: { zombies: 3, ammo: -3 } },
      { text: "Romper formación y dispersarse", effect: { morale: -2 } },
      { text: "Escalar a un bus cercano", effect: { zombies: 2, materials: -1 } }
    ]
  },
  {
    id: 1004,
    category: "combat",
    title: "Tanque en el Túnel",
    text: "Un zombi tanque bloquea el paso en un túnel estrecho. Su rugido retumba.",
    choices: [
      { text: "Acribillarlo", effect: { zombies: 1, ammo: -4 } },
      { text: "Atraerlo y esquivarlo", effect: { morale: -1 } },
      { text: "Usar combustible como trampa", effect: { zombies: 1, fuel: -2 } }
    ]
  },
  {
    id: 1005,
    category: "combat",
    title: "Acechadores en las Sombras",
    text: "Susurros y pasos suaves. Acechadores rodean al grupo con sigilo.",
    choices: [
      { text: "Iluminar y atacar", effect: { zombies: 3, ammo: -1 } },
      { text: "Mantener silencio y avanzar", effect: { morale: -1 } },
      { text: "Crear distracción con chatarra", effect: { zombies: 2, materials: -1 } }
    ]
  },
  {
    id: 1006,
    category: "combat",
    title: "Berserker Desatado",
    text: "Un infectado en frenesí embiste sin control, arrollando obstáculos.",
    choices: [
      { text: "Detenerlo con ráfagas", effect: { zombies: 1, ammo: -3 } },
      { text: "Tender una trampa improvisada", effect: { zombies: 1, materials: -2 } },
      { text: "Replegarse y cortar su ruta", effect: { morale: -1 } }
    ]
  },
  {
    id: 1007,
    category: "combat",
    title: "Tóxicos a la Vista",
    text: "Zombis tóxicos avanzan soltando nubes irritantes y peligrosas.",
    choices: [
      { text: "Disparos a distancia", effect: { zombies: 2, ammo: -2 } },
      { text: "Enfrentar y resistir", effect: { zombies: 2, medicine: -1 } },
      { text: "Esperar que despeje", effect: { morale: -1 } }
    ]
  },
  {
    id: 1008,
    category: "combat",
    title: "Mutado en el Mercado",
    text: "Un mutado enorme aplasta puestos y lanza restos como proyectiles.",
    choices: [
      { text: "Concentrar fuego", effect: { zombies: 1, ammo: -4 } },
      { text: "Usar explosivo improvisado", effect: { zombies: 1, fuel: -2, materials: -1 } },
      { text: "Contenerlo y flanquear", effect: { zombies: 1, morale: -1 } }
    ]
  },
  {
    id: 1009,
    category: "combat",
    title: "Horda Migratoria",
    text: "Una masa inquieta de muertos pasa cerca, el peligro es extremo.",
    choices: [
      { text: "Atrincherarse y aguantar", effect: { zombies: 5, ammo: -3, morale: -1 } },
      { text: "Desviar con ruido lejano", effect: { materials: -2 } },
      { text: "Desplazarse por cubiertas", effect: { morale: -2 } }
    ]
  },
  {
    id: 1010,
    category: "combat",
    title: "Grieta en la Valla",
    text: "Durante la guardia nocturna, los muertos empujan una sección de valla rota.",
    choices: [
      { text: "Reparar bajo presión", effect: { zombies: 2, materials: -2 } },
      { text: "Descargar plomo", effect: { zombies: 3, ammo: -3 } },
      { text: "Replegar civiles", effect: { morale: -2 } }
    ]
  },
  {
    id: 1011,
    category: "combat",
    title: "Pasillo Angosto",
    text: "El grupo queda encajonado en un pasillo largo con acceso limitado.",
    choices: [
      { text: "Formación de embudo", effect: { zombies: 3, ammo: -2 } },
      { text: "Fintas y retroceso táctico", effect: { morale: -1 } },
      { text: "Bloquear con muebles", effect: { zombies: 2, materials: -2 } }
    ]
  },
  {
    id: 1012,
    category: "combat",
    title: "Autobús Volcado",
    text: "Un autobús truncado crea un punto de estrangulamiento útil… y peligroso.",
    choices: [
      { text: "Aprovechar cobertura", effect: { zombies: 3, ammo: -1 } },
      { text: "Encender una barrera", effect: { zombies: 2, fuel: -2 } },
      { text: "Salir por el techo", effect: { morale: -1 } }
    ]
  },
  {
    id: 1013,
    category: "combat",
    title: "Nido en la Biblioteca",
    text: "Silencio tenso. Entre estantes, un grupo dormita. Un paso en falso…",
    choices: [
      { text: "Eliminar sigilosos primero", effect: { zombies: 2, ammo: -1 } },
      { text: "Crear distracción al pasillo", effect: { materials: -1 } },
      { text: "Pasar a gatas, sin arriesgar", effect: { morale: -1 } }
    ]
  },
  {
    id: 1014,
    category: "combat",
    title: "Garage Subterráneo",
    text: "Motores oxidados, columnas, ecos. Los infectados emergen entre coches.",
    choices: [
      { text: "Encender y arrollar", effect: { zombies: 2, fuel: -2 } },
      { text: "Linternas + disparos", effect: { zombies: 3, ammo: -2 } },
      { text: "Cerrar compuerta y sellar", effect: { materials: -2 } }
    ]
  },
  {
    id: 1015,
    category: "combat",
    title: "Puente Estrecho",
    text: "Cruzando el puente, zombis suben por los costados, peligrosamente cerca.",
    choices: [
      { text: "Empujarlos al vacío", effect: { zombies: 3 } },
      { text: "Cortar cuerda de acceso", effect: { materials: -1 } },
      { text: "Volver al inicio", effect: { morale: -2 } }
    ]
  },
  {
    id: 1016,
    category: "combat",
    title: "Patio Escolar",
    text: "El recreo se volvió mortuorio. Varios te detectan y avanzan dispersos.",
    choices: [
      { text: "Agrupar y barrer", effect: { zombies: 3, ammo: -2 } },
      { text: "Usar silbatos y correr", effect: { morale: -1 } },
      { text: "Trabar puertas con pupitres", effect: { zombies: 2, materials: -1 } }
    ]
  },
  {
    id: 1017,
    category: "combat",
    title: "Calle Enlodada",
    text: "Lluvia reciente. El fango ralentiza a todos, pero los muertos no sienten fatiga.",
    choices: [
      { text: "Fuego a distancia segura", effect: { zombies: 2, ammo: -2 } },
      { text: "Círculo defensivo", effect: { zombies: 3, morale: -1 } },
      { text: "Rodear por los patios", effect: { morale: -1 } }
    ]
  },
  {
    id: 1018,
    category: "combat",
    title: "Andén del Metro",
    text: "Oscuridad, ecos metálicos y pasos arrastrados. Peligro en varias direcciones.",
    choices: [
      { text: "Señuelos con latas", effect: { materials: -1 } },
      { text: "Avance por columnas", effect: { zombies: 2, ammo: -1 } },
      { text: "Esperar el hueco y cruzar", effect: { morale: -1 } }
    ]
  },
  {
    id: 1019,
    category: "combat",
    title: "Perímetro Comprometido",
    text: "Una sección del perímetro atrae demasiados enemigos a la vez.",
    choices: [
      { text: "Ráfagas controladas", effect: { zombies: 3, ammo: -3 } },
      { text: "Picos y palas", effect: { zombies: 2, materials: -1 } },
      { text: "Evacuación parcial", effect: { morale: -2 } }
    ]
  },
  {
    id: 1020,
    category: "combat",
    title: "Sótano Inundado",
    text: "Agua turbia hasta la cintura. Algo se mueve muy cerca de las piernas.",
    choices: [
      { text: "Iluminar y disparar", effect: { zombies: 2, ammo: -2 } },
      { text: "Retroceder sin ruido", effect: { morale: -1 } },
      { text: "Bloquear rejas", effect: { materials: -2 } }
    ]
  },
  {
    id: 1021,
    category: "combat",
    title: "Estacionamiento en Espiral",
    text: "Suben y bajan por rampas: un carrusel de peligro constante.",
    choices: [
      { text: "Cortar paso principal", effect: { zombies: 2, materials: -2 } },
      { text: "Fuego en movimiento", effect: { zombies: 3, ammo: -2 } },
      { text: "Atrás y buscar otra salida", effect: { morale: -1 } }
    ]
  },
  {
    id: 1022,
    category: "combat",
    title: "Patio de Carga",
    text: "Contenedores, montacargas, sombras largas. Se acercan por ambos flancos.",
    choices: [
      { text: "Aplastar con montacargas", effect: { zombies: 2, fuel: -1 } },
      { text: "Trancar con cadenas", effect: { materials: -2 } },
      { text: "Disparo a puntos altos", effect: { zombies: 2, ammo: -2 } }
    ]
  },
  {
    id: 1023,
    category: "combat",
    title: "Atrio del Hospital",
    text: "Camillas volcadas, botellas rotas. Se escucha un lamento cercano.",
    choices: [
      { text: "Cortar paso de acceso", effect: { materials: -1 } },
      { text: "Despejar con precisión", effect: { zombies: 2, ammo: -1 } },
      { text: "Avanzar por urgencias", effect: { morale: -1 } }
    ]
  },
  {
    id: 1024,
    category: "combat",
    title: "Jardín Cercado",
    text: "Un área con salida angosta. Una mala decisión y será trampa mortal.",
    choices: [
      { text: "Lluvia de proyectiles", effect: { zombies: 3, ammo: -2 } },
      { text: "Crear brecha de escape", effect: { materials: -2 } },
      { text: "Mantener distancia", effect: { morale: -1 } }
    ]
  }
];

export default combatCards;
