import { DecisionCard } from "../../decisionCards";

export const day1DecisionCards: DecisionCard[] = [
  {
    id: 201,
    title: "Luces en el almacén municipal",
    text:
`Al caer la tarde, a lo lejos parpadean luces dentro del almacén municipal.
El grupo discute si se trata de supervivientes o una trampa.
Se oyen golpes metálicos, como si alguien buscara en contenedores.
Entrar ahora implicaría gastar energía y quizá munición.
Pero si esperamos, alguien más podría vaciarlo antes que nosotros.`,
    choices: [
      { text: "Entrar en formación y registrar", effect: { materials: +4, ammo: -2, threat: +2, advanceMs: 150000 } },
      { text: "Esperar y observar desde lejos", effect: { morale: -1, advanceMs: 120000 } },
      { text: "Marcar el lugar y retirarse", effect: { morale: +1, karma: +1, advanceMs: 60000 } },
    ],
  },

  {
    id: 202,
    title: "Pozo seco en el barrio viejo",
    text:
`El pozo comunitario apenas gotea y el barrio huele a polvo caliente.
Algunos sugieren cavar más profundo, otros prefieren moverse a otra zona.
El calor reduce la paciencia y la moral comienza a resentirse.
Se oyen pasos lejanos; puede haber grupos rivales merodeando.
Cada minuto sin agua complica el ánimo y la salud del campamento.`,
    choices: [
      { text: "Cavar más y reforzar la estructura", effect: { water: +3, materials: -2, advanceMs: 180000, threat: +1 } },
      { text: "Buscar otro punto de agua en mapa", effect: { water: +2, fuel: -1, advanceMs: 240000 } },
      { text: "Racionar estrictamente por hoy", effect: { water: -1, morale: -2, advanceMs: 60000 } },
    ],
  },

  {
    id: 203,
    title: "Forastero en la valla",
    text:
`Un desconocido golpea la valla pidiendo ayuda con voz quebrada.
Dice traer información sobre una ruta segura al sur.
Algunos lo ven como una trampa, otros como oportunidad.
Su brazo sangra, pero mantiene la mirada fija.
Aceptar o rechazarlo definirá la confianza del grupo.`,
    choices: [
      { text: "Dejarlo pasar y curarlo", effect: { medicine: -1, morale: +2, karma: +1, advanceMs: 120000 } },
      { text: "Darle agua y enviarlo lejos", effect: { water: -1, karma: 0, advanceMs: 60000 } },
      { text: "Negarle todo, priorizar seguridad", effect: { threat: -1, morale: -2, karma: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 204,
    title: "Gasolina en el estacionamiento subterráneo",
    text:
`Las sombras de un estacionamiento subterráneo esconden bidones rotulados.
El lugar huele a combustible y a metal oxidado.
Bajar implica ruido y posible derrumbe de escombros.
Con más combustible, ampliarían el rango de exploración.
Sin embargo, cualquier chispazo podría atraer a los hambrientos.`,
    choices: [
      { text: "Descender con cuerdas y recoger bidones", effect: { fuel: +4, materials: -1, threat: +2, advanceMs: 180000 } },
      { text: "Marcar la zona y volver en grupo grande", effect: { morale: +1, advanceMs: 120000 } },
      { text: "Ignorar: demasiado peligro por hoy", effect: { morale: -1, threat: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 205,
    title: "Herida infectada",
    text:
`Una herida descuidada de anoche huele mal y el dolor aumenta.
El herido tiembla y no puede sostener su arma con firmeza.
La discusión gira entre usar medicina cara o improvisar.
Dejarlo pasar puede costar caro en combate.
El grupo mira al botiquín con ansiedad y cálculo frío.`,
    choices: [
      { text: "Gastar medicina y desinfectar a fondo", effect: { medicine: -2, morale: +2, advanceMs: 90000 } },
      { text: "Curación improvisada con alcohol", effect: { water: -1, morale: +0, advanceMs: 60000 } },
      { text: "Ignorar y seguir", effect: { morale: -3, karma: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 206,
    title: "Grietas en la empalizada",
    text:
`El muro de tablas presenta grietas que dejan pasar el viento.
Al apoyarse, crujen como si fueran a ceder en cualquier momento.
La noche se acerca y las sombras se acumulan afuera.
Reforzar ahora consume materiales y tiempo crítico.
Dormir con esa debilidad puede ser una invitación al desastre.`,
    choices: [
      { text: "Refuerzos urgentes con lo que haya", effect: { materials: -3, threat: -2, advanceMs: 180000 } },
      { text: "Postergar y montar guardias dobles", effect: { morale: -1, advanceMs: 120000, threat: +1 } },
      { text: "Mover el campamento de sitio", effect: { fuel: -1, morale: -1, threat: -1, advanceMs: 240000 } },
    ],
  },

  {
    id: 207,
    title: "Ruidos en la escuela",
    text:
`Desde el edificio escolar llegan golpes rítmicos en las puertas.
Podría haber víveres atrapados en la cafetería.
La estructura suena hueca, como si algo arrastrara pupitres.
Entrar por la ventana requiere herramientas y valor.
Si hay sobrevivientes, podrían necesitar rescate inmediato.`,
    choices: [
      { text: "Forzar entrada y registrar", effect: { food: +3, materials: -1, zombies: 2, advanceMs: 150000 } },
      { text: "Hacer ruido y atraerlos afuera", effect: { ammo: -1, threat: +2, advanceMs: 120000 } },
      { text: "Marcar y seguir explorando otra zona", effect: { advanceMs: 60000 } },
    ],
  },

  {
    id: 208,
    title: "Mapa encontrado",
    text:
`En la guantera de un coche aparece un mapa detallado del distrito.
Se notan rutas secundarias, puestos de control y tachaduras recientes.
Podría abreviar futuras salidas pero quizá esté desactualizado.
Alguien tachó una calle con tinta roja y varios signos de peligro.
Decidir qué creer del papel puede ahorrar o costar vidas.`,
    choices: [
      { text: "Adoptar rutas secundarias del mapa", effect: { fuel: -1, advanceMs: 120000, threat: -1 } },
      { text: "Ignorar el mapa por dudoso", effect: { morale: -1, advanceMs: 30000 } },
      { text: "Cruzar por la calle tachada para verificar", effect: { ammo: -1, zombies: 3, advanceMs: 150000 } },
    ],
  },

  {
    id: 209,
    title: "Mercader ambulante",
    text:
`Un viejo con gabardina ofrece trueque al borde del camino.
Saca piezas de metal, municiones sueltas y una cantimplora a medias.
Dice que el norte está perdido pero más al sur hay refugio.
Habla sin mirar a los ojos, como escondiendo algo.
El trueque podría ser ventajoso, o un robo a mano abierta.`,
    choices: [
      { text: "Cambiar comida por munición", effect: { food: -2, ammo: +3, karma: 0, advanceMs: 60000 } },
      { text: "Comprar materiales baratos", effect: { materials: +3, fuel: -1, advanceMs: 60000 } },
      { text: "Rechazar y alejarse", effect: { morale: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 210,
    title: "Incendio en depósito de chatarra",
    text:
`Una columna de humo negro sube desde un depósito cercado.
El calor distorsiona el aire y el ruido atrae carroñeros.
Entre las chispas se ven piezas útiles para reparar cercas.
Aproximarse quema tiempo y quizá la piel.
Ignorarlo hoy podría dejar sin repuestos mañana.`,
    choices: [
      { text: "Entrar con mantas y cubos", effect: { materials: +4, water: -1, morale: +1, advanceMs: 180000 } },
      { text: "Barrer el perímetro por restos útiles", effect: { materials: +2, threat: +1, advanceMs: 120000 } },
      { text: "Evitar la zona incendiada", effect: { morale: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 211,
    title: "Grietas en la moral",
    text:
`Discusiones pequeñas crecen como fisuras en concreto cansado.
Algunos culpan a las últimas decisiones y otros a la mala suerte.
La radio rota impide escuchar voces que alivien el aislamiento.
Un descanso podría sanar, pero el reloj no se detiene.
Las miradas esquivas hieren más que el hambre.`,
    choices: [
      { text: "Asamblea con turno de palabra", effect: { morale: +2, advanceMs: 120000 } },
      { text: "Ejercicio y tareas compartidas", effect: { morale: +1, materials: -1, advanceMs: 90000 } },
      { text: "Ignorar tensiones y seguir", effect: { morale: -2, advanceMs: 30000 } },
    ],
  },

  {
    id: 212,
    title: "Niños en el supermercado",
    text:
`Desde un pasillo oscuro, pequeñas siluetas susurran y corren.
Alguien dejó dibujos de casas y perros pegados a una heladera.
El lugar conserva latas pero el suelo está cubierto de vidrios.
Los niños podría ser cebo o realmente estar solos.
Una elección mide humanidad y riesgo por igual.`,
    choices: [
      { text: "Buscar y escoltar a los niños", effect: { karma: +2, morale: +2, food: +2, advanceMs: 180000, zombies: 2 } },
      { text: "Dejar comida y un mensaje", effect: { food: -1, karma: +1, advanceMs: 90000 } },
      { text: "Retirada silenciosa", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },

  {
    id: 213,
    title: "Taller abandonado",
    text:
`Un taller mecánico tiene media persiana abierta y olor a aceite.
Sobre la mesa hay piezas numeradas y un manual engrasado.
Un ruido metálico hace eco desde el foso de inspección.
Con suerte podríamos armar defensas improvisadas.
Si algo vive ahí abajo, no le gustará la compañía.`,
    choices: [
      { text: "Registrar a fondo con linternas", effect: { materials: +3, zombies: 2, advanceMs: 150000 } },
      { text: "Tomar solo lo visible y salir", effect: { materials: +1, advanceMs: 60000 } },
      { text: "Cerrar y marcar para mañana", effect: { advanceMs: 30000 } },
    ],
  },

  {
    id: 214,
    title: "Camión varado",
    text:
`Un camión frigorífico bloquea media avenida y gotea líquido.
La cabina está cerrada y la caja golpea con el viento.
Dentro podrían quedar cajones de alimento frío en buen estado.
Abrir la caja puede atraer a media cuadra.
La tentación del botín compite con el miedo al estruendo.`,
    choices: [
      { text: "Abrir la caja y cargar lo posible", effect: { food: +4, threat: +2, advanceMs: 150000 } },
      { text: "Desengancharlo para liberar paso", effect: { materials: +1, fuel: -1, advanceMs: 120000 } },
      { text: "Evitarlo por completo", effect: { morale: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 215,
    title: "Radio de onda corta",
    text:
`La radio lanza un zumbido y luego voces entrecortadas.
Alguien coordina auxilios a varias cuadras de aquí.
La señal sube y baja como un pez bajo el agua.
Requiere batería que casi no nos queda.
Una respuesta a tiempo podría ganar aliados.`,
    choices: [
      { text: "Responder y arriesgar batería", effect: { fuel: -1, morale: +2, karma: +1, advanceMs: 90000 } },
      { text: "Escuchar sin hablar", effect: { advanceMs: 60000, threat: -1 } },
      { text: "Apagar para ahorrar energía", effect: { morale: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 216,
    title: "Discusión sobre liderazgo",
    text:
`Dos voces fuertes chocan en el centro del patio.
Una pide rotación del liderazgo, otra disciplina estricta.
Las tareas se frenan y los chicos miran con nerviosismo.
Decidir ahora ahorrará roces o los hará crecer.
La autoridad pesa más cuando la noche se acerca.`,
    choices: [
      { text: "Votar un liderazgo rotativo", effect: { morale: +2, karma: +1, advanceMs: 120000 } },
      { text: "Ratificar mando actual por hoy", effect: { morale: +0, threat: -1, advanceMs: 60000 } },
      { text: "Ignorar y seguir con tareas", effect: { morale: -2, advanceMs: 30000 } },
    ],
  },

  {
    id: 217,
    title: "Trampa con latas",
    text:
`Un callejón tiene un sistema rudimentario de latas y cuerdas.
Alguien avisa que podrían delatar nuestra posición al mínimo toque.
Colarse sin sonar exigiría tiempo y pulso firme.
Cortar las cuerdas puede liberar otro mecanismo oculto.
La calle principal ofrece un desvío más largo.`,
    choices: [
      { text: "Desarmar con cuidado", effect: { advanceMs: 150000, threat: -1, materials: +1 } },
      { text: "Forzar el paso y correr", effect: { advanceMs: 60000, threat: +2, zombies: 2 } },
      { text: "Tomar el desvío largo", effect: { fuel: -1, advanceMs: 180000 } },
    ],
  },

  {
    id: 218,
    title: "Almacén de granos",
    text:
`Sacos de granos apilados se ven desde una puerta entornada.
El olor es fuerte, pero parecen secos y aprovechables.
Ratas corretean y se meten por agujeros en la madera.
Cargar sacos exige fuerza y tiempo constante.
Con reserva de alimento, el ánimo sube aunque cueste sudor.`,
    choices: [
      { text: "Cargar sacos entre todos", effect: { food: +5, advanceMs: 240000, morale: +1 } },
      { text: "Tomar muestras y volver luego", effect: { food: +2, advanceMs: 90000 } },
      { text: "Sellar y poner trampas", effect: { materials: -1, food: +1, advanceMs: 120000 } },
    ],
  },

  {
    id: 219,
    title: "Cortocircuito nocturno",
    text:
`Un brillo azul y un chasquido despiertan a varios.
El generador improvisado chisporrotea con olor a plástico.
Mantener luz disuade a curiosos, pero podría atraer a otros.
Reparar requiere piezas y manos firmes.
Dormir sin luz apaga más que una bombilla.`,
    choices: [
      { text: "Apagar, reparar y reencender", effect: { materials: -2, morale: +1, advanceMs: 120000 } },
      { text: "Dejar apagado hasta mañana", effect: { morale: -1, threat: -1, advanceMs: 60000 } },
      { text: "Subir potencia y rezar", effect: { threat: +2, morale: +1, advanceMs: 30000 } },
    ],
  },

  {
    id: 220,
    title: "Puente inestable",
    text:
`El único paso sobre el canal parece un esqueleto de hierro.
Plancharlo hoy abre rutas a despensas del otro lado.
Cruzarlo tal cual suena a temeridad con botas mojadas.
Dar la vuelta implica horas y consumo de combustible.
La elección hoy dibuja el mapa de mañana.`,
    choices: [
      { text: "Reforzar y cruzar", effect: { materials: -3, threat: -1, advanceMs: 180000 } },
      { text: "Cruzarlo rápido tal cual", effect: { advanceMs: 60000, morale: -1, zombies: 2 } },
      { text: "Rodeo largo por carretera", effect: { fuel: -1, advanceMs: 240000 } },
    ],
  },

  {
    id: 221,
    title: "Desalojo de nido",
    text:
`Un sótano guarda colchones viejos y latas polvorientas.
Los gemidos desde el fondo indican que no estamos solos.
Desalojar hoy libera un punto de descanso para futuras noches.
El ruido podría llamar a más invitados indeseables.
La valentía también se entrena con práctica.`,
    choices: [
      { text: "Limpiar el sótano a golpes", effect: { zombies: 3, food: +1, materials: +1, advanceMs: 150000 } },
      { text: "Sellar la entrada y marchar", effect: { materials: -1, threat: -1, advanceMs: 60000 } },
      { text: "Colocar un cebo y alejar", effect: { ammo: -1, threat: -2, advanceMs: 90000 } },
    ],
  },

  {
    id: 222,
    title: "Cosecha en azoteas",
    text:
`Macetas con tierra húmeda prometen tomates verdes y hierbas.
Hay cuerdas de tender y un tanque partido al borde.
Recolectar ahora da poco, pero abre rutina saludable.
Caerse sería absurdo y fatal a la vez.
El cielo gris amenaza lluvia que arruina las hojas.`,
    choices: [
      { text: "Cosechar y replantar", effect: { food: +2, water: -1, advanceMs: 150000 } },
      { text: "Instalar riego casero", effect: { materials: -2, water: -1, morale: +1, advanceMs: 180000 } },
      { text: "Bajar y dejarlo crecer", effect: { morale: +0, advanceMs: 60000 } },
    ],
  },

  {
    id: 223,
    title: "Perros hambrientos",
    text:
`Tres perros deambulan y gruñen con costillas marcadas.
Beben charcos y huelen bolsas buscando cualquier resto.
Podrían alertar de intrusos o convertirse en amenaza.
Domesticar lleva tiempo, disparar es rápido y crudo.
Nadie quiere otra noche de ladridos a la luna.`,
    choices: [
      { text: "Alimentar y ganar confianza", effect: { food: -2, morale: +1, karma: +1, advanceMs: 120000 } },
      { text: "Ahuyentarlos con ruido", effect: { ammo: -1, threat: -1, advanceMs: 60000 } },
      { text: "Ignorarlos y seguir", effect: { threat: +1, advanceMs: 30000 } },
    ],
  },

  {
    id: 224,
    title: "Relato de un anciano",
    text:
`Un anciano narra entre dientes un brote peor en el oeste.
Dice conocer un túnel que bordea puestos de saqueadores.
Su voz tiembla, pero los ojos sostienen un mapa mental.
Escucharlo quita tiempo de búsqueda inmediata.
Creer o no creer es la consigna diaria.`,
    choices: [
      { text: "Seguir su ruta sugerida", effect: { threat: -1, fuel: -1, advanceMs: 150000 } },
      { text: "Agradecer y seguir plan propio", effect: { morale: +0, advanceMs: 60000 } },
      { text: "Desconfiar y reforzar guardia", effect: { threat: -1, materials: -1, advanceMs: 90000 } },
    ],
  },

  {
    id: 225,
    title: "Bodega sellada",
    text:
`Una puerta metálica recién soldada oculta un sótano intacto.
El olor a vino viejo se mezcla con tierra fría.
Se escuchan ecos lejanos como de tuberías.
Abrir consume herramientas y puede romper el silencio.
Lo que guarda podría cambiar el menú de una semana.`,
    choices: [
      { text: "Cortar la soldadura y abrir", effect: { materials: -2, food: +3, water: +1, advanceMs: 180000, threat: +1 } },
      { text: "Marcar y volver con más manos", effect: { advanceMs: 90000 } },
      { text: "Dejarlo: suena a trampa", effect: { morale: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 226,
    title: "Atajo por cloacas",
    text:
`La tapa cede y un aire agrio sube como un golpe.
Atravesar túneles ahorra combustible y evita patrullas.
La humedad cala huesos y apaga linternas baratas.
Un mapa a tiza marca cruces y entradas.
A veces lo más corto no es lo más amable.`,
    choices: [
      { text: "Bajar y avanzar por el túnel", effect: { fuel: +0, water: -1, morale: -1, advanceMs: 180000, threat: -1 } },
      { text: "Sellar y tomar superficie", effect: { fuel: -1, advanceMs: 120000 } },
      { text: "Explorar un tramo y volver", effect: { advanceMs: 90000, materials: +1 } },
    ],
  },

  {
    id: 227,
    title: "Rumor de convoy",
    text:
`Se difunde que un convoy cruzará la avenida principal.
Algunos piden asomarse y pedir ayuda en persona.
Otros temen que sean carroñeros armados con uniforme robado.
La ansiedad compite con el pragmatismo de seguir vivos.
Una decisión ahora evita arrepentimientos más tarde.`,
    choices: [
      { text: "Montar señal y esperar", effect: { materials: -1, morale: +1, advanceMs: 150000 } },
      { text: "Observar desde distancia", effect: { advanceMs: 120000, threat: -1 } },
      { text: "Ignorar y continuar búsqueda", effect: { advanceMs: 60000 } },
    ],
  },

  {
    id: 228,
    title: "Discusión por raciones",
    text:
`El reparto de latas saca lo peor y lo mejor de cada uno.
Una mano toma de más, otra se queda corta por vergüenza.
Intervenir desgasta, mirar duele.
La mesa de madera cruje bajo golpes y culpas.
La convivencia es un arte en la escasez.`,
    choices: [
      { text: "Recalcular y repartir equitativo", effect: { morale: +2, food: -1, advanceMs: 120000 } },
      { text: "Sanción y trabajo extra al abusivo", effect: { morale: -1, karma: +1, advanceMs: 90000 } },
      { text: "Mirar a otro lado", effect: { morale: -2, advanceMs: 30000 } },
    ],
  },

  {
    id: 229,
    title: "Señales en la autopista",
    text:
`Pintadas recientes advierten de trampas en la salida 7B.
El olor a caucho quemado persiste en el aire.
La autopista ofrece velocidad pero pocas escapatorias.
Una vía de servicio serpentea entre talleres.
La decisión escribe la crónica de esta jornada.`,
    choices: [
      { text: "Arriesgar la autopista directa", effect: { fuel: -1, advanceMs: 90000, zombies: 2 } },
      { text: "Usar la vía de servicio", effect: { fuel: -1, advanceMs: 150000, threat: -1 } },
      { text: "Dar media vuelta", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },

  {
    id: 230,
    title: "Caja con símbolos",
    text:
`Una caja metálica luce símbolos pintados a mano.
No hay cerradura, solo un pasador oxidado y cinta.
Pesa más de lo que aparenta cuando la levantan.
Abrir podría ser ruido y sorpresa a la vez.
La curiosidad y el miedo juegan a cara o cruz.`,
    choices: [
      { text: "Abrirla aquí mismo", effect: { ammo: +2, medicine: +1, threat: +1, advanceMs: 60000 } },
      { text: "Llevarla al campamento", effect: { materials: -1, advanceMs: 120000 } },
      { text: "Dejarla como está", effect: { advanceMs: 30000, morale: -1 } },
    ],
  },

  {
    id: 231,
    title: "Humo en el horizonte",
    text:
`Una columna gris marca una zona con actividad reciente.
Podrían ser hogueras de otros grupos o incendios de neumáticos.
Acercarse abre puertas y disparos por igual.
Alejarse garantiza vivir con dudas.
A veces lo desconocido pesa más que el hambre.`,
    choices: [
      { text: "Acercarse en sigilo", effect: { threat: +1, advanceMs: 150000 } },
      { text: "Rodear marcando puntos de escape", effect: { fuel: -1, materials: -1, advanceMs: 180000, threat: -1 } },
      { text: "Retirada planificada", effect: { advanceMs: 60000, morale: -1 } },
    ],
  },

  {
    id: 232,
    title: "Hallazgo de pozo químico",
    text:
`Un charco iridiscente refleja cielos enfermos.
Huele a solvente y quemadura de garganta.
Podría contaminar el terreno si se desborda.
Sellarlo hoy evita males futuros y ganará respeto.
Pasar de largo es más fácil y más corto.`,
    choices: [
      { text: "Contener con sacos y tierra", effect: { materials: -2, morale: +1, karma: +1, advanceMs: 150000 } },
      { text: "Señalizar y avisar por radio", effect: { fuel: -1, advanceMs: 90000 } },
      { text: "Ignorar y seguir", effect: { karma: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 233,
    title: "Refugiados en túnel",
    text:
`Voces apagadas piden ayuda desde la boca del túnel.
Dicen huir de un ataque en la estación cercana.
Están asustados y no confían en cualquiera.
Guiarlos consume tiempo y recursos, pero salva vidas.
A veces sumarse resta velocidad y suma humanidad.`,
    choices: [
      { text: "Acompañarlos hasta cruce seguro", effect: { water: -1, food: -1, morale: +2, karma: +2, advanceMs: 180000 } },
      { text: "Dejarles un mapa y agua", effect: { water: -1, karma: +1, advanceMs: 90000 } },
      { text: "Negarse y cerrar el túnel", effect: { morale: -2, karma: -1, advanceMs: 60000 } },
    ],
  },

  {
    id: 234,
    title: "Armería saqueada",
    text:
`La armería del barrio aparece con rejas arrancadas.
El suelo cruje con casquillos y vitrinas rotas.
Aún quedan cajas cerradas marcadas con números.
Rebuscar aquí podría equilibrar enfrentamientos futuros.
Si nos pillan dentro, el eco llamará a todos.`,
    choices: [
      { text: "Forzar cajas y equipar", effect: { ammo: +4, threat: +2, advanceMs: 150000 } },
      { text: "Tomar solo munición suelta", effect: { ammo: +2, advanceMs: 90000 } },
      { text: "Salir y no tentar suerte", effect: { morale: -1, advanceMs: 30000 } },
    ],
  },

  {
    id: 235,
    title: "Tanque de agua en azotea",
    text:
`Un tanque resquebrajado filtra a través de una grieta.
Con un parche, podría rendir varios días más.
Subir herramientas pesa en la espalda y en el reloj.
El barrio mira en silencio cada gota que cae.
Una decisión técnica con impacto humano inmediato.`,
    choices: [
      { text: "Parchear con resina y cinta", effect: { materials: -2, water: +3, advanceMs: 150000 } },
      { text: "Sifonear lo que quede", effect: { water: +2, advanceMs: 90000 } },
      { text: "Dejarlo, buscar otra fuente", effect: { advanceMs: 60000, threat: +1 } },
    ],
  },

  {
    id: 236,
    title: "Callejón con ecos",
    text:
`Un eco repetido devuelve cada paso con burla metálica.
La pared muestra marcas de garras viejas y nuevas.
Un tablero caído deja ver un acceso lateral.
Entrar podría evitar un control más adelante.
A veces la salida es por un agujero en la pared.`,
    choices: [
      { text: "Entrar por la abertura", effect: { zombies: 2, materials: +1, advanceMs: 120000 } },
      { text: "Pasar de largo pero atentos", effect: { threat: -1, advanceMs: 60000 } },
      { text: "Sellar el acceso con clavos", effect: { materials: -1, advanceMs: 90000 } },
    ],
  },

  {
    id: 237,
    title: "Descompostura del vehículo",
    text:
`El motor tose y muere a mitad de una calle silenciosa.
Bajo el capó, una correa gastada pide jubilación.
Arreglar aquí expone el lomo y las espaldas.
Empujar hasta un taller consume piernas y paciencia.
Sin movilidad, el mapa se hace más pequeño.`,
    choices: [
      { text: "Arreglar en sitio", effect: { materials: -2, fuel: -1, advanceMs: 150000, threat: +1 } },
      { text: "Empujar hasta el taller", effect: { morale: -1, advanceMs: 180000 } },
      { text: "Abandonarlo por hoy", effect: { fuel: -1, morale: -1, advanceMs: 60000 } },
    ],
  },

  {
    id: 238,
    title: "Señales de caza",
    text:
`Un ciervo cruza a lo lejos entre malezas altas.
Las latas de comida se agotan y el estómago cruje.
Cazar implica ruido y tiempo de espera.
Si sale bien, habrá carne; si sale mal, caminaremos más.
La naturaleza aún ofrece opciones caras de pagar.`,
    choices: [
      { text: "Cazar con sigilo", effect: { food: +3, ammo: -1, advanceMs: 180000 } },
      { text: "Tender trampas simples", effect: { materials: -1, food: +1, advanceMs: 150000 } },
      { text: "Seguir sin cazar", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },

  {
    id: 239,
    title: "Vecina paranoica",
    text:
`Una mujer agita un cuchillo desde una ventana con cortinas.
Dice que todos mienten y que el agua está envenenada.
El miedo contagia más rápido que una fiebre.
Con calma quizá comparta información útil.
Con gritos, todo se vuelve ruido y peligro.`,
    choices: [
      { text: "Hablar con paciencia y dejar víveres", effect: { food: -1, water: -1, karma: +1, morale: +1, advanceMs: 120000 } },
      { text: "Desarmarla y registrar la casa", effect: { materials: +1, threat: +2, advanceMs: 90000 } },
      { text: "Marcharse sin mirar atrás", effect: { advanceMs: 60000 } },
    ],
  },

  {
    id: 240,
    title: "Pasillo inundado",
    text:
`El edificio inunda su pasillo con agua turbia y fría.
Flotan papeles, botellas y un osito con una oreja rota.
Para cruzar hay que mojar botas y moral.
Dar la vuelta suma tiempo que duele al reloj.
A veces el camino correcto está bajo el agua.`,
    choices: [
      { text: "Cruzar a pie y rápido", effect: { water: +0, morale: -1, advanceMs: 60000 } },
      { text: "Buscar tablones y pasar en seco", effect: { materials: -1, advanceMs: 120000 } },
      { text: "Rodear por la calle lateral", effect: { fuel: -1, advanceMs: 150000 } },
    ],
  },

  {
    id: 241,
    title: "Puerta con rezos",
    text:
`Detrás de una puerta, voces rezan en susurros acompasados.
Golpear podría espantar o abrir esperanzas.
Tal vez tengan comida, tal vez solo miedo compartido.
Forzar genera ruido que rebota en el pasillo.
La fe también pide pan y agua.`,
    choices: [
      { text: "Pedir paso y ofrecer intercambio", effect: { food: -1, water: -1, morale: +1, karma: +1, advanceMs: 120000 } },
      { text: "Forzar la puerta con palanca", effect: { materials: -1, threat: +2, zombies: 2, advanceMs: 90000 } },
      { text: "Dejarles una nota y seguir", effect: { karma: +1, advanceMs: 60000 } },
    ],
  },

  {
    id: 242,
    title: "Alarma de auto",
    text:
`Un auto comienza a aullar con luces intermitentes.
La calle despierta y con ella los que rondan.
Apagarla requiere abrir y desconectar cables.
Dejarla suelta llama problemas por minutos valiosos.
Cada segundo suena como una sirena de guerra.`,
    choices: [
      { text: "Abrir y desconectar", effect: { materials: -1, threat: -2, advanceMs: 60000 } },
      { text: "Empujarla al río", effect: { threat: -1, fuel: -1, advanceMs: 120000 } },
      { text: "Huir del ruido", effect: { threat: +1, advanceMs: 30000 } },
    ],
  },

  {
    id: 243,
    title: "Guardia dormido",
    text:
`El turno de guardia termina con un ronquido confesado.
Las ojeras pesan más que el casco en la frente.
Castigar endurece, comprender construye.
La noche que viene pondrá a prueba la decisión.
El descanso también es un recurso finito.`,
    choices: [
      { text: "Sanción leve y café extra", effect: { morale: -1, water: -1, advanceMs: 60000 } },
      { text: "Rotar turnos y charla honesta", effect: { morale: +1, advanceMs: 120000 } },
      { text: "Ignorar y seguir", effect: { threat: +1, advanceMs: 30000 } },
    ],
  },

  {
    id: 244,
    title: "Cadenas en el portón",
    text:
`El portón principal cruje con cadenas añadidas a la noche.
Sin la llave, cortar toma tiempo y metal.
Un acceso trasero existe, pero pasa junto a un basural.
Quedarse encerrados aprieta el pecho y la agenda.
La salida de hoy decide la entrada de mañana.`,
    choices: [
      { text: "Cortar cadenas con sierras", effect: { materials: -2, advanceMs: 150000, threat: +1 } },
      { text: "Usar el acceso trasero", effect: { advanceMs: 120000, zombies: 2 } },
      { text: "Esperar a primera luz", effect: { morale: +1, advanceMs: 180000, threat: -1 } },
    ],
  },

  {
    id: 245,
    title: "La promesa del sur",
    text:
`Un mensajero insiste en que al sur hay un corredor seguro.
El mapa marca un tramo abierto pero vigilado.
Partir ahora gasta combustible y coraje en cuotas grandes.
Quedarse implica reforzar para otra noche más.
La esperanza no alimenta, pero camina rápido.`,
    choices: [
      { text: "Iniciar marcha al sur", effect: { fuel: -2, morale: +2, threat: -1, advanceMs: 240000 } },
      { text: "Preparar salida para mañana", effect: { materials: -1, morale: +1, advanceMs: 120000 } },
      { text: "Descartar el plan", effect: { morale: -2, karma: -1, advanceMs: 60000 } },
    ],
  },
];

