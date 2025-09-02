// src/data/days/day1/decisionCards.day1.ts
import type { DecisionCard } from "@/data/decisionCards";

export const day1DecisionCards: DecisionCard[] = [
  {
    id: 201,
    title: "La guardería silenciosa",
    text:
      "Un colegio abandonado conserva una guardería casi intacta. Juguetes apilados, cunas vacías y dibujos en las paredes. En la despensa hay latas caducadas pero quizá aprovechables. Dos puertas internas están atrancadas desde fuera: de un lado se oyen golpes apagados; del otro, nada. El grupo duda entre registrar todo o salir sin tocar nada.",
    choices: [
      { text: "Forzar ambas puertas", effect: { zombies: 2, materials: 3, morale: -2 } },
      { text: "Solo registrar la despensa", effect: { food: 4, water: 2, morale: 1 } },
      { text: "Retirarse en silencio", effect: { morale: -3, karma: 2 } }
    ]
  },
  {
    id: 202,
    title: "Cartas sin destinatario",
    text:
      "Encuentras un saco de cartas nunca enviadas con nombres y direcciones de la ciudad. Algunas prometen medicamentos, otras despedidas urgentes. Podrías seguir una dirección cercana, pero el mapa muestra zonas con actividad de hordas.",
    choices: [
      { text: "Seguir la dirección más cercana", effect: { medicine: 2, zombies: 1, morale: 2 } },
      { text: "Clasificar y dejar pistas para otros", effect: { morale: 3, karma: 4 } },
      { text: "Quemarlas para hacer una señal", effect: { morale: -4, fuel: 2 } }
    ]
  },
  {
    id: 203,
    title: "El puente oxidado",
    text:
      "Un puente metálico cruje sobre un río oscuro. Del otro lado, una farmacia intacta. La estructura resiste si cruzáis de uno en uno, pero el ruido atraería a los infectados de la ribera.",
    choices: [
      { text: "Cruzar ahora, rápido", effect: { medicine: 3, zombies: 2, morale: -1 } },
      { text: "Refuerzos improvisados antes de cruzar", effect: { materials: -3, morale: 2 } },
      { text: "Buscar un vado río abajo", effect: { karma: 1, morale: -1 } }
    ]
  },
  {
    id: 204,
    title: "El huerto en la azotea",
    text:
      "En una azotea hay un pequeño huerto cuidado por un anciano desconfiado. Pide agua a cambio de verduras para varios días. Desconfía de los recién llegados y mira de reojo vuestras armas.",
    choices: [
      { text: "Intercambiar agua por comida", effect: { water: -3, food: 6, morale: 2 } },
      { text: "Intentar robar de noche", effect: { food: 4, morale: -5, karma: -6 } },
      { text: "Ayudar a reforzar su puerta", effect: { materials: -2, food: 3, karma: 5 } }
    ]
  },
  {
    id: 205,
    title: "El camión frigorífico",
    text:
      "Un camión frigorífico bloquea una calle. Dentro, contenedores sellados. El generador aún tiene combustible, pero su ruido puede atraer una horda. Romper los sellos podría liberar un olor insoportable.",
    choices: [
      { text: "Abrir contenedores", effect: { food: 5, fuel: -2, zombies: 2 } },
      { text: "Llevarse el generador", effect: { fuel: 4, materials: 2, morale: 1 } },
      { text: "Sellarlo y dejar advertencias", effect: { karma: 3, morale: 2 } }
    ]
  },
  {
    id: 206,
    title: "El refugio con normas",
    text:
      "Un grupo organizado ofrece hospedaje por dos noches a cambio de munición y obedecer sus reglas estrictas: silencio total al anochecer y sin preguntas. Alguien de tu grupo no confía en ellos.",
    choices: [
      { text: "Aceptar las condiciones", effect: { ammo: -5, morale: 3 } },
      { text: "Negociar otra forma de pago", effect: { materials: -4, morale: 1, karma: 2 } },
      { text: "Rechazar y seguir", effect: { morale: -2 } }
    ]
  },
  {
    id: 207,
    title: "Llamadas en el hospital",
    text:
      "En una sala de urgencias, varios teléfonos aún reciben llamadas automáticas de familiares. Hay un quirófano cerrado con llave y un triaje con cajas de guantes y gasas.",
    choices: [
      { text: "Forzar el quirófano", effect: { medicine: 4, zombies: 2, morale: -1 } },
      { text: "Recolectar suministros básicos", effect: { medicine: 2, materials: 1, morale: 1 } },
      { text: "Registrar y dejar un mapa para otros", effect: { karma: 3, morale: 2 } }
    ]
  },
  {
    id: 208,
    title: "El semáforo parpadeante",
    text:
      "Un cruce principal sigue recibiendo energía. Las luces parpadeantes parecen atraer infectados. Unos coches abandonados aíslan una pequeña tienda de ultramarinos con la reja a medio cerrar.",
    choices: [
      { text: "Apagar el cuadro eléctrico", effect: { materials: 2, zombies: -1, morale: 1 } },
      { text: "Aprovechar la distracción para saquear", effect: { food: 4, water: 2, zombies: 1 } },
      { text: "Sellar el cruce con barricadas", effect: { materials: -5, karma: 3 } }
    ]
  },
  {
    id: 209,
    title: "Cuna mecánica",
    text:
      "En un taller de bicicletas hay piezas suficientes para armar carritos de carga. El dueño dejó una nota pidiendo que no toquen su caja fuerte 'por respeto a los caídos'.",
    choices: [
      { text: "Tomar solo piezas visibles", effect: { materials: 4, morale: 2 } },
      { text: "Forzar la caja fuerte", effect: { ammo: 6, morale: -4, karma: -6 } },
      { text: "Montar un carrito y dejar herramientas", effect: { materials: -2, morale: 3, karma: 4 } }
    ]
  },
  {
    id: 210,
    title: "La llamada al norte",
    text:
      "Una radio improvisada emite un mensaje: 'Ruta segura al norte, alimentos y agua, vengan armados'. La señal sube y baja. Podría ser una trampa o una oportunidad real.",
    choices: [
      { text: "Responder y ofrecer intercambio", effect: { karma: 2, morale: 2 } },
      { text: "Marcar la ruta y partir", effect: { fuel: -3, zombies: 1, morale: 1 } },
      { text: "Ignorar y registrar edificios cercanos", effect: { food: 2, water: 2 } }
    ]
  },
  {
    id: 211,
    title: "Cartel: 'No entrar'",
    text:
      "Una casa tapiada con un cartel escrito a mano: 'No entrar. Contagio'. Por la ventana se ve una mesa con medicamentos y una foto de familia.",
    choices: [
      { text: "Entrar con precaución", effect: { medicine: 3, zombies: 1, morale: -1 } },
      { text: "Respetar el cartel y dejar agua", effect: { water: -2, karma: 4, morale: 2 } },
      { text: "Marcar la casa en el mapa", effect: { karma: 1 } }
    ]
  },
  {
    id: 212,
    title: "La autopista del silencio",
    text:
      "Una autopista vacía lleva a un túnel. En la entrada, huellas recientes y rastros de arrastre. Se oye un eco rítmico en la oscuridad, como metal contra piedra.",
    choices: [
      { text: "Atravesar el túnel", effect: { fuel: -2, zombies: 2, morale: -2 } },
      { text: "Dar un rodeo por la colina", effect: { fuel: -4, morale: 1 } },
      { text: "Montar un puesto de observación", effect: { materials: -2, morale: 2 } }
    ]
  },
  {
    id: 213,
    title: "Biblioteca con candado",
    text:
      "La biblioteca del barrio está cerrada, pero en el patio se ven cajas con manuales técnicos, guías de primeros auxilios y mapas. Alguien dejó notas sobre rutas seguras.",
    choices: [
      { text: "Forzar acceso y llevar manuales", effect: { materials: 1, morale: 3, philosophical_strength: true } },
      { text: "Copiar mapas y dejar todo igual", effect: { morale: 2, karma: 3 } },
      { text: "Publicar un tablón con rutas", effect: { karma: 4, morale: 1 } }
    ]
  },
  {
    id: 214,
    title: "El perro del callejón",
    text:
      "Un perro hambriento te sigue varias cuadras. Buen olfato, asustado por ruidos fuertes. Un miembro del grupo quiere adoptarlo; otro teme que delate posiciones.",
    choices: [
      { text: "Compartir comida y entrenarlo", effect: { food: -2, morale: 4, karma: 3 } },
      { text: "Asustarlo para que se vaya", effect: { morale: -3 } },
      { text: "Que se quede fuera del campamento", effect: { morale: 1 } }
    ]
  },
  {
    id: 215,
    title: "Mercado fantasma",
    text:
      "Un antiguo mercado municipal aún tiene puestos con cajas cerradas. El techo, a punto de colapsar. Se ven sombras moviéndose entre los pasillos.",
    choices: [
      { text: "Barrido rápido por los pasillos", effect: { food: 3, water: 2, zombies: 1 } },
      { text: "Entrar por el techo con cuerdas", effect: { materials: -3, food: 5 } },
      { text: "Sellar accesos y volver luego", effect: { materials: -2, morale: 1 } }
    ]
  },
  {
    id: 216,
    title: "El bus escolar",
    text:
      "Un bus escolar encajado en una zanja. Dentro, mochilas con útiles y notas de emergencia. El conductor no está. La puerta trasera está trabada.",
    choices: [
      { text: "Liberar la puerta y registrar", effect: { materials: 2, water: 2, zombies: 1 } },
      { text: "Solo tomar útiles cercanos", effect: { materials: 1, morale: 1 } },
      { text: "Remolcar el bus para bloquear un acceso", effect: { fuel: -3, materials: 3, morale: 2 } }
    ]
  },
  {
    id: 217,
    title: "La antena rota",
    text:
      "Una antena de telecomunicaciones caída podría servir como estructura para trampas perimetrales. Desmontarla llevará horas y hará ruido.",
    choices: [
      { text: "Desmontar para trampas", effect: { materials: 5, zombies: 2, morale: 1 } },
      { text: "Solo recoger tornillería y cables", effect: { materials: 2, morale: 1 } },
      { text: "Dejarla como está y avanzar", effect: { morale: -1 } }
    ]
  },
  {
    id: 218,
    title: "Señal en la colina",
    text:
      "Desde una colina se ve humo en la distancia. Podría indicar un campamento o un incendio. Una exploración cuidadosa tomaría medio día.",
    choices: [
      { text: "Investigar con sigilo", effect: { fuel: -2, morale: 1, zombies: 1 } },
      { text: "Enviar un par con radio", effect: { ammo: -2, survivors: 1, morale: 2 } },
      { text: "Ignorar la señal", effect: { morale: -2 } }
    ]
  },
  {
    id: 219,
    title: "La tienda de música",
    text:
      "Guitarras, tambores y un piano desafinado. El sonido podría atraer problemas o levantar la moral. Entre cajas hay cuerdas, cueros y una linterna.",
    choices: [
      { text: "Tocar una canción breve", effect: { morale: 6, zombies: 1 } },
      { text: "Tomar útiles y salir", effect: { materials: 2, morale: 1 } },
      { text: "Dejar un mensaje grabado", effect: { karma: 2, morale: 2 } }
    ]
  },
  {
    id: 220,
    title: "Fábrica en silencio",
    text:
      "Una fábrica de conservas. En las oficinas, llaves y tarjetas magnéticas. El depósito principal huele a moho. Un zumbido indica generadores auxiliares.",
    choices: [
      { text: "Encender generadores y revisar", effect: { food: 6, zombies: 2, fuel: -2 } },
      { text: "Revisar oficinas primero", effect: { materials: 2, ammo: 2, morale: 1 } },
      { text: "Marcar el lugar para regreso", effect: { karma: 1 } }
    ]
  },
  {
    id: 221,
    title: "Procesión detenida",
    text:
      "Una pequeña capilla con velas gastadas y bancos volcados. Una caja de donaciones cerrada. Un sotano con olor a humedad.",
    choices: [
      { text: "Abrir la caja de donaciones", effect: { food: 2, water: 2, morale: 1 } },
      { text: "Bajar al sótano", effect: { zombies: 2, medicine: 1, ammo: 1 } },
      { text: "Reordenar el lugar y dejar agua", effect: { water: -2, karma: 4, morale: 2 } }
    ]
  },
  {
    id: 222,
    title: "Los trajes colgados",
    text:
      "Una tintorería con trajes en bolsas. En la trastienda, químicos y mascarillas. Un ventilador hace vibrar las perchas.",
    choices: [
      { text: "Tomar mascarillas y salir", effect: { materials: 1, morale: 1 } },
      { text: "Rebuscar químicos útiles", effect: { materials: 3, zombies: 1 } },
      { text: "Bloquear el acceso para otros", effect: { materials: -2, karma: -3 } }
    ]
  },
  {
    id: 223,
    title: "El columpio del parque",
    text:
      "Un parque vacío con columpios que chirrían al viento. Un quiosco cerrado tiene bebidas y snacks caducados. Hay huellas pequeñas en la arena recientes.",
    choices: [
      { text: "Abrir el quiosco", effect: { water: 2, food: 3 } },
      { text: "Seguir las huellas", effect: { survivors: 1, zombies: 1, morale: 2 } },
      { text: "Anotar la zona como peligrosa", effect: { karma: 1 } }
    ]
  },
  {
    id: 224,
    title: "Las maletas en la estación",
    text:
      "Una estación de buses con decenas de maletas. Muchos bolsillos, algunos candados rotos. Un panel de horarios aún parpadea con rutas inexistentes.",
    choices: [
      { text: "Registrar rápidamente", effect: { food: 3, water: 2, materials: 2 } },
      { text: "Montar un punto de intercambio", effect: { morale: 3, karma: 4 } },
      { text: "Aprovechar bolsos para el grupo", effect: { materials: 3, morale: 1 } }
    ]
  },
  {
    id: 225,
    title: "Pintura fresca",
    text:
      "Mensajes recientes en paredes: 'Zona libre más allá del río'. Flechas contradictorias señalan direcciones distintas. Algunos tachones ocultan rostros.",
    choices: [
      { text: "Seguir una de las flechas", effect: { fuel: -2, zombies: 1, morale: 1 } },
      { text: "Dejar señales claras para otros", effect: { karma: 4, morale: 2 } },
      { text: "Ignorar y consolidar posiciones", effect: { materials: 2 } }
    ]
  },
  {
    id: 226,
    title: "Vagón bloqueado",
    text:
      "En la entrada del metro, un vagón descarrilado bloquea dos túneles. Dentro hay mochilas y linternas. Se escuchan arañazos regulares.",
    choices: [
      { text: "Entrar y registrar", effect: { materials: 2, water: 2, zombies: 2 } },
      { text: "Desbloquear un túnel lateral", effect: { materials: -3, morale: 2 } },
      { text: "Dejar marcas de peligro", effect: { karma: 2 } }
    ]
  },
  {
    id: 227,
    title: "La clínica de barrio",
    text:
      "Una clínica con carteles de vacunación. La nevera está apagada. Hay botiquines cerrados y formularios desparramados.",
    choices: [
      { text: "Forzar botiquines", effect: { medicine: 3, morale: 1 } },
      { text: "Buscar registros útiles", effect: { medicine: 2, karma: 1 } },
      { text: "Sellar ventanas y dejar nota", effect: { materials: -2, karma: 3 } }
    ]
  },
  {
    id: 228,
    title: "Carretera de espejos",
    text:
      "Alguien dispersó espejos en una carretera, quizá para confundir a los infectados. Entre los reflejos, se mueven sombras.",
    choices: [
      { text: "Recoger espejos tácticos", effect: { materials: 2, morale: 1 } },
      { text: "Atravesar a plena luz", effect: { zombies: 1, fuel: -1 } },
      { text: "Rodear por el campo", effect: { fuel: -2, morale: -1 } }
    ]
  },
  {
    id: 229,
    title: "El almacén inundado",
    text:
      "Un almacén con agua hasta las rodillas. Flotan cajas, pero algunas parecen intactas. El olor agrio invita a salir rápido.",
    choices: [
      { text: "Arriesgarse a buscar comida", effect: { food: 5, zombies: 1 } },
      { text: "Tomar solo lo que flota", effect: { food: 2, water: 1 } },
      { text: "Cerrar compuertas para drenar", effect: { materials: -3, morale: 2 } }
    ]
  },
  {
    id: 230,
    title: "Sótano con radio",
    text:
      "Un sótano lleno de baterías y radios. Una antena casera en la ventana. Un cuaderno registra mensajes de auxilio de hace semanas.",
    choices: [
      { text: "Reparar la antena y emitir", effect: { materials: -2, survivors: 1, morale: 2 } },
      { text: "Tomar baterías y marchar", effect: { materials: 2, fuel: 1 } },
      { text: "Dejar un mensaje de rutas", effect: { karma: 3, morale: 1 } }
    ]
  },
  {
    id: 231,
    title: "Taller de cerrajería",
    text:
      "En una cerrajería hay ganzúas, cerraduras y cajas fuertes pequeñas. El dueño dejó instrucciones para abrir una 'caja de emergencia' oculta.",
    choices: [
      { text: "Abrir la caja de emergencia", effect: { medicine: 1, ammo: 3, morale: 1 } },
      { text: "Tomar herramientas discretamente", effect: { materials: 3 } },
      { text: "Dejar un juego de llaves universal", effect: { karma: 4, morale: 2 } }
    ]
  },
  {
    id: 232,
    title: "Jugadores en la cancha",
    text:
      "Un grupo improvisa un partido para olvidar el miedo. Piden que os unáis. Otros creen que perder tiempo es peligroso.",
    choices: [
      { text: "Jugar un rato corto", effect: { morale: 6 } },
      { text: "Vigilar mientras juegan", effect: { morale: 3, zombies: -1 } },
      { text: "Negarse y seguir", effect: { morale: -2 } }
    ]
  },
  {
    id: 233,
    title: "Cine en penumbra",
    text:
      "Un cine antiguo con carteles descoloridos. Palomitas viejas en el suelo. Tras la pantalla, una escalera a la cabina de proyección.",
    choices: [
      { text: "Buscar en la cabina", effect: { materials: 2, fuel: 1 } },
      { text: "Proyectar luz para atraer y limpiar", effect: { zombies: 2, ammo: -2, morale: 2 } },
      { text: "Aprovechar butacas para combustible", effect: { fuel: 2, morale: -1 } }
    ]
  },
  {
    id: 234,
    title: "La panadería",
    text:
      "Una panadería con harina derramada y hornos fríos. Hay sacos cerrados y una libreta de recetas sencillas.",
    choices: [
      { text: "Tomar harina y utensilios", effect: { food: 4, materials: 1 } },
      { text: "Hornear algo rápido", effect: { food: 2, morale: 3, zombies: 1 } },
      { text: "Dejar la receta duplicada", effect: { karma: 2 } }
    ]
  },
  {
    id: 235,
    title: "Caravana varada",
    text:
      "Una caravana volcó en una zanja. Dentro, mochilas y una caja con botiquines básicos. Hay un rastro de sangre hacia el bosque.",
    choices: [
      { text: "Rescatar botiquines", effect: { medicine: 3, morale: 1 } },
      { text: "Seguir el rastro", effect: { survivors: 1, zombies: 1, morale: 2 } },
      { text: "Aprovechar piezas de la caravana", effect: { materials: 3 } }
    ]
  },
  {
    id: 236,
    title: "Aula de ciencias",
    text:
      "En un liceo, el laboratorio de ciencias tiene alcohol, gasas y cuadernos. El despacho del profesor está cerrado.",
    choices: [
      { text: "Forzar el despacho", effect: { medicine: 2, ammo: 1, zombies: 1 } },
      { text: "Tomar solo material médico", effect: { medicine: 3 } },
      { text: "Dejar notas de primeros auxilios", effect: { karma: 3, morale: 1 } }
    ]
  },
  {
    id: 237,
    title: "Estación de servicio",
    text:
      "Los surtidores están apagados pero el depósito quizá tiene restos. La tienda anexa tiene snacks y mapas viejos.",
    choices: [
      { text: "Sifonear combustible", effect: { fuel: 4, zombies: 1 } },
      { text: "Registrar la tienda", effect: { food: 2, water: 2, morale: 1 } },
      { text: "Marcar precios justos para trueque", effect: { karma: 3 } }
    ]
  },
  {
    id: 238,
    title: "Callejón con trampas",
    text:
      "El Callejón está lleno de latas colgantes que suenan con el viento. Quizá alguien vive cerca. Una puerta lateral entreabierta invita a mirar.",
    choices: [
      { text: "Avanzar con sigilo", effect: { materials: 2, zombies: -1 } },
      { text: "Llamar y esperar respuesta", effect: { survivors: 1, morale: 1 } },
      { text: "Cortar las latas y seguir", effect: { materials: 1, karma: -2 } }
    ]
  },
  {
    id: 239,
    title: "Puesto fronterizo",
    text:
      "Un control policial abandonado con chalecos, baterías y un botiquín marcado con una cruz. La caseta huele a humo reciente.",
    choices: [
      { text: "Tomar chalecos y botiquín", effect: { medicine: 2, materials: 2 } },
      { text: "Investigar el área", effect: { ammo: 2, zombies: 1 } },
      { text: "Dejar una nota de advertencia", effect: { karma: 2 } }
    ]
  },
  {
    id: 240,
    title: "Colonia de gatos",
    text:
      "Una colonia de gatos ocupa un patio interior. Hay platos, latas abiertas y una bodega con pienso. Los maullidos atraen curiosos.",
    choices: [
      { text: "Tomar pienso para atraer presas", effect: { materials: 1, morale: 1 } },
      { text: "Dejar comida y marchar", effect: { food: -1, karma: 3, morale: 2 } },
      { text: "Crear un refugio discreto", effect: { materials: -2, morale: 3 } }
    ]
  },
  {
    id: 241,
    title: "Aparcadero hundido",
    text:
      "Un estacionamiento subterráneo con charcos de aceite. Un par de autos tienen el capó abierto y herramientas a la vista.",
    choices: [
      { text: "Recoger herramientas", effect: { materials: 3, morale: 1 } },
      { text: "Intentar arrancar un coche", effect: { fuel: 2, zombies: 1 } },
      { text: "Desactivar alarmas para otros", effect: { karma: 2 } }
    ]
  },
  {
    id: 242,
    title: "Tienda de camping",
    text:
      "Sacochos, sogas, cantimploras. Un pasillo con hornillos y gas. El escaparate tiene grietas peligrosas.",
    choices: [
      { text: "Equiparse para travesía", effect: { materials: 3, water: 1 } },
      { text: "Tomar gas y hornillos", effect: { fuel: 3 } },
      { text: "Refuerzo de escaparate", effect: { materials: -2, karma: 3 } }
    ]
  },
  {
    id: 243,
    title: "Guardería de adultos",
    text:
      "Un centro de día para mayores. Sillas de ruedas, mantas y un armario con medicación básica. Una puerta se mueve con golpes suaves.",
    choices: [
      { text: "Tomar medicación y mantas", effect: { medicine: 2, materials: 1 } },
      { text: "Abrir la puerta con cuidado", effect: { survivors: 1, zombies: 1, morale: 2 } },
      { text: "Sellar y dejar una marca", effect: { materials: -1, karma: 2 } }
    ]
  },
  {
    id: 244,
    title: "Plaza de trueque",
    text:
      "Varias personas han dejado cajas selladas con etiquetas: 'cambio'. Se ve munición, latas y una caja de herramientas. Nadie a la vista.",
    choices: [
      { text: "Intercambiar con honestidad", effect: { ammo: -2, food: 4, morale: 2, karma: 4 } },
      { text: "Tomar lo necesario y dejar poco", effect: { food: 2, ammo: 1, karma: -4 } },
      { text: "Ordenar y dejar normas claras", effect: { materials: -1, morale: 2, karma: 5 } }
    ]
  },
  {
    id: 245,
    title: "Búnker sin dueño",
    text:
      "Una entrada de búnker con combinación rota. Dentro, estantes vacíos pero una caja fuerte pequeña empotrada. Un plano indica un depósito secundario.",
    choices: [
      { text: "Abrir la caja fuerte", effect: { bunker_key: true, ammo: 2, morale: 1 } },
      { text: "Seguir el plano al depósito", effect: { food: 3, water: 3, zombies: 2 } },
      { text: "Sellar la entrada para otros", effect: { materials: -2, karma: 3 } }
    ]
  }
];

