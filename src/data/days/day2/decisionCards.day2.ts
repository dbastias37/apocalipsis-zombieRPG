import type { DecisionCard } from "../../decisionCards";

export const day2DecisionCards: DecisionCard[] = [
  {
    id: 301,
    title: "Grietas en el depósito de agua",
    text:
`Al revisar los bidones, descubren pequeñas filtraciones que mojan el suelo del contenedor.
Si no se sellan, podríamos perder una parte crítica del agua almacenada.
El grupo debate si gastar materiales ahora o racionar y rezar.
La humedad ya atrajo insectos y huele a óxido.
Resolverlo hoy significa menos margen para otras tareas.`,
    choices: [
      { text: "Sellar con resina y retazos", effect: { materials: -2, water: +2, morale: +1, advanceMs: 120000 } },
      { text: "Trasvasar aljibes y desechar bidones malos", effect: { water: -1, morale: -1, advanceMs: 90000 } },
      { text: "Ignorar por hoy y racionar duro", effect: { water: -2, morale: -2, karma: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 302,
    title: "Gritos en la avenida",
    text:
`Unos alaridos cortan el aire desde la avenida principal.
Podrían ser supervivientes pidiendo ayuda o una trampa.
El ruido ya comenzó a atraer caminantes a la zona.
Si intervenimos, habrá que moverse rápido y con cautela.
Quedarnos al margen podría afectarnos la conciencia.`,
    choices: [
      { text: "Responder y montar rescate", effect: { morale: +2, karma: +1, zombies: 3, advanceMs: 150000 } },
      { text: "Observar desde azotea y marcar ruta segura", effect: { threat: -1, morale: 0, advanceMs: 120000 } },
      { text: "Cerrar puertas y elevar defensas", effect: { materials: -1, threat: -2, morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 303,
    title: "Generador viejo en el taller",
    text:
`En el taller del barrio hay un generador polvoriento que podría darnos luz por la noche.
Pero el sonido podría atraer a los muertos y requiere combustible.
Si logramos encenderlo, podríamos trabajar más rápido y calentar comida.
Desmontarlo también daría piezas útiles.
La decisión dividirá recursos y tiempo del día.`,
    choices: [
      { text: "Encender para una prueba corta", effect: { fuel: -1, materials: +1, threat: +1, advanceMs: 90000 } },
      { text: "Desmontar con cuidado por piezas", effect: { materials: +3, advanceMs: 120000 } },
      { text: "Dejarlo y reforzar el taller", effect: { materials: -1, threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 304,
    title: "Forastero con mochila ajena",
    text:
`Un desconocido se acerca con una mochila que reconocen de una víctima del barrio.
Asegura haberla encontrado abandonada, pero evita dar detalles.
Podría tener recursos valiosos, o ser un ladrón armado.
Tratar con él implica un riesgo de conflicto.
La tensión crece y todos miran sus manos.`,
    choices: [
      { text: "Negociar intercambio justo", effect: { food: +1, water: +1, materials: +1, karma: +1, advanceMs: 90000 } },
      { text: "Exigir devolución bajo amenaza", effect: { materials: +2, morale: -1, karma: -1, advanceMs: 60000 } },
      { text: "Rechazar trato y vigilarlo", effect: { threat: -1, morale: 0, advanceMs: 60000 } },
    ],
  },
  {
    id: 305,
    title: "Colonia de ratas en la despensa",
    text:
`Encontramos excrementos y bolsas roídas en el cuarto de comida.
Las ratas podrían enfermar al grupo y arruinar reservas.
Podemos ahumar el lugar, pero requerirá combustible y tiempo.
Otra opción es improvisar trampas con el poco alambre que queda.
Si lo dejamos, mañana habrá menos comida todavía.`,
    choices: [
      { text: "Ahumar y desinfectar", effect: { fuel: -1, food: +1, medicine: -1, advanceMs: 120000 } },
      { text: "Colocar trampas caseras", effect: { materials: -1, food: 0, advanceMs: 90000 } },
      { text: "Cerrar y racionar, sin limpiar", effect: { food: -1, morale: -1, karma: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 306,
    title: "Rumor de convoy en la autopista",
    text:
`Un radioaficionado dice haber visto luces de un convoy en la autopista.
Podrían ser militares, saqueadores o pura ilusión.
Si salimos a inspeccionar, gastaremos tiempo y quizá combustible.
De ignorarlo, podríamos perder una gran oportunidad.
El grupo escucha el zumbido del viento entre los carteles viejos.`,
    choices: [
      { text: "Explorar el acceso más cercano", effect: { fuel: -1, materials: +1, zombies: 2, advanceMs: 150000 } },
      { text: "Esperar otra transmisión", effect: { morale: -1, advanceMs: 90000 } },
      { text: "Descartar el rumor y enfocarse en el campamento", effect: { threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 307,
    title: "Discusión por el botiquín",
    text:
`La última cura aplicada vació el botiquín común.
Uno de los heridos pide prioridad para mañana por su fiebre.
Otro recuerda que salvó la vida al grupo y exige trato preferente.
La tensión amenaza con dividir al equipo.
Decidir hoy marcará el ánimo de todos.`,
    choices: [
      { text: "Asignar medicina por gravedad clínica", effect: { morale: +1, medicine: -1, karma: +1, advanceMs: 60000 } },
      { text: "Premiar al que arriesgó más", effect: { morale: +2, karma: 0, advanceMs: 60000 } },
      { text: "Guardar la medicina y racionar", effect: { morale: -2, karma: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 308,
    title: "Puerta trasera sin traba",
    text:
`Durante la ronda, alguien nota que la puerta trasera del edificio no cierra bien.
Un golpe fuerte podría abrirla en silencio.
Tenemos pocas bisagras y una sola barra metálica útil.
Si la arreglamos, perderemos tiempo de exploración.
Si no, dormiremos con un ojo abierto.`,
    choices: [
      { text: "Trabar con la barra y remaches", effect: { materials: -2, threat: -2, advanceMs: 90000 } },
      { text: "Parche rápido con cuerda y clavos", effect: { materials: -1, threat: -1, advanceMs: 60000 } },
      { text: "Dejarla y montar guardias dobles", effect: { morale: -1, advanceMs: 120000 } },
    ],
  },
  {
    id: 309,
    title: "Humo en el horizonte",
    text:
`Una columna de humo negro se eleva al sur.
Podría ser un incendio en un depósito o una señal de auxilio.
Acercarse representa inhalar tóxicos y topar con grupos hostiles.
Pero también hay chance de encontrar herramientas o combustible.
¿Nos desviamos o lo marcamos para mañana?`,
    choices: [
      { text: "Ir con mascarillas improvisadas", effect: { materials: -1, fuel: +2, zombies: 2, advanceMs: 150000 } },
      { text: "Marcar en el mapa y seguir con lo nuestro", effect: { morale: 0, advanceMs: 60000 } },
      { text: "Advertir por radio a quien escuche", effect: { karma: +1, morale: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 310,
    title: "Aguacero inesperado",
    text:
`Una lluvia intensa inunda las calles y baja la temperatura.
Los techos gotean y el patio se encharca.
Trabajar afuera se vuelve peligroso y lento.
Podemos recolectar algo de agua, si armamos canaletas.
O cerrar todo y esperar a que pase.`,
    choices: [
      { text: "Recolectar agua de lluvia", effect: { materials: -1, water: +3, morale: +1, advanceMs: 120000 } },
      { text: "Refugiarse y reparar goteras", effect: { materials: -1, threat: -1, advanceMs: 90000 } },
      { text: "Ignorar el clima y seguir explorando", effect: { morale: -1, zombies: 1, advanceMs: 90000 } },
    ],
  },
  // 311..345 — 35 cartas más
  {
    id: 311,
    title: "Mapa con marcas antiguas",
    text:
`Bajo una mesa aparece un mapa con rutas trazadas a mano.
Se señalan atajos y puntos peligrosos con tinta roja.
Es viejo, pero puede ahorrar tiempo si sigue vigente.
Debatimos si fiarnos de un desconocido.
Cada minuto cuenta, y el sol ya cayó un poco.`,
    choices: [
      { text: "Seguir el atajo marcado", effect: { advanceMs: 60000, zombies: 2, materials: +1 } },
      { text: "Evitar zonas rojas a toda costa", effect: { advanceMs: 120000, threat: -1 } },
      { text: "Copiar notas útiles y guardar el mapa", effect: { materials: -1, morale: +1, advanceMs: 90000 } },
    ],
  },
  {
    id: 312,
    title: "Señales en código en la pared",
    text:
`En la esquina del mercado alguien pintó símbolos extraños.
Quien los hizo conocía la zona y a los grupos locales.
Podrían advertir trampas o señalar escondites.
Interpretarlos mal también nos pondría en peligro.
¿Los seguimos, los borramos o los ignoramos?`,
    choices: [
      { text: "Seguir las señales con cautela", effect: { materials: +1, zombies: 2, advanceMs: 120000 } },
      { text: "Borrarlas para confundir saqueadores", effect: { karma: -1, threat: -1, advanceMs: 60000 } },
      { text: "Tomar fotos y dejarlas", effect: { morale: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 313,
    title: "Cocina comunitaria improvisada",
    text:
`Un grupo vecino propone cocinar juntos para ahorrar combustible.
Piden parte de nuestra comida a cambio de calor y compañía.
Podría mejorar la moral y crear alianzas.
Pero nos deja con menos raciones para mañana.
El hambre no perdona mal cálculo.`,
    choices: [
      { text: "Compartir y cocinar juntos", effect: { food: -2, fuel: -1, morale: +3, karma: +1, advanceMs: 120000 } },
      { text: "Negociar por porciones claras", effect: { food: -1, morale: +1, advanceMs: 90000 } },
      { text: "Rechazar y comer frío", effect: { morale: -1, fuel: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 314,
    title: "Radio: promesa de refugio",
    text:
`Una voz en la banda corta ofrece refugio “seguro y limpio”.
No comparte ubicación exacta hasta confirmar identidades.
Podría ser real, o una emboscada de cazadores.
El grupo se divide entre esperanza y cautela.
La noche se acerca y la decisión pesa.`,
    choices: [
      { text: "Dar coordenadas falsas y tantear", effect: { threat: -1, morale: 0, advanceMs: 90000 } },
      { text: "Organizar encuentro en zona abierta", effect: { zombies: 2, morale: +1, advanceMs: 120000 } },
      { text: "Cortar comunicación y seguir", effect: { karma: -1, morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 315,
    title: "Niño escondido en el sótano",
    text:
`En el edificio contiguo aparece un niño cubierto de polvo.
Dice que su familia no regresó desde ayer.
Tiene frío, hambre y una linterna sin pilas.
Ayudarlo implica recursos y riesgo.
Mirarlo a los ojos hace difícil dar la espalda.`,
    choices: [
      { text: "Acogerlo temporalmente", effect: { food: -1, water: -1, morale: +2, karma: +2, advanceMs: 90000 } },
      { text: "Buscar a su familia en las cercanías", effect: { zombies: 2, morale: +1, advanceMs: 150000 } },
      { text: "Enviar con el grupo vecino", effect: { morale: 0, karma: +1, advanceMs: 90000 } },
    ],
  },
  {
    id: 316,
    title: "Piso inestable",
    text:
`Un crujido delata un piso podrido en el pasillo del segundo nivel.
Si alguien cae, podría romperse una pierna.
Apuntalar requiere madera y tiempo.
Rodear complica el tránsito con cargas.
Ignorarlo hoy es posponer un accidente.`,
    choices: [
      { text: "Apuntalar ahora", effect: { materials: -2, threat: -1, advanceMs: 120000 } },
      { text: "Rodear y señalizar", effect: { materials: -1, morale: +0, advanceMs: 60000 } },
      { text: "Ignorar y apurarse", effect: { morale: -1, zombies: 1, advanceMs: 60000 } },
    ],
  },
  {
    id: 317,
    title: "Reparto de turnos de guardia",
    text:
`Los últimos dos turnos nocturnos quedaron flojos.
Algunos dicen que están exhaustos y otros que no se respetan horarios.
Redistribuir turnos calmará ánimos pero costará productividad mañana.
Mantenerlos implica riesgo de distracciones.
La confianza en la guardia sostiene el campamento.`,
    choices: [
      { text: "Redistribuir con reglas claras", effect: { morale: +2, advanceMs: 60000 } },
      { text: "Pagar guardias con raciones extra", effect: { food: -1, morale: +1, advanceMs: 60000 } },
      { text: "Dejarlo como está", effect: { threat: +1, morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 318,
    title: "Cableado de trampa viejo",
    text:
`En un pasillo hay un sistema de latas y alambres destinado a hacer ruido.
La humedad oxidó los ganchos y podría fallar al necesitarlo.
Rehacerlo consume materiales pero baja el riesgo nocturno.
También podemos desmontarlo y usar las piezas en otra cosa.
O dejarlo y cruzar los dedos.`,
    choices: [
      { text: "Rehacer el sistema", effect: { materials: -2, threat: -2, advanceMs: 90000 } },
      { text: "Desmontar y reutilizar", effect: { materials: +1, threat: 0, advanceMs: 60000 } },
      { text: "Dejarlo tal cual", effect: { threat: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 319,
    title: "Aceite rancio en la cocina",
    text:
`Las latas de aceite almacenadas huelen extraño.
Podríamos filtrarlo y usarlo para lámparas o desecharlo.
Servirlo en comida puede enfermar a alguien.
A la vez, iluminar el patio ayudaría a las guardias.
No hay decisiones fáciles cuando falta todo.`,
    choices: [
      { text: "Filtrar y dedicar a lámparas", effect: { fuel: +1, morale: +1, advanceMs: 90000 } },
      { text: "Desechar por seguridad", effect: { morale: -1, advanceMs: 60000 } },
      { text: "Arriesgarse a cocinar", effect: { food: +1, medicine: -1, karma: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 320,
    title: "Perro flaco en la reja",
    text:
`Un perro famélico se acerca sin agresividad.
Podría alertar de intrusos y acompañar las patrullas.
También implica alimentar una boca más.
Su mirada suplica y la lluvia arrecia.
¿Lo adoptamos, lo espantamos o lo seguimos?`,
    choices: [
      { text: "Adoptarlo y entrenarlo", effect: { food: -1, morale: +2, advanceMs: 90000 } },
      { text: "Darle restos y dejarlo libre", effect: { food: -1, karma: +1, advanceMs: 60000 } },
      { text: "Espantarlo para que no regrese", effect: { morale: -1, karma: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 321,
    title: "Techo con antenas viejas",
    text:
`En la azotea hay antenas oxidadas pero un mástil resistente.
Podemos montar una mejor radio o construir un pararrayos básico.
Ambas tareas requieren manos y piezas.
El clima no ayuda y el viento corta la cara.
Lo que hagamos hoy influirá en comunicaciones.`,
    choices: [
      { text: "Mejorar radio y alcance", effect: { materials: -2, morale: +1, advanceMs: 120000 } },
      { text: "Instalar pararrayos", effect: { materials: -1, threat: -1, advanceMs: 90000 } },
      { text: "Bajar antenas para chatarra", effect: { materials: +2, advanceMs: 90000 } },
    ],
  },
  {
    id: 322,
    title: "Paciente en delirio",
    text:
`Un herido con fiebre alta empieza a delirar y gritar.
Asusta a los más pequeños y llama la atención afuera.
Sedarlo requiere medicina y vigilancia.
Ignorarlo puede desatar pánico.
Cada decisión pesa sobre su vida.`,
    choices: [
      { text: "Sedarlo y vigilarlo", effect: { medicine: -1, morale: +1, advanceMs: 90000 } },
      { text: "Aislarlo en cuarto aparte", effect: { morale: -1, threat: -1, advanceMs: 60000 } },
      { text: "Permitir visitas controladas", effect: { morale: +1, threat: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 323,
    title: "Cuerda tensa sobre el callejón",
    text:
`Alguien tendió una cuerda de lado a lado como trampa.
Las bicicletas del grupo podrían tropezar de noche.
Cortarla reduce riesgo propio, pero quizá protege el perímetro.
Podemos señalizarla o moverla a otro lugar.
Cada opción tiene costos distintos.`,
    choices: [
      { text: "Cortar y almacenar", effect: { materials: +1, threat: +1, advanceMs: 60000 } },
      { text: "Señalizar bien y dejarla", effect: { threat: 0, advanceMs: 60000 } },
      { text: "Moverla al pasaje trasero", effect: { materials: -1, threat: -1, advanceMs: 90000 } },
    ],
  },
  {
    id: 324,
    title: "Camión volcado",
    text:
`En la rotonda quedó un camión con la caja semiabierta.
Puede tener comida o herramientas bajo escombros.
Moverlo requiere esfuerzo y alerta a curiosos.
No sabemos por qué se volcó ni quién lo custodia.
Una decisión rápida puede evitar emboscadas.`,
    choices: [
      { text: "Forzar la caja y saquear", effect: { food: +2, materials: +1, zombies: 3, advanceMs: 150000 } },
      { text: "Revisar solo el perímetro", effect: { threat: -1, advanceMs: 90000 } },
      { text: "Marcar para otro día", effect: { morale: 0, advanceMs: 60000 } },
    ],
  },
  {
    id: 325,
    title: "Taller de bicicletas",
    text:
`Un viejo taller conserva cámaras, parches y cadenas.
Con trabajo, podríamos recuperar dos bicis.
Permitirían explorar más lejos con menos combustible.
Pero también exponen al ciclista a ataques sorpresa.
El tiempo nublado favorece trabajar afuera.`,
    choices: [
      { text: "Arreglar dos bicicletas", effect: { materials: -2, morale: +1, advanceMs: 150000 } },
      { text: "Recuperar solo repuestos", effect: { materials: +2, advanceMs: 90000 } },
      { text: "Cerrar y asegurar la puerta", effect: { materials: -1, threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 326,
    title: "Señuelo con altavoz",
    text:
`Un altavoz portátil aún tiene algo de batería.
Podríamos atraer zombis lejos del edificio.
Pero alguien debe colocarlo y correr.
Si se usa mal, nos quedamos sin plan B.
El debate dura más de lo previsto.`,
    choices: [
      { text: "Usarlo para despejar la calle", effect: { threat: -2, zombies: 1, advanceMs: 120000 } },
      { text: "Guardarlo para una emergencia", effect: { morale: +0, advanceMs: 60000 } },
      { text: "Desmontarlo por piezas", effect: { materials: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 327,
    title: "Filtración en el sótano",
    text:
`El agua sube por la rejilla del desagüe.
Si llueve otra vez, inundará el cuarto de materiales.
Podemos improvisar una compuerta con tablones.
También llamar al grupo vecino para ayuda.
Cada solución consume algo distinto.`,
    choices: [
      { text: "Construir compuerta", effect: { materials: -2, threat: -1, advanceMs: 120000 } },
      { text: "Pedir ayuda y compartir materiales", effect: { materials: -1, karma: +1, advanceMs: 90000 } },
      { text: "Subir todo a la planta alta", effect: { morale: -1, advanceMs: 120000 } },
    ],
  },
  {
    id: 328,
    title: "Rastro de sangre reciente",
    text:
`En el pasillo aparece un rastro que no estaba hace una hora.
Conduce hacia la escalera de incendios.
Podría ser de un herido o de un intruso.
Perseguirlo ahora evita sorpresas de noche.
O podríamos atrancar esa ala y seguir trabajando.`,
    choices: [
      { text: "Seguir el rastro con linternas", effect: { zombies: 2, medicine: +1, advanceMs: 120000 } },
      { text: "Atrancar el ala y marcar", effect: { threat: -1, advanceMs: 60000 } },
      { text: "Limpiar sin investigar", effect: { morale: -1, karma: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 329,
    title: "Cartel de “zona segura”",
    text:
`Un letrero pintado promete refugio a 3 km.
La flecha apunta a una fábrica.
Podría ser real, falsa o vieja.
Si nos desviamos, perderemos la tarde.
A veces, lo seguro está en los detalles.`,
    choices: [
      { text: "Desviarse y comprobar", effect: { fuel: -1, materials: +1, zombies: 2, advanceMs: 150000 } },
      { text: "Fotografiar y preguntar por radio", effect: { morale: +1, advanceMs: 90000 } },
      { text: "Ignorar y seguir plan del día", effect: { advanceMs: 60000 } },
    ],
  },
  {
    id: 330,
    title: "Acuerdo con chatarreros",
    text:
`Unos chatarreros ofrecen piezas a cambio de munición.
Su reputación es turbia, pero a veces cumplen.
Las piezas servirían para trampas o bicicletas.
La munición escasea y mañana quizá la necesitemos.
El trato no permite cancelaciones.`,
    choices: [
      { text: "Aceptar el intercambio", effect: { ammo: -2, materials: +3, karma: 0, advanceMs: 90000 } },
      { text: "Negociar mejor precio", effect: { ammo: -1, materials: +1, morale: +1, advanceMs: 120000 } },
      { text: "Rechazar y retirarse", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 331,
    title: "Desperfecto en la radio",
    text:
`La radio interfiere con un zumbido persistente.
Podría ser falta de tierra o cables pelados.
Arreglarla amplía nuestra escucha y pedidos de ayuda.
Pero consume piezas que usamos en alarmas.
La noche no perdona el silencio.`,
    choices: [
      { text: "Arreglarla a fondo", effect: { materials: -2, morale: +1, advanceMs: 120000 } },
      { text: "Parche temporal", effect: { materials: -1, advanceMs: 60000 } },
      { text: "Apagar para ahorrar piezas", effect: { threat: +1, morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 332,
    title: "Muros con grafitis",
    text:
`Vecinos piden borrar pintadas que asustan a los niños.
Borrarlas mejora el ánimo pero gasta solvente.
Dejarlas puede espantar intrusos por la noche.
El dilema se complica por el tiempo justo.
Hay manos dispuestas, pero pocas herramientas.`,
    choices: [
      { text: "Borrar grafitis", effect: { materials: -1, morale: +2, advanceMs: 90000 } },
      { text: "Dejarlos como disuasión", effect: { threat: -1, morale: 0, advanceMs: 60000 } },
      { text: "Taparlos con carteles útiles", effect: { materials: -1, morale: +1, advanceMs: 90000 } },
    ],
  },
  {
    id: 333,
    title: "Llaves del depósito extraviadas",
    text:
`Desaparecieron las llaves del cuarto de herramientas.
Alguien las movió sin registrar o las perdió.
Forzar la cerradura arruina el marco.
Buscar consume la tarde.
La confianza se resiente con cada descuido.`,
    choices: [
      { text: "Forzar con palanca", effect: { materials: -1, morale: -1, advanceMs: 60000 } },
      { text: "Registrar mochilas y pasillos", effect: { morale: -1, karma: -1, materials: +1, advanceMs: 120000 } },
      { text: "Postergar trabajos del depósito", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 334,
    title: "Corte de ruta",
    text:
`El camino habitual al mercado quedó bloqueado por autos.
Moverlos pide combustible y cuerdas.
Rodear suma kilómetros y riesgo.
No decidirlo hoy complica entregas del vecindario.
Las nubes amenazan otra lluvia.`,
    choices: [
      { text: "Mover autos con esfuerzo", effect: { fuel: -1, materials: -1, threat: -1, advanceMs: 150000 } },
      { text: "Abrir paso solo a pie", effect: { threat: 0, morale: -1, advanceMs: 120000 } },
      { text: "Marcar desvío más largo", effect: { advanceMs: 120000, threat: -1 } },
    ],
  },
  {
    id: 335,
    title: "Alijo bajo el parque",
    text:
`Un viejo nos describe un alijo enterrado en el parque.
Afirma que lo escondió antes del brote.
Excavar llama la atención y cansa.
Pero podría haber comida, medicinas o munición.
La pala está lista, el tiempo no tanto.`,
    choices: [
      { text: "Excavar ahora", effect: { food: +1, medicine: +1, ammo: +1, zombies: 2, advanceMs: 150000 } },
      { text: "Marcar y volver de madrugada", effect: { morale: +0, threat: -1, advanceMs: 60000 } },
      { text: "Descartarlo como cuento", effect: { karma: -1, morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 336,
    title: "Relevo de liderazgo",
    text:
`El coordinador del grupo muestra agotamiento.
Algunos proponen un relevo temporal.
El debate sube de tono y viejas rencillas afloran.
Sea quien sea, necesitaremos alinearnos pronto.
Un mal cambio puede jugar en contra.`,
    choices: [
      { text: "Votación abierta y rápida", effect: { morale: +2, advanceMs: 90000 } },
      { text: "Relevo temporal por 24h", effect: { morale: +1, threat: -1, advanceMs: 90000 } },
      { text: "Mantener liderazgo actual", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 337,
    title: "Cosecha en macetas",
    text:
`Unas macetas en la azotea guardan verduras pequeñas.
Si cosechamos ahora, rinden poco.
Esperar podría duplicar la comida, si no vienen heladas.
Podemos protegerlas con plástico y maderas.
Cada opción impacta el ánimo del equipo.`,
    choices: [
      { text: "Cosechar ya", effect: { food: +1, morale: +1, advanceMs: 60000 } },
      { text: "Proteger y esperar", effect: { materials: -1, threat: -1, advanceMs: 90000 } },
      { text: "Dejarlas para cuando falte mucho", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 338,
    title: "Puente peatonal inestable",
    text:
`El puente al supermercado vibra demasiado.
Cruzar con peso podría romperlo.
Reforzarlo exige herramientas que ahora usamos en otra cosa.
Rodear nos toma el doble de tiempo.
La elección afecta el acceso del barrio.`,
    choices: [
      { text: "Reforzar con tablones", effect: { materials: -2, threat: -1, advanceMs: 120000 } },
      { text: "Cruzar solo a pie", effect: { morale: -1, advanceMs: 90000 } },
      { text: "Rodear y llegar tarde", effect: { advanceMs: 150000 } },
    ],
  },
  {
    id: 339,
    title: "Caja fuerte medio abierta",
    text:
`En un kiosco arrasado queda una caja fuerte forzada.
Su cerradura está dañada pero no cerrada del todo.
Podría contener documentos, dinero inútil o joyas cambiables.
Forzarla hará ruido y llamará atención.
El sol pega fuerte y el aire huele a polvo.`,
    choices: [
      { text: "Forzar ahora mismo", effect: { materials: +1, ammo: +1, zombies: 2, advanceMs: 120000 } },
      { text: "Llevarla al campamento", effect: { materials: -1, morale: +1, advanceMs: 150000 } },
      { text: "Dejarla y asegurar el kiosco", effect: { threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 340,
    title: "Cuentas pendientes",
    text:
`Dos miembros discutieron en combate y casi se hieren.
El rencor merma la coordinación del equipo.
Mediar ahora consume tiempo valioso.
Ignorarlo puede costarnos caro mañana.
Un mal clima interno mata lento.`,
    choices: [
      { text: "Mediación guiada", effect: { morale: +2, advanceMs: 90000 } },
      { text: "Trabajo en parejas opuestas", effect: { morale: +1, advanceMs: 60000 } },
      { text: "Ignorar y priorizar tareas", effect: { morale: -1, threat: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 341,
    title: "Señal de socorro en el techo",
    text:
`Alguien pintó SOS con pintura blanca.
Desde lejos apenas se ve.
Reforzarlo podría atraer ayuda o problemas.
No hacerlo deja las cosas como están.
El cielo por ahora se mantiene despejado.`,
    choices: [
      { text: "Re-pintar con cal y tela", effect: { materials: -1, morale: +1, advanceMs: 90000 } },
      { text: "Añadir flechas y marcas", effect: { materials: -1, threat: +1, advanceMs: 90000 } },
      { text: "Eliminar el SOS", effect: { threat: -1, karma: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 342,
    title: "Objetos personales",
    text:
`Una caja con fotos y cartas aparece en la sala común.
Reaviva recuerdos y lágrimas contenidas.
Guardarla da paz a algunos, dolor a otros.
Quemarla cierra ciclos, pero duele.
Cada uno carga su historia en silencio.`,
    choices: [
      { text: "Guardar en memorial", effect: { morale: +2, advanceMs: 60000 } },
      { text: "Quemar en ceremonia breve", effect: { morale: +1, karma: +1, advanceMs: 60000 } },
      { text: "Repartir y que cada uno decida", effect: { morale: +0, advanceMs: 60000 } },
    ],
  },
  {
    id: 343,
    title: "Mercader ambulante",
    text:
`Un vendedor solitario llega con mochila llena.
Pide trueque por medicina o munición.
Trae pilas, velas y algo de comida enlatada.
Podría ser estafa o una bendición.
No parece peligroso, pero evalúa rápido.`,
    choices: [
      { text: "Comprar pilas y velas", effect: { materials: -1, fuel: +1, morale: +1, advanceMs: 60000 } },
      { text: "Cambiar munición por comida", effect: { ammo: -1, food: +2, advanceMs: 60000 } },
      { text: "Rechazar y vigilarlo", effect: { threat: -1, morale: 0, advanceMs: 60000 } },
    ],
  },
  {
    id: 344,
    title: "Vecino hostil",
    text:
`El grupo de la esquina se queja del ruido nocturno.
Amenazan con no avisar si ven zombis acercarse.
Podríamos calmar aguas con comida.
O mostrar fuerza reforzando el perímetro.
O ignorarlos y que pase la tormenta social.`,
    choices: [
      { text: "Ofrecer comida a cambio de aviso", effect: { food: -1, threat: -1, karma: +1, advanceMs: 60000 } },
      { text: "Reforzar y exhibir vigilancia", effect: { materials: -1, threat: -1, morale: +1, advanceMs: 90000 } },
      { text: "Ignorarlos por completo", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 345,
    title: "Pánico por rumor",
    text:
`Alguien jura que vio a un infectado correr y hablar.
El miedo se contagia más rápido que un virus.
Podemos desmentir con hechos o bloquear pasillos.
O aceptar que no sabemos y reforzar controles.
La calma es recurso escaso.`,
    choices: [
      { text: "Informar con transparencia", effect: { morale: +2, threat: -1, advanceMs: 60000 } },
      { text: "Bloquear pasillos sensibles", effect: { materials: -1, threat: -1, advanceMs: 90000 } },
      { text: "Desestimar el rumor", effect: { morale: -1, karma: -1, advanceMs: 60000 } },
    ],
  },
];
