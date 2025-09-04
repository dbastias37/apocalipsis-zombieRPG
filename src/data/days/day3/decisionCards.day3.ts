import type { DecisionCard } from "../../decisionCards";

export const day3DecisionCards: DecisionCard[] = [
  {
    id: 501,
    title: "Sirena del estadio",
    text:
`Antes del amanecer, una sirena lejana despierta al barrio.
Vidrios sueltos vibran con el eco y los pájaros huyen.
La cantina del estadio podría tener comida sin abrir.
Pero el ruido también atrae caminantes a la zona.
El grupo debate si es una oportunidad o una trampa.`,
    choices: [
      { text: "Entrar por acceso de servicio", effect: { food: +2, zombies: 3, advanceMs: 150000 } },
      { text: "Observar y marcar para más tarde", effect: { threat: -1, advanceMs: 90000 } },
      { text: "Ignorar y reforzar perímetro", effect: { materials: -1, threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 502,
    title: "Camilla abandonada",
    text:
`En la esquina hay una camilla con correas rotas.
Tiene manchas secas y un maletín a medio abrir.
Podría haber medicinas útiles dentro.
Moverla hará ruido y podría delatar nuestra posición.
La lluvia fina vuelve resbaloso el pavimento.`,
    choices: [
      { text: "Registrar rápido y retirarse", effect: { medicine: +2, zombies: 1, advanceMs: 90000 } },
      { text: "Llevar camilla al campamento", effect: { materials: +1, morale: +1, zombies: 2, advanceMs: 150000 } },
      { text: "Dejar todo como está", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 503,
    title: "Motoristas en la autopista",
    text:
`Desde el paso a desnivel se oyen motores irregulares.
Podrían ser saqueadores o un grupo que huye.
Si nos ven, quizá pidan intercambio o disparen primero.
Podríamos montar una escucha e identificar rutas.
El viento trae olor a combustible viejo.`,
    choices: [
      { text: "Acercarse y pararse a negociar", effect: { fuel: -1, materials: +1, karma: +1, advanceMs: 120000 } },
      { text: "Esconderse y seguir sus luces", effect: { threat: -1, zombies: 1, advanceMs: 120000 } },
      { text: "Retirarse sin contacto", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 504,
    title: "Fiebre en la guardia",
    text:
`El vigilante de la madrugada despierta con fiebre y escalofríos.
Si no lo atendemos, la guardia quedará corta.
Puede ser infección o simple agotamiento.
La fila de pendientes para hoy es larga.
Dormir menos es una mala idea, pero quizá inevitable.`,
    choices: [
      { text: "Asignar medicina y descanso", effect: { medicine: -1, morale: +1, advanceMs: 90000 } },
      { text: "Reorganizar turnos y cubrir hueco", effect: { morale: 0, advanceMs: 60000 } },
      { text: "Seguir igual y arriesgarse", effect: { threat: +1, morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 505,
    title: "Pozo con olor a gas",
    text:
`El patio huele a gas cerca de la rejilla del drenaje.
Un tanque de la cuadra podría estar perdiendo.
Encender algo aquí sería un error.
A tiempo, podríamos cerrar válvulas y ventilar.
El reloj del día no perdona improvisaciones.`,
    choices: [
      { text: "Cerrar válvulas y ventilar", effect: { fuel: -1, threat: -1, advanceMs: 120000 } },
      { text: "Marcar y prohibir fuego", effect: { morale: -1, advanceMs: 60000 } },
      { text: "Ignorar para priorizar comida", effect: { food: +1, threat: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 506,
    title: "Campanadas del colegio",
    text:
`El reloj del colegio marca horas con campanadas vacías.
Niños fantasma parecen correr en nuestra memoria.
La dirección podría guardar útiles y botiquines.
También es punto clásico de emboscadas.
El cielo se abre entre nubes grises.`,
    choices: [
      { text: "Entrar por la sala de música", effect: { materials: +1, medicine: +1, zombies: 2, advanceMs: 150000 } },
      { text: "Vigilar desde la reja", effect: { threat: -1, advanceMs: 90000 } },
      { text: "Dejar un señuelo y evaluar", effect: { materials: -1, zombies: 1, advanceMs: 120000 } },
    ],
  },
  {
    id: 507,
    title: "Pozas en el subterráneo",
    text:
`El estacionamiento subterráneo está inundado hasta los tobillos.
Brilla una luz fría en el fondo de un taller.
Podría haber herramientas y baterías útiles.
La humedad estropeará lo que dejemos atrás.
Cada paso chapotea y delata nuestra presencia.`,
    choices: [
      { text: "Entrar con linternas y cuerda", effect: { materials: -1, fuel: +1, zombies: 2, advanceMs: 150000 } },
      { text: "Drenar con canaletas improvisadas", effect: { materials: -2, threat: -1, advanceMs: 150000 } },
      { text: "Sellar y usar otra ruta", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 508,
    title: "Desgaste del liderazgo",
    text:
`El líder del grupo tiene ojeras profundas y la voz quebrada.
Las decisiones recientes pesaron más de lo esperado.
Un relevo temporal podría refrescar ánimos.
O generar fracturas imposibles de reparar.
La confianza es combustible de alto octanaje.`,
    choices: [
      { text: "Votar un relevo por 24 h", effect: { morale: +2, threat: -1, advanceMs: 90000 } },
      { text: "Crear un consejo de 3 voces", effect: { morale: +1, advanceMs: 120000 } },
      { text: "Sostener al líder actual", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 509,
    title: "Mercado con generador",
    text:
`El mini mercado del barrio tiene un generador a medias.
Alguien lo encendió anoche, quizá vuelvan hoy.
Conseguir combustible nos abriría sus puertas selladas.
Pero el ruido atraerá miradas y dientes.
El olor a fritura rancia flota aún en el aire.`,
    choices: [
      { text: "Encender y saquear rápido", effect: { fuel: -1, food: +2, zombies: 3, advanceMs: 150000 } },
      { text: "Desmontar por piezas útiles", effect: { materials: +2, advanceMs: 120000 } },
      { text: "Marcar para un golpe nocturno", effect: { threat: -1, advanceMs: 90000 } },
    ],
  },
  {
    id: 510,
    title: "Mensaje con pintura fresca",
    text:
`En la muralla aparece “NO ENTREN” escrito hoy.
La pintura es reciente y gotea sobre el suelo.
Quizá sea advertencia real o un señuelo.
Podemos entrar, borrar o rodear.
El silencio del pasaje pesa más que el cartel.`,
    choices: [
      { text: "Entrar con cobertura", effect: { materials: -1, ammo: -1, zombies: 2, advanceMs: 120000 } },
      { text: "Borrar y dejar aviso propio", effect: { karma: +1, threat: -1, advanceMs: 90000 } },
      { text: "Rodear por el patio trasero", effect: { advanceMs: 120000 } },
    ],
  },

  // 511..545 (35 cartas más)
  {
    id: 511,
    title: "Leche en polvo vencida",
    text:
`Encontramos cajas de leche en polvo con fecha vencida.
A simple vista parece utilizable si se hierve bien.
Descartar todo duele, pero enfermar sería peor.
El hambre aprieta más hoy que ayer.
La olla grande nos mira desde la cocina.`,
    choices: [
      { text: "Usar tras hervir y probar", effect: { food: +1, medicine: -1, advanceMs: 90000 } },
      { text: "Donar a vecinos con advertencia", effect: { karma: +1, morale: +1, advanceMs: 60000 } },
      { text: "Descartar responsablemente", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 512,
    title: "Ruidos en la biblioteca",
    text:
`La biblioteca municipal parece tranquila por fuera.
Dentro, estanterías caídas dibujan un laberinto.
Podría haber mapas y manuales de primeros auxilios.
Mover muebles hará ruido seguro.
El polvo engaña y corta la respiración.`,
    choices: [
      { text: "Abrir camino y registrar", effect: { materials: +1, medicine: +1, zombies: 2, advanceMs: 150000 } },
      { text: "Tomar solo la sección de mapas", effect: { materials: 0, threat: -1, advanceMs: 120000 } },
      { text: "Marcar y volver con más manos", effect: { morale: +0, advanceMs: 90000 } },
    ],
  },
  {
    id: 513,
    title: "Cuarto con plantas fluorescentes",
    text:
`En un sótano, macetas brillan débilmente en verde.
Parece un cultivo improvisado bajo lámparas viejas.
Podría haber hongos comestibles o algo peor.
La humedad anuncia moho escondido.
El techo tiene cables pelados a la vista.`,
    choices: [
      { text: "Cosechar con guantes y mascarilla", effect: { food: +1, medicine: -1, advanceMs: 120000 } },
      { text: "Cortar corriente y ventilar", effect: { materials: -1, threat: -1, advanceMs: 120000 } },
      { text: "Sellar la puerta y marcar peligro", effect: { karma: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 514,
    title: "Tejado con goteras nuevas",
    text:
`La lluvia nocturna abrió dos goteras sobre las literas.
Las mantas huelen a humedad y frío.
Reparar ahora evita enfermos mañana.
Pero consume clavos y tablas contadas.
El sol apenas calienta entre nubes.`,
    choices: [
      { text: "Reparar con tablillas", effect: { materials: -2, threat: -1, advanceMs: 120000 } },
      { text: "Mover literas y poner baldes", effect: { morale: -1, advanceMs: 60000 } },
      { text: "Ignorar y encender brasero", effect: { fuel: -1, morale: +0, advanceMs: 60000 } },
    ],
  },
  {
    id: 515,
    title: "Cisterna con sedimento",
    text:
`El filtro de la cisterna muestra barro oscuro.
Beber así no es opción por mucho tiempo.
Podemos desmontar y limpiar a fondo.
O hervir cada ración y racionar duro.
La fatiga no ayuda a decidir bien.`,
    choices: [
      { text: "Limpieza profunda", effect: { materials: -1, water: +2, advanceMs: 120000 } },
      { text: "Hervir por tandas", effect: { fuel: -1, morale: -1, advanceMs: 90000 } },
      { text: "Racionar estrictamente", effect: { water: -1, morale: -2, advanceMs: 60000 } },
    ],
  },
  {
    id: 516,
    title: "Chatarra con alarma oculta",
    text:
`Un montón de chatarra trae un sensor viejo pegado.
Si suena, media cuadra sabrá dónde estamos.
Quitar el módulo da piezas útiles.
Desarmarlo mal prende la sirena.
Una bicicleta sin cadena asoma entre tubos.`,
    choices: [
      { text: "Desarmar con cuidado", effect: { materials: +2, threat: -1, advanceMs: 120000 } },
      { text: "Quitar lo visible y retirarse", effect: { materials: +1, advanceMs: 90000 } },
      { text: "Forzar a prisa", effect: { materials: +2, zombies: 2, advanceMs: 90000 } },
    ],
  },
  {
    id: 517,
    title: "Vecino con tos persistente",
    text:
`El vecino del segundo piso no deja de toser.
Dice que es polvo, pero tiembla como fiebre.
Pedir ayuda crea deuda; ignorar crea rencor.
Aislarlo reduce riesgo para el grupo.
Sus ojos piden algo más que medicina.`,
    choices: [
      { text: "Atender y aislar", effect: { medicine: -1, karma: +1, advanceMs: 90000 } },
      { text: "Entregar mascarillas y agua", effect: { water: -1, morale: +0, advanceMs: 60000 } },
      { text: "Cerrar el piso por hoy", effect: { threat: -1, morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 518,
    title: "Civiles armados en la plaza",
    text:
`Tres personas vigilan una fogata en la plaza.
Tienen mochilas grandes y miradas cansadas.
Quieren intercambiar munición por comida.
Acercarse podría abrir puerta o bala.
Las palomas ya no vuelan aquí.`,
    choices: [
      { text: "Intercambiar en términos justos", effect: { ammo: -1, food: +2, karma: +1, advanceMs: 90000 } },
      { text: "Ofrecer agua y mapas", effect: { water: -1, morale: +1, advanceMs: 90000 } },
      { text: "Rodear sin contacto", effect: { advanceMs: 60000 } },
    ],
  },
  {
    id: 519,
    title: "Taller de costuras",
    text:
`Una sastrería guarda telas gruesas, hilo y agujas.
Podríamos reforzar mochilas y mantas.
También fabricar brazaletes de identificación.
Cada puntada quita tiempo de otras tareas.
El maniquí del escaparate parece seguirnos con la mirada.`,
    choices: [
      { text: "Reforzar mochilas", effect: { materials: -1, morale: +1, advanceMs: 120000 } },
      { text: "Coser brazaletes visibles", effect: { materials: -1, threat: -1, advanceMs: 90000 } },
      { text: "Tomar solo hilo y agujas", effect: { materials: +1, advanceMs: 60000 } },
    ],
  },
  {
    id: 520,
    title: "Caja de herramientas pesada",
    text:
`En una camioneta oxidada hay una caja metálica.
Está cerrada con un candado frágil.
Forzarla puede torcer bisagras y hacer ruido.
Abrirla con paciencia requerirá tiempo.
El olor a grasa promete buenas noticias.`,
    choices: [
      { text: "Forzar con palanca", effect: { materials: +2, zombies: 1, advanceMs: 90000 } },
      { text: "Abrir con calma", effect: { materials: +2, threat: -1, advanceMs: 150000 } },
      { text: "Cargarla al campamento", effect: { morale: +1, advanceMs: 150000 } },
    ],
  },
  {
    id: 521,
    title: "Antena caída",
    text:
`Una antena de radio yace cruzada en la calle.
Podríamos repararla para mejorar alcance.
Cortarla en secciones da material para trampas.
Moverla requiere cuerdas y manos ocupadas.
Nubes bajas cierran la tarde temprano.`,
    choices: [
      { text: "Reparar base y elevar", effect: { materials: -2, morale: +1, advanceMs: 150000 } },
      { text: "Cortar en segmentos útiles", effect: { materials: +2, advanceMs: 120000 } },
      { text: "Marcar y rodear", effect: { advanceMs: 60000 } },
    ],
  },
  {
    id: 522,
    title: "Enjambre de mosquitos",
    text:
`El canal cercano despierta un enjambre voraz.
Las picaduras traen fiebre y mal dormir.
Podemos tratar agua estancada y fumigar.
O reforzar mosquiteros en el dormitorio común.
El zumbido vuelve locas a las guardias.`,
    choices: [
      { text: "Fumigar con cuidado", effect: { fuel: -1, threat: -1, advanceMs: 120000 } },
      { text: "Reforzar mosquiteros", effect: { materials: -1, morale: +1, advanceMs: 90000 } },
      { text: "Aguantar y trabajar dentro", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 523,
    title: "Cable de alta tensión",
    text:
`Un cable caído chispea en el cruce principal.
Cortar el paso mantiene a salvo a los niños.
Reparar brinda energía para unas horas más.
Tocar mal implica quemaduras serias.
Los guantes gruesos están gastados.`,
    choices: [
      { text: "Aislar zona y señalizar", effect: { threat: -1, advanceMs: 60000 } },
      { text: "Intentar reparación", effect: { materials: -1, fuel: -1, morale: +1, advanceMs: 150000 } },
      { text: "Rodear y olvidarse", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 524,
    title: "Sótano con ruido de tuberías",
    text:
`El edificio vibra con golpes en tuberías viejas.
Podría ser aire atrapado o alguien queriendo entrar.
Abrir registro permite examinar la red.
Sellar reduce ruido pero complica agua.
El eco devuelve cada respiración.`,
    choices: [
      { text: "Abrir y revisar", effect: { materials: -1, threat: -1, advanceMs: 120000 } },
      { text: "Sellar por fuera", effect: { materials: -1, advanceMs: 90000 } },
      { text: "Ignorar y subir presión", effect: { water: +1, zombies: 1, advanceMs: 60000 } },
    ],
  },
  {
    id: 525,
    title: "Carteles contradictorios",
    text:
`Dos flechas pintadas señalan direcciones opuestas a “zona segura”.
Una es reciente, otra muy vieja y lavada por la lluvia.
La gente del barrio jura que antes iban por la vieja.
Hoy, nadie está seguro de nada.
El mapa no ayuda mucho con los derrumbes.`,
    choices: [
      { text: "Seguir la flecha reciente", effect: { zombies: 2, food: +1, advanceMs: 150000 } },
      { text: "Seguir la vieja y lenta", effect: { threat: -1, advanceMs: 150000 } },
      { text: "No seguir ninguna y volver", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 526,
    title: "Mástil con cuerda útil",
    text:
`En el patio de una escuela queda un mástil con cuerda náutica.
La cuerda serviría para bajar al subterráneo.
Cortarla deja el mástil inservible para señales.
Nadie responde si se agita la bandera.
El tiempo del día se nos va entre manos.`,
    choices: [
      { text: "Cortar y llevar", effect: { materials: +1, advanceMs: 90000 } },
      { text: "Dejar y usar para señales", effect: { threat: -1, advanceMs: 60000 } },
      { text: "Cambiar por cuerda vieja", effect: { materials: -1, karma: +1, advanceMs: 120000 } },
    ],
  },
  {
    id: 527,
    title: "Cazadores de ratas",
    text:
`Un grupo vecino ofrece ratas limpias como alimento.
Juran que son seguras si se cocinan bien.
A cambio piden munición y sales.
La idea divide al grupo en asco y pragmatismo.
El fuego del fogón ya está encendido.`,
    choices: [
      { text: "Aceptar intercambio", effect: { ammo: -1, food: +2, advanceMs: 90000 } },
      { text: "Negociar por menos costo", effect: { ammo: -1, food: +1, morale: +1, advanceMs: 120000 } },
      { text: "Rechazar cortésmente", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 528,
    title: "Cajas con etiquetas rotas",
    text:
`En un almacén hay cajas sin etiquetas legibles.
Podrían ser tornillos… o pesticidas.
Abrir una por una toma la mañana.
Llevarlas sin saber pesa y arriesga.
El polvillo arde en la nariz.`,
    choices: [
      { text: "Abrir y clasificar", effect: { materials: +2, advanceMs: 150000 } },
      { text: "Tomar solo lo metálico", effect: { materials: +1, advanceMs: 90000 } },
      { text: "Cerrar y sellar por seguridad", effect: { threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 529,
    title: "Barricada floja",
    text:
`La entrada lateral cede con empujón fuerte.
Los clavos no agarraron bien la madera húmeda.
Reforzar ahora evita sustos nocturnos.
Pero quita manos a la salida de exploración.
La sierra está sin aceite.`,
    choices: [
      { text: "Reclavar y añadir listones", effect: { materials: -2, threat: -2, advanceMs: 120000 } },
      { text: "Trabar con muebles pesados", effect: { materials: -1, advanceMs: 90000 } },
      { text: "Dejar y poner alarma de latas", effect: { materials: -1, threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 530,
    title: "Ruidos en el alcantarillado",
    text:
`Desde una boca de tormenta llegan golpes huecos.
Podrían ser tuberías o algo que aprendió a bajar.
Bajar con luz implica riesgo de encierro.
Dejarlo así pone nerviosa a la guardia.
El eco confunde direcciones.`,
    choices: [
      { text: "Descender con cuerda y relevo", effect: { materials: -1, zombies: 2, advanceMs: 150000 } },
      { text: "Tapar y sellar por fuera", effect: { materials: -1, threat: -1, advanceMs: 90000 } },
      { text: "Tirar bengala y escuchar", effect: { fuel: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 531,
    title: "Ofertas de radio pirata",
    text:
`Una voz promete mapas y vacunas a cambio de “favores”.
Los términos son vagos y la señal fluctúa.
Responder compromete ubicación y recursos.
Ignorar puede cerrar una oportunidad única.
Los dedos tiemblan sobre el dial.`,
    choices: [
      { text: "Responder con preguntas", effect: { morale: 0, threat: +1, advanceMs: 90000 } },
      { text: "Pedir prueba de vida", effect: { karma: +1, advanceMs: 120000 } },
      { text: "Cortar transmisión", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 532,
    title: "Pila de neumáticos",
    text:
`La gomería guarda neumáticos apilados en buen estado.
Sirven para barricadas y ejercicios.
Moverlos cansa y ocupa medio patio.
Un vecino quiere dos para su puerta.
El cielo se aclara por primera vez en días.`,
    choices: [
      { text: "Armar barricada flexible", effect: { materials: -1, threat: -2, advanceMs: 120000 } },
      { text: "Donar dos al vecino", effect: { karma: +1, morale: +1, materials: -1, advanceMs: 90000 } },
      { text: "Vender por munición", effect: { ammo: +1, materials: -1, advanceMs: 90000 } },
    ],
  },
  {
    id: 533,
    title: "Gallinero improvisado",
    text:
`Dos gallinas aparecen en el solar de atrás.
Cazarlas promete huevos mañana.
También ruido y plumas por doquier.
Vecinos miran con demasiada atención.
La comida camina, pero no gratis.`,
    choices: [
      { text: "Construir cercado rápido", effect: { materials: -1, food: +1, morale: +1, advanceMs: 120000 } },
      { text: "Compartir huevos por vigilancia", effect: { food: +1, karma: +1, advanceMs: 90000 } },
      { text: "Soltarlas y seguir", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 534,
    title: "Taller de vidrio roto",
    text:
`Un taller de vitrales dejó pedazos filosos por el suelo.
Hay herramientas finas y estaño guardado.
Los cortes son casi inevitables sin guantes buenos.
Podemos barrer y preparar el área.
Cada paso cruje como alarma improvisada.`,
    choices: [
      { text: "Limpiar y registrar", effect: { materials: +2, medicine: -1, advanceMs: 150000 } },
      { text: "Tomar solo herramientas", effect: { materials: +1, advanceMs: 90000 } },
      { text: "Cerrar y marcar peligro", effect: { threat: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 535,
    title: "Mochila con iniciales",
    text:
`Una mochila tirada tiene iniciales bordadas.
Dentro hay cartas y un llavero pesado.
Podemos buscar a su dueño en edificios cercanos.
O quedarnos con lo útil y archivar el resto.
El sol cae por detrás de la fábrica.`,
    choices: [
      { text: "Buscar al dueño", effect: { karma: +2, morale: +1, advanceMs: 150000 } },
      { text: "Quedarse con lo útil", effect: { materials: +1, ammo: +1, karma: -1, advanceMs: 90000 } },
      { text: "Guardar en objetos perdidos", effect: { morale: +0, advanceMs: 60000 } },
    ],
  },
  {
    id: 536,
    title: "Camino de barricadas",
    text:
`La ruta hacia el mercado ahora tiene obstáculos nuevos.
Alguien más también quiere esa comida.
Quitar tablones abre paso, pero revela nuestras huellas.
Desviarnos costará luz y combustible.
El reloj apura más que la panza.`,
    choices: [
      { text: "Abrir paso quitando tablones", effect: { materials: -1, threat: +1, advanceMs: 120000 } },
      { text: "Desviar por la costanera", effect: { fuel: -1, advanceMs: 150000 } },
      { text: "Volver con más manos", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 537,
    title: "Farol que parpadea",
    text:
`El farol del patio falla intermitente.
Arreglarlo mejora vigilancia nocturna.
Pero consume piezas valiosas.
Podemos mover una lámpara portátil aquí.
O aceptar la oscuridad y reforzar guardias.`,
    choices: [
      { text: "Reparar circuito", effect: { materials: -1, threat: -1, advanceMs: 90000 } },
      { text: "Mover lámpara portátil", effect: { fuel: -1, threat: -1, advanceMs: 60000 } },
      { text: "Refuerzo de guardias", effect: { morale: -1, advanceMs: 90000 } },
    ],
  },
  {
    id: 538,
    title: "Pared con hueco oculto",
    text:
`Un azulejo flojo revela un hueco en la pared.
Dentro caben documentos y latas pequeñas.
Podría ser un alijo antiguo del barrio.
Si lo vaciamos, otro quedará sin su reserva.
La tentación pesa más que el deber.`,
    choices: [
      { text: "Vaciar por completo", effect: { food: +1, medicine: +1, ammo: +1, karma: -1, advanceMs: 90000 } },
      { text: "Tomar la mitad y dejar nota", effect: { food: +1, karma: +1, advanceMs: 90000 } },
      { text: "Sellar y avisar por radio", effect: { karma: +2, advanceMs: 60000 } },
    ],
  },
  {
    id: 539,
    title: "Cadena de frío rota",
    text:
`Un minimarket tiene freezer descongelado.
Algunas bolsas aún sirven si se cocinan hoy.
El olor atrae moscas y quizá algo peor.
Podemos cocinar en tanda grande.
O abandonar y buscar seco.`,
    choices: [
      { text: "Cocinar y repartir", effect: { food: +2, fuel: -1, advanceMs: 120000 } },
      { text: "Tomar solo lo seguro", effect: { food: +1, advanceMs: 90000 } },
      { text: "Dejar todo y cerrar", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 540,
    title: "Patio con pozo ciego",
    text:
`En el patio del colegio hay un pozo ciego abierto.
Alguien podría caer en la noche.
Taparlo exige tablas y tiempo.
Marcarlo con cuerdas ayuda un poco.
El eco huele a humedad y peligro.`,
    choices: [
      { text: "Tapar con tablones", effect: { materials: -2, threat: -1, advanceMs: 120000 } },
      { text: "Cercar con cuerdas y señales", effect: { materials: -1, advanceMs: 90000 } },
      { text: "Ignorar y advertir por voz", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 541,
    title: "Puerta con runas",
    text:
`Una puerta de metal luce símbolos pintados.
Podrían ser marca de un grupo o superstición.
Detrás se oyen golpes sordos.
Abrir hoy, o dejar para mañana con más manos.
El viento trae polvo de la avenida.`,
    choices: [
      { text: "Abrir con escudo", effect: { materials: -1, zombies: 2, advanceMs: 120000 } },
      { text: "Observar toda la tarde", effect: { threat: -1, advanceMs: 150000 } },
      { text: "Marcar y sellar", effect: { materials: -1, advanceMs: 90000 } },
    ],
  },
  {
    id: 542,
    title: "Furgón policial",
    text:
`Un furgón yace de lado con puertas traseras cerradas.
Dentro podría haber chalecos y munición.
Forzar cerradura será ruidoso.
Llevar herramientas pide otra vuelta.
La sirena rota aún parpadea al sol.`,
    choices: [
      { text: "Forzar y registrar", effect: { ammo: +1, materials: +1, zombies: 3, advanceMs: 150000 } },
      { text: "Marcar y volver equipados", effect: { threat: -1, advanceMs: 120000 } },
      { text: "Ignorar por hoy", effect: { morale: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 543,
    title: "Colegio con refugio civil",
    text:
`Carteles viejos indican refugio en el subsuelo.
Si aún tiene víveres, cambiaría nuestra semana.
Bajar implica pasillos largos y eco traicionero.
Los niños del barrio cuentan historias de allí.
La curiosidad compite con el miedo.`,
    choices: [
      { text: "Bajar en formación", effect: { food: +1, water: +1, zombies: 3, advanceMs: 150000 } },
      { text: "Mapear entradas y salidas", effect: { threat: -1, advanceMs: 120000 } },
      { text: "Sellar por hoy", effect: { advanceMs: 60000 } },
    ],
  },
  {
    id: 544,
    title: "Cuarto con cierre oxidado",
    text:
`Una bodega pequeña tiene candado a punto de romper.
Dentro suena algo arrastrándose.
Abrir ahora implica sorpresa segura.
Dejarlo podría liberar algo en la noche.
El aire aquí es más frío.`,
    choices: [
      { text: "Abrir y limpiar", effect: { materials: +1, zombies: 2, advanceMs: 120000 } },
      { text: "Asegurar con barra y sellar", effect: { materials: -1, threat: -1, advanceMs: 90000 } },
      { text: "Desviar a patrulla vecina", effect: { karma: -1, advanceMs: 60000 } },
    ],
  },
  {
    id: 545,
    title: "Discusión por raciones",
    text:
`El conteo de raciones no cuadra con el registro.
Alguien tomó comida de más o hubo error.
Ventilarlo hoy evita resentimientos mañana.
Apagarlo genera murmullos peligrosos.
Los estómagos mandan más que los votos.`,
    choices: [
      { text: "Auditar y redistribuir", effect: { morale: +1, advanceMs: 120000 } },
      { text: "Aumentar ración de trabajo", effect: { food: -1, morale: +1, advanceMs: 90000 } },
      { text: "Callar y seguir", effect: { morale: -2, karma: -1, advanceMs: 60000 } },
    ],
  },
];
