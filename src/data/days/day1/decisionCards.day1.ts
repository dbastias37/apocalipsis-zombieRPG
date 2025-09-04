import { DecisionCard } from "../../decisionCards";

export const day1DecisionCards: DecisionCard[] = [
  {
    id: 201,
    title: "Luces en el almacén municipal",
    text: `Al caer la tarde, a lo lejos parpadean luces dentro del almacén municipal.
El grupo discute si se trata de supervivientes o una trampa.
Se oyen golpes metálicos, como si alguien buscara en contenedores.
Entrar ahora implicaría gastar energía y quizá munición.
Pero si esperamos, alguien más podría vaciarlo antes que nosotros.`,
    choices: [
      { text: "Entrar en formación y registrar", effect: { materials: 4, ammo: -2, threat: 2, advanceMs: 150000 } },
      { text: "Esperar y observar desde lejos", effect: { morale: -1, advanceMs: 120000 } },
      { text: "Marcar el lugar y retirarse", effect: { morale: 1, karma: 1, advanceMs: 60000 } },
    ],
  },
  {
    id: 202,
    title: "Rastro de humo en la autopista",
    text: `Un hilo de humo negro se eleva tras los coches volcados de la autopista.
Podría tratarse de una fogata improvisada por otros supervivientes.
También podría ser una señal para atraer curiosos y emboscarlos.
La zona abierta expone al grupo a los francotiradores y a las hordas.
Decidir acercarse o evitar el área consume un tiempo precioso.`,
    choices: [
      { text: "Avanzar investigando con cautela", effect: { threat: 2, fuel: -1, advanceMs: 120000 } },
      { text: "Rodear por el viejo túnel", effect: { fuel: -2, morale: 1, advanceMs: 180000 } },
      { text: "Ignorar el humo y seguir", effect: { morale: -1, karma: 1, advanceMs: 90000 } },
    ],
  },
  {
    id: 203,
    title: "Ofertas de un mercader solitario",
    text: `Un hombre armado con chaleco improvisado ofrece trueques desde una furgoneta.
Tiene cajas con medicinas, munición y herramientas envueltas en tela.
Dice que la carretera será cerrada por una horda en pocas horas.
Sus ojos nerviosos no inspiran demasiada confianza al grupo.
Negociar con él podría ahorrarnos días o costarnos la vida.`,
    choices: [
      { text: "Comprar medicinas con munición", effect: { medicine: 3, ammo: -5, morale: 2, advanceMs: 60000 } },
      { text: "Intercambiar trabajo por recursos", effect: { food: 2, water: 2, morale: 1, advanceMs: 120000 } },
      { text: "Rechazar la oferta y alejarse", effect: { threat: -1, karma: 1, advanceMs: 30000 } },
    ],
  },
  {
    id: 204,
    title: "Puente de cuerdas sobre el río",
    text: `Un viejo puente de cuerdas balancea sobre el agua turbia y ruidosa.
Del otro lado hay un edificio que parece intacto y sin saquear.
La estructura cruje con cada ráfaga de viento que atraviesa el cañón.
Cruzarlo con todo el equipo podría terminar en una caída mortal.
Buscar otra ruta implica retroceder varios kilómetros y perder tiempo.`,
    choices: [
      { text: "Cruzarlo de uno en uno", effect: { materials: 1, threat: 1, advanceMs: 90000 } },
      { text: "Reforzarlo con cuerdas extra", effect: { materials: -3, advanceMs: 150000 } },
      { text: "Dar media vuelta y rodear", effect: { fuel: -1, morale: -1, advanceMs: 210000 } },
    ],
  },
  {
    id: 205,
    title: "Refugio con normas estrictas",
    text: `Una comunidad fortificada permite el acceso solo con reglas claras.
Piden entregar munición y prometer silencio total durante la noche.
Algunos miembros del grupo desconfían de los ojos vigilantes en la muralla.
El refugio promete comida caliente y literas limpias para descansar.
Aceptar o rechazar la invitación podría dividir al grupo.`,
    choices: [
      { text: "Aceptar y entregar munición", effect: { ammo: -5, morale: 2, advanceMs: 120000 } },
      { text: "Negociar otra forma de pago", effect: { materials: -3, morale: 1, karma: 2, advanceMs: 180000 } },
      { text: "Rechazar y seguir viaje", effect: { morale: -2, advanceMs: 60000 } },
    ],
  },
  {
    id: 206,
    title: "Camión frigorífico abandonado",
    text: `Un camión frigorífico bloquea la calle con su puerta trasera cerrada.
El generador aún zumba y desprende vapor blanco por un tubo roto.
Dentro podrían quedar carnes congeladas o algo mucho peor.
El olor dulce que se filtra despierta el apetito y la sospecha.
Abrirlo podría atraer a toda criatura hambrienta de la zona.`,
    choices: [
      { text: "Forzar la puerta y registrar", effect: { food: 5, zombies: 2, fuel: -1, advanceMs: 120000 } },
      { text: "Apagar el generador y sellar", effect: { fuel: 2, morale: 1, advanceMs: 60000 } },
      { text: "Ignorarlo y avanzar", effect: { threat: -1, advanceMs: 30000 } },
    ],
  },
  {
    id: 207,
    title: "Niños perdidos en el parque",
    text: `Entre los columpios oxidados se escuchan risas apagadas y pasos ligeros.
Dos figuras pequeñas corren entre los arbustos llevando mochilas ajenas.
Podrían ser niños que sobrevivieron solos o un señuelo para asaltantes.
El parque abierto deja al grupo expuesto desde todos los ángulos.
Decidir ayudarlos o dejarlos puede marcar nuestra moral para siempre.`,
    choices: [
      { text: "Llamar y ofrecer comida", effect: { food: -2, morale: 3, karma: 3, advanceMs: 90000 } },
      { text: "Perseguirlos con armas", effect: { threat: 2, ammo: -1, morale: -2, advanceMs: 60000 } },
      { text: "Retirarse sin intervenir", effect: { morale: -1, advanceMs: 30000 } },
    ],
  },
  {
    id: 208,
    title: "Gasolinera cubierta de grafitis",
    text: `Una gasolinera en ruinas muestra grafitis que advierten de peligro inminente.
La tienda anexa tiene la persiana medio rota y huellas recientes de botas.
El surtidor parece intacto pero la alarma podría seguir conectada.
Quedarse demasiado tiempo aquí puede llamar a merodeadores o zombis.
Sin combustible no llegaremos a la ciudad antes de anochecer.`,
    choices: [
      { text: "Sifonear combustible rápido", effect: { fuel: 3, threat: 2, advanceMs: 90000 } },
      { text: "Buscar comida dentro de la tienda", effect: { food: 2, water: 1, zombies: 1, advanceMs: 120000 } },
      { text: "Dejar una marca y seguir", effect: { karma: 1, morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 209,
    title: "Campamento improvisado bajo el puente",
    text: `Debajo del puente se acumulan mantas viejas, latas y un fuego apagado.
Alguien estuvo aquí hasta hace poco, quizá aún siga cerca observando.
Los pilares del puente ofrecen cierta cobertura pero limitan la vista.
Examinar los restos puede revelar pistas de otros grupos errantes.
No detenerse significa perder posibles suministros escondidos.`,
    choices: [
      { text: "Registrar entre las mantas", effect: { materials: 2, food: 1, advanceMs: 60000 } },
      { text: "Esperar al dueño para hablar", effect: { morale: 1, threat: 1, advanceMs: 150000 } },
      { text: "Continuar la marcha sin mirar", effect: { morale: -1, advanceMs: 30000 } },
    ],
  },
  {
    id: 210,
    title: "Patrulla militar caída",
    text: `Un vehículo militar volcado bloquea parte de la avenida principal.
Los cuerpos con uniformes indican que la patrulla fue atacada por sorpresa.
Las cajas de suministros están cerradas con cadenas resistentes.
Tal vez haya un mapa o un transmisor útil entre los restos.
Manipular el vehículo podría atraer atención desde las azoteas cercanas.`,
    choices: [
      { text: "Forzar cajas de suministros", effect: { ammo: 6, medicine: 2, zombies: 1, advanceMs: 120000 } },
      { text: "Buscar documentos rápidos", effect: { materials: 1, morale: 1, advanceMs: 60000 } },
      { text: "Desviar el camino sin tocar nada", effect: { threat: -1, advanceMs: 30000 } },
    ],
  },
  {
    id: 211,
    title: "Cultivo clandestino en azotea",
    text: `Subiendo a un edificio encontramos una azotea con plantas en macetas.
Un joven delgado vigila con un rifle y pide trueque por verduras frescas.
Dice que los vecinos quieren echarlo para quedarse con la producción.
El lugar tiene agua recolectada y un pequeño gallinero improvisado.
Negociar, robar o marcharnos define nuestra reputación en la zona.`,
    choices: [
      { text: "Trueque justo por verduras", effect: { food: 4, water: -2, morale: 1, advanceMs: 90000 } },
      { text: "Amenazar y tomar todo", effect: { food: 6, morale: -4, karma: -5, zombies: 1, advanceMs: 60000 } },
      { text: "Desearle suerte y partir", effect: { karma: 2, advanceMs: 30000 } },
    ],
  },
  {
    id: 212,
    title: "Museo convertido en guarida",
    text: `Las puertas de cristal del museo están cubiertas con tablones viejos.
Dentro se oyen pasos apresurados y murmullos tras las vitrinas oscuras.
Quizá refugiados ocupen las salas usando las obras como barricadas.
El sótano podría esconder generadores y depósitos de agua limpia.
Entrar por la fuerza podría destruir patrimonio y encender hostilidad.`,
    choices: [
      { text: "Entrar negociando", effect: { water: 2, morale: 2, advanceMs: 90000 } },
      { text: "Buscar una entrada trasera", effect: { materials: -2, threat: 1, advanceMs: 120000 } },
      { text: "Evitar el museo", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 213,
    title: "Rituales en la iglesia abandonada",
    text: `La vieja iglesia tiene velas encendidas y símbolos pintados con sangre.
Un grupo de fieles susurra plegarias alrededor del altar principal.
Al vernos, el líder pide comida a cambio de bendiciones y protección.
Algunos miembros parecen enfermos y se balancean al ritmo de la oración.
Aceptar el trato puede unirnos o atraer a fanáticos peligrosos.`,
    choices: [
      { text: "Compartir comida y quedarse", effect: { food: -3, morale: 2, karma: 2, advanceMs: 150000 } },
      { text: "Registrarlo todo en secreto", effect: { medicine: 1, materials: 1, morale: -2, advanceMs: 90000 } },
      { text: "Irse antes de llamar la atención", effect: { threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 214,
    title: "Silo de granos con guardias",
    text: `Un silo intacto domina el horizonte con su estructura metálica.
Dos guardias con escopetas vigilan la entrada y exigen contraseñas.
Rumores dicen que almacenan grano suficiente para un mes de viaje.
Las escaleras laterales permiten un acceso arriesgado por la parte superior.
Resolver esto determina si tendremos pan o enemigos mañana.`,
    choices: [
      { text: "Pagar con combustible", effect: { fuel: -3, food: 5, morale: 1, advanceMs: 90000 } },
      { text: "Escalar durante la noche", effect: { food: 4, threat: 2, zombies: 1, advanceMs: 150000 } },
      { text: "Abandonar el silo", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 215,
    title: "Mensaje en la radio pirata",
    text: `Un transmisor improvisado emite una voz pidiendo auxilio en canal abierto.
La señal proviene de un barrio plagado de edificios derrumbados.
Podría ser una trampa para saqueadores o una persona desesperada.
Nuestro equipo de radio necesita energía extra para triangular la fuente.
Acudir o no podría marcar la diferencia en nuestra humanidad.`,
    choices: [
      { text: "Seguir la señal de inmediato", effect: { fuel: -2, threat: 2, morale: 1, advanceMs: 120000 } },
      { text: "Enviar una respuesta breve", effect: { fuel: -1, karma: 1, advanceMs: 60000 } },
      { text: "Ignorar la transmisión", effect: { morale: -2, advanceMs: 30000 } },
    ],
  },
  {
    id: 216,
    title: "Cadáver atado con nota",
    text: `En medio de la calle hay un cadáver atado con cuerdas y un cartel.
La nota advierte que cualquiera que robe el barrio será cazado.
Las casas cercanas tienen puertas reforzadas con láminas metálicas.
Tal vez sea una táctica de miedo de los residentes aún vivos.
Decidir si registrar o respetar el aviso afecta a la reputación.`,
    choices: [
      { text: "Registrar una casa de todos modos", effect: { materials: 3, morale: -3, karma: -2, advanceMs: 90000 } },
      { text: "Dejar una ofrenda de respeto", effect: { food: -1, morale: 2, karma: 3, advanceMs: 60000 } },
      { text: "Retirarse sin tocar nada", effect: { threat: -1, advanceMs: 30000 } },
    ],
  },
  {
    id: 217,
    title: "Tienda de mascotas saqueada",
    text: `Gaviotas y ratas pelean por restos frente a una tienda destrozada.
Dentro aún hay sacos de alimento y jaulas con agua turbia.
Un cachorro asustado gime desde un rincón oscuro entre los vidrios.
Algunos piensan que llevarlo podría animar al campamento.
Otros creen que solo será una boca más que alimentar.`,
    choices: [
      { text: "Rescatar al cachorro", effect: { food: -1, morale: 3, karma: 2, advanceMs: 90000 } },
      { text: "Tomar pienso para nosotros", effect: { food: 2, water: 1, advanceMs: 60000 } },
      { text: "Cerrar la puerta y seguir", effect: { morale: -1, advanceMs: 30000 } },
    ],
  },
  {
    id: 218,
    title: "Carretera con barricada civil",
    text: `Una barricada con coches y muebles impide el paso en la carretera.
Un cartel pintado dice que la entrada está restringida a conocidos.
Oímos voces detrás de la defensa discutiendo sobre abrir fuego.
El desvío más cercano nos retrasaría varias horas de viaje.
Romper la barricada podría enfrentarnos a civiles asustados.`,
    choices: [
      { text: "Intentar negociar el paso", effect: { morale: 1, threat: 1, advanceMs: 90000 } },
      { text: "Forzar la barricada", effect: { materials: -2, ammo: -3, morale: -2, advanceMs: 60000 } },
      { text: "Tomar el desvío largo", effect: { fuel: -3, advanceMs: 180000 } },
    ],
  },
  {
    id: 219,
    title: "Viejo cine con proyector activo",
    text: `Las luces de un proyector parpadean dentro de un cine en ruinas.
Películas sin sonido se proyectan sobre una pantalla rasgada y sucia.
Podría haber gente usando la luz para atraer o distraer a alguien.
El olor a palomitas rancias aún flota entre las butacas rotas.
Revisar las cabinas podría darnos piezas electrónicas útiles.`,
    choices: [
      { text: "Buscar piezas del proyector", effect: { materials: 2, fuel: 1, advanceMs: 90000 } },
      { text: "Ver la película unos minutos", effect: { morale: 2, threat: 1, advanceMs: 120000 } },
      { text: "Apagar todo y salir", effect: { threat: -2, advanceMs: 60000 } },
    ],
  },
  {
    id: 220,
    title: "Escombros con voces atrapadas",
    text: `Entre los escombros de un edificio derrumbado se escuchan gemidos.
Tal vez haya alguien vivo bajo las placas de hormigón y hierro.
Mover piedras requiere tiempo y herramientas que apenas tenemos.
Ignorar los sonidos podría condenar a una persona a morir lentamente.
El grupo debate si arriesgarse o priorizar su propia seguridad.`,
    choices: [
      { text: "Excavar y rescatar", effect: { materials: -2, morale: 3, karma: 4, advanceMs: 180000 } },
      { text: "Dejar agua y marcharse", effect: { water: -1, morale: 1, advanceMs: 60000 } },
      { text: "Seguir sin mirar atrás", effect: { morale: -2, advanceMs: 30000 } },
    ],
  },
  {
    id: 221,
    title: "Apartamento con música antigua",
    text: `Un viejo tocadiscos suena desde un apartamento del segundo piso.
La puerta principal está entreabierta y huele a polvo y moho.
Sobre la mesa hay notas que mencionan un búnker cercano.
Los cristales rotos indican que alguien salió con prisa hace poco.
Dentro podría haber mapas y latas o una trampa armada.`,
    choices: [
      { text: "Registrar todas las habitaciones", effect: { food: 2, water: 1, zombies: 1, advanceMs: 90000 } },
      { text: "Tomar solo el mapa y salir", effect: { materials: 1, morale: 1, advanceMs: 60000 } },
      { text: "Apagar el tocadiscos y retirarse", effect: { threat: -1, advanceMs: 30000 } },
    ],
  },
  {
    id: 222,
    title: "Autobús escolar volcado",
    text: `Un autobús escolar yace de costado en medio de la carretera.
En su interior aún cuelgan mochilas pequeñas y libros de texto.
La guantera está cerrada con llave y huele a combustible derramado.
Las ruedas todavía podrían servir como repuestos para nuestro vehículo.
El silencio alrededor es inquietante y tenso.`,
    choices: [
      { text: "Buscar útiles entre las mochilas", effect: { food: 1, water: 1, morale: -1, advanceMs: 90000 } },
      { text: "Quitar una rueda de repuesto", effect: { materials: 3, advanceMs: 120000 } },
      { text: "Registrar la guantera y salir", effect: { fuel: 2, zombies: 1, advanceMs: 60000 } },
    ],
  },
  {
    id: 223,
    title: "Ferretería con alarma conectada",
    text: `La ferretería del barrio aún tiene puertas metálicas intactas.
Un pequeño generador mantiene una alarma parpadeante sobre la entrada.
Dentro podrían haber clavos, martillos y herramientas para el campamento.
Desactivar la alarma requiere habilidad y tiempo concentrado.
Forzar la entrada atraerá todo tipo de atenciones indeseadas.`,
    choices: [
      { text: "Desactivar la alarma cuidadosamente", effect: { materials: 4, advanceMs: 150000 } },
      { text: "Romper la puerta de golpe", effect: { materials: 3, threat: 3, zombies: 1, advanceMs: 60000 } },
      { text: "No arriesgarse y seguir", effect: { advanceMs: 30000, morale: -1 } },
    ],
  },
  {
    id: 224,
    title: "Vecinos discutiendo por comida",
    text: `Dos grupos de vecinos gritan desde balcones opuestos de un edificio.
Se acusan mutuamente de robar una bolsa de arroz escondida.
Uno de ellos ofrece parte del botín si mediamos en la disputa.
La tensión puede desencadenar disparos si no se calma pronto.
Nuestro grupo podría ganar aliados o quedar atrapado en la riña.`,
    choices: [
      { text: "Medir con justicia", effect: { food: 2, morale: 2, karma: 3, advanceMs: 120000 } },
      { text: "Apoyar a un lado", effect: { food: 3, morale: -2, threat: 1, advanceMs: 90000 } },
      { text: "Ignorar el conflicto", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 225,
    title: "Carreta rota en el camino",
    text: `Una carreta de madera bloquea el sendero lleno de barro.
Sus ruedas están dañadas pero hay sacos de grano dentro.
Los caballos se soltaron y dejaron huellas hacia el bosque oscuro.
Mover la carreta requiere fuerza y coordinación entre todos.
Tomar los sacos puede ralentizar la marcha, pero la comida escasea.`,
    choices: [
      { text: "Reparar y llevar la carreta", effect: { materials: -2, food: 4, advanceMs: 180000 } },
      { text: "Cargar los sacos al hombro", effect: { food: 3, morale: -1, advanceMs: 150000 } },
      { text: "Liberar el camino y seguir", effect: { morale: 1, advanceMs: 90000 } },
    ],
  },
  {
    id: 226,
    title: "Biblioteca aún ordenada",
    text: `Una biblioteca vieja mantiene sus estantes en perfecto orden.
Los libros cuentan historias de supervivencia y manuales de primeros auxilios.
En la recepción hay una caja fuerte con un símbolo de cruz roja.
Una escalera chirriante conduce a un altillo oscuro y polvoriento.
El silencio invita a quedarse, pero el tiempo apremia.`,
    choices: [
      { text: "Leer manuales útiles", effect: { morale: 2, knowledge: true, advanceMs: 120000 } },
      { text: "Forzar la caja de la recepción", effect: { medicine: 2, materials: 1, advanceMs: 90000 } },
      { text: "Tomar mapas y partir", effect: { fuel: 1, advanceMs: 60000 } },
    ],
  },
  {
    id: 227,
    title: "Mercado nocturno clandestino",
    text: `En un callejón oscuro se organiza un mercado solo por la noche.
Vendedores encapuchados ofrecen piezas robadas y medicamentos raros.
Se debe pagar con recursos o favores peligrosos para los nuestros.
La policía ya no existe, pero la violencia sigue latente en cada trato.
Comprar o robar aquí puede definir nuestras relaciones futuras.`,
    choices: [
      { text: "Comprar medicamentos caros", effect: { medicine: 3, fuel: -2, advanceMs: 150000 } },
      { text: "Robar entre las sombras", effect: { ammo: 4, morale: -3, karma: -4, advanceMs: 90000 } },
      { text: "Vigilar y marcharse", effect: { threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 228,
    title: "Señales en el techo del banco",
    text: `En el techo de un banco aparecen flechas pintadas con tiza.
Señalan hacia un hueco de ventilación parcialmente abierto.
El interior parece oscuro pero protegido de las calles infectadas.
Puede ser un refugio temporal o una trampa cerrada sin salida.
Seguir las señales requiere confianza en desconocidos.`,
    choices: [
      { text: "Entrar por la ventilación", effect: { materials: 1, food: 2, zombies: 1, advanceMs: 90000 } },
      { text: "Dejar nuestras propias señales", effect: { morale: 1, karma: 2, advanceMs: 60000 } },
      { text: "Ignorar las flechas", effect: { advanceMs: 30000, threat: -1 } },
    ],
  },
  {
    id: 229,
    title: "Casa con jardín bien cuidado",
    text: `En medio del barrio arrasado hay una casa con jardín intacto.
Las flores están regadas y la puerta principal se ve recién pintada.
No se observan marcas de lucha ni signos de abandono.
Quizá sus dueños estén dentro o hayan salido hace poco de patrulla.
Entrar sin permiso podría iniciar un conflicto innecesario.`,
    choices: [
      { text: "Tocar la puerta y hablar", effect: { morale: 2, karma: 2, advanceMs: 90000 } },
      { text: "Forzar la entrada discretamente", effect: { food: 2, water: 2, morale: -3, advanceMs: 60000 } },
      { text: "Marcarla como zona segura y seguir", effect: { advanceMs: 30000, threat: -1 } },
    ],
  },
  {
    id: 230,
    title: "Estación de metro inundada",
    text: `Las escaleras del metro conducen a un túnel parcialmente inundado.
Se escucha un eco metálico de gotas que caen desde el techo roto.
Un letrero indica que al final existe un refugio preparado años atrás.
La humedad puede estropear municiones y herramientas sensibles.
Pasar por allí ahorra camino pero expone a infecciones y caídas.`,
    choices: [
      { text: "Nadar hasta el refugio", effect: { threat: 2, medicine: -1, morale: -1, advanceMs: 150000 } },
      { text: "Construir una pasarela improvisada", effect: { materials: -3, advanceMs: 210000 } },
      { text: "Buscar otra entrada", effect: { fuel: -1, advanceMs: 120000 } },
    ],
  },
  {
    id: 231,
    title: "Furgoneta con mensaje de auxilio",
    text: `Una furgoneta pintada con la palabra "SOCORRO" yace en una zanja.
Del interior surge un olor fuerte a combustible y comida descompuesta.
Hay marcas de uñas en las ventanas desde dentro hacia afuera.
Quizá alguien quedó atrapado antes de convertirse en amenaza.
Ignorarla podría dejar atrás herramientas o supervivientes.`,
    choices: [
      { text: "Revisar el interior cuidadosamente", effect: { ammo: 2, food: 1, zombies: 1, advanceMs: 90000 } },
      { text: "Sacar gasolina y marchar", effect: { fuel: 3, advanceMs: 60000 } },
      { text: "Remolcarla para piezas", effect: { materials: 3, fuel: -1, advanceMs: 150000 } },
    ],
  },
  {
    id: 232,
    title: "Río con puente derrumbado",
    text: `El puente principal sobre el río se derrumbó dejando escombros.
Solo quedan restos metálicos retorcidos sobre el agua agitada.
Un cartel señala un vado más seguro a varios kilómetros al norte.
Cruzar a nado con mochilas es casi un suicidio en estas aguas.
Decidir qué ruta tomar puede cambiar nuestra llegada al refugio.`,
    choices: [
      { text: "Intentar cruzar por los restos", effect: { threat: 2, materials: -1, advanceMs: 120000 } },
      { text: "Buscar el vado al norte", effect: { fuel: -2, advanceMs: 180000 } },
      { text: "Acampar y esperar ayuda", effect: { food: -1, morale: -1, advanceMs: 240000 } },
    ],
  },
  {
    id: 233,
    title: "Helicóptero caído en plaza",
    text: `Un helicóptero militar yace destrozado en medio de una plaza.
Los restos aún emiten chispas y un rotor sigue girando lentamente.
Podría haber botiquines o armas dentro del fuselaje.
La plaza abierta nos deja expuestos a francotiradores y zombis.
Un humo denso podría ser visto desde kilómetros de distancia.`,
    choices: [
      { text: "Buscar cajas médicas", effect: { medicine: 3, threat: 2, advanceMs: 90000 } },
      { text: "Tomar piezas del motor", effect: { materials: 4, fuel: 1, advanceMs: 120000 } },
      { text: "Abandonar la plaza", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 234,
    title: "Mensajero herido en la carretera",
    text: `Un mensajero con uniforme de reparto yace herido junto al camino.
Su mochila cerrada tiene un logo de empresa y parece pesada.
Dice llevar documentos para un refugio cercano que podrían salvar vidas.
Ayudarlo podría incluir cargarlo hasta el campamento o curarlo aquí.
Robarle y dejarlo sería rápido pero moralmente cuestionable.`,
    choices: [
      { text: "Cargarlo hasta el refugio", effect: { morale: 3, karma: 4, advanceMs: 210000 } },
      { text: "Curarlo y dejarlo seguir", effect: { medicine: -1, morale: 1, advanceMs: 120000 } },
      { text: "Tomar la mochila y huir", effect: { food: 2, water: 2, morale: -4, karma: -5, advanceMs: 60000 } },
    ],
  },
  {
    id: 235,
    title: "Tienda de electrónica intacta",
    text: `Una tienda de electrónica mantiene sus vitrinas sin romper.
Los generadores dentro podrían servir para recargar baterías.
Se ven drones pequeños y radios selladas en sus cajas originales.
El sistema de seguridad aún tiene sensores de movimiento activos.
Abrirla sin disparar las alarmas requiere manos expertas.`,
    choices: [
      { text: "Desactivar sensores y entrar", effect: { materials: 2, fuel: 1, advanceMs: 150000 } },
      { text: "Romper el cristal de un golpe", effect: { materials: 3, threat: 2, zombies: 1, advanceMs: 60000 } },
      { text: "Robar solo lo del mostrador", effect: { ammo: 1, morale: -1, advanceMs: 90000 } },
    ],
  },
  {
    id: 236,
    title: "Anciano con huerto escondido",
    text: `Un anciano aparece desde una cabaña señalando un huerto oculto.
Ofrece zanahorias a cambio de agua limpia para sus plantas.
Dice que ha visto bandas merodeando la zona durante la noche.
Su vista se nubla y parece estar cansado de defender el lugar.
Ayudarlo podría asegurar un aliado o un problema futuro.`,
    choices: [
      { text: "Intercambiar agua por verduras", effect: { water: -2, food: 4, morale: 1, advanceMs: 90000 } },
      { text: "Proponer vigilar por la noche", effect: { threat: -1, morale: 2, advanceMs: 180000 } },
      { text: "Rehusar y marcharse", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 237,
    title: "Barrio inundado con botes",
    text: `Las calles están cubiertas por agua turbia hasta las rodillas.
En algunas azoteas hay botes pequeños amarrados con cuerdas.
Podríamos usar un bote para cruzar rápido o saquear casas en alto.
Pero moverse en el agua atrae a criaturas escondidas bajo la superficie.
El olor a humedad y gasolina se mezcla con basura flotante.`,
    choices: [
      { text: "Tomar un bote y cruzar", effect: { fuel: -1, threat: 2, advanceMs: 150000 } },
      { text: "Saquear una casa elevada", effect: { food: 2, water: 2, zombies: 1, advanceMs: 120000 } },
      { text: "Bordear el barrio", effect: { fuel: -2, advanceMs: 180000 } },
    ],
  },
  {
    id: 238,
    title: "Autopista con señales contradictorias",
    text: `Dos señales en la autopista apuntan a refugios distintos.
Una está escrita a mano con pintura fresca, la otra es oficial pero vieja.
Los autos abandonados alrededor muestran impactos de bala recientes.
Decidir rápido evita quedar expuestos en el descampado.
La elección podría llevarnos a ayuda o a una emboscada.`,
    choices: [
      { text: "Seguir la señal oficial", effect: { fuel: -1, morale: 1, advanceMs: 90000 } },
      { text: "Confiar en la señal pintada", effect: { fuel: -1, threat: 2, advanceMs: 90000 } },
      { text: "Acampar y analizar mapas", effect: { food: -1, morale: -1, advanceMs: 180000 } },
    ],
  },
  {
    id: 239,
    title: "Estación de servicio ocupada",
    text: `Una banda armada vigila una estación de servicio bien defendida.
Piden una parte de nuestro combustible a cambio de dejarnos pasar.
El líder promete que no dispararán si colaboramos sin preguntas.
Nuestros vehículos necesitan llenar el tanque antes de seguir.
Negociar mal podría terminar en un tiroteo peligroso.`,
    choices: [
      { text: "Pagar lo exigido", effect: { fuel: -4, morale: 1, advanceMs: 90000 } },
      { text: "Intentar robar de noche", effect: { fuel: 5, threat: 3, karma: -3, advanceMs: 150000 } },
      { text: "Buscar otra estación", effect: { fuel: -2, advanceMs: 180000 } },
    ],
  },
  {
    id: 240,
    title: "Refugio subterráneo sellado",
    text: `En el bosque hay una compuerta metálica con un símbolo de refugio.
El panel electrónico pide un código que no tenemos.
Quizá dentro haya comida enlatada y baterías para meses.
Forzarla podría activar trampas defensivas aún operativas.
La lluvia empieza a caer y dificulta el trabajo de ganzúa.`,
    choices: [
      { text: "Intentar abrir con herramientas", effect: { materials: -2, threat: 1, advanceMs: 180000 } },
      { text: "Buscar pistas en los alrededores", effect: { morale: 1, advanceMs: 90000 } },
      { text: "Dejarlo para otra ocasión", effect: { advanceMs: 60000 } },
    ],
  },
  {
    id: 241,
    title: "Tren detenido con vagones vacíos",
    text: `Un tren de mercancías está detenido en medio de la vía principal.
Los vagones abiertos muestran cajas de madera parcialmente vacías.
Los alrededores están silenciosos salvo por el viento que silba.
Podríamos mover algunas cajas para revisar lo que queda adentro.
Demorarnos aquí expone a ataques desde la línea de árboles.`,
    choices: [
      { text: "Examinar vagones uno por uno", effect: { materials: 3, food: 1, advanceMs: 150000 } },
      { text: "Tomar solo lo visible", effect: { materials: 1, advanceMs: 60000 } },
      { text: "Seguir las vías a pie", effect: { fuel: -1, morale: -1, advanceMs: 120000 } },
    ],
  },
  {
    id: 242,
    title: "Montón de cartas sin enviar",
    text: `En una oficina postal derruida hay sacos llenos de cartas sin enviar.
Muchas están selladas con promesas y despedidas escritas a mano.
El mapa del barrio muestra algunas direcciones aún accesibles.
Entregar cartas podría levantar la moral de desconocidos y propia.
Quemarlas serviría como señal de humo para otros supervivientes.`,
    choices: [
      { text: "Repartir algunas cartas", effect: { morale: 3, karma: 4, advanceMs: 180000 } },
      { text: "Usarlas para encender una señal", effect: { threat: -1, advanceMs: 90000 } },
      { text: "Tomar sellos y marchar", effect: { materials: 1, advanceMs: 60000 } },
    ],
  },
  {
    id: 243,
    title: "Aparición en el espejo de la tienda",
    text: `Un espejo en una tienda rota refleja una figura que no vemos al girarnos.
Algunos creen que es superstición, otros temen un francotirador escondido.
Debajo del mostrador hay un cajón con llave que podría contener algo útil.
El reflejo podría ser un montaje para distraer a los curiosos.
Decidir rápido evita que la paranoia consuma al grupo.`,
    choices: [
      { text: "Investigar el reflejo", effect: { threat: 1, advanceMs: 60000 } },
      { text: "Forzar el cajón rápidamente", effect: { ammo: 2, morale: -1, advanceMs: 90000 } },
      { text: "Romper el espejo y retirarse", effect: { materials: 1, advanceMs: 30000 } },
    ],
  },
  {
    id: 244,
    title: "Hospital con generador activo",
    text: `Un hospital pequeño mantiene luces gracias a un generador que zumba.
Las puertas de urgencias están cerradas con muebles desde dentro.
Se escuchan gritos débiles y golpes metálicos en los pasillos.
El generador podría abastecer al campamento por una semana.
Entrar requiere desmantelar barricadas y arriesgar contagio.`,
    choices: [
      { text: "Entrar a rescatar pacientes", effect: { medicine: 3, zombies: 2, karma: 3, advanceMs: 150000 } },
      { text: "Robar el generador", effect: { fuel: 4, threat: 2, morale: -2, advanceMs: 120000 } },
      { text: "Dejar el lugar tranquilo", effect: { advanceMs: 60000 } },
    ],
  },
  {
    id: 245,
    title: "Ventisca repentina en carretera",
    text: `Una ventisca fría azota la carretera levantando nieve y polvo.
La visibilidad se reduce a pocos metros y el viento corta la piel.
Encontrar refugio rápido es vital para evitar hipotermia.
Seguir conduciendo puede hacer que el vehículo derrape y se estrelle.
Perder tiempo buscando abrigo afectará el progreso del día.`,
    choices: [
      { text: "Refugiarse en una casa cercana", effect: { morale: 1, threat: -1, advanceMs: 120000 } },
      { text: "Seguir conduciendo lentamente", effect: { fuel: -2, advanceMs: 90000 } },
      { text: "Montar un campamento improvisado", effect: { materials: -2, food: -1, advanceMs: 150000 } },
    ],
  },
];

