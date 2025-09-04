const MELEE_MISS = [
  "¡${P} falla el golpe con ${W}!",
  "${P} balancea ${W}, pero ${E} esquiva a último segundo.",
  "${P} duda un instante y el golpe con ${W} no conecta.",
  "Un mal ángulo: ${P} no logra impactar con ${W}.",
  "¡${E} se aparta! ${P} falla con ${W}.",
  "El suelo resbala, ${P} pierde la postura y falla con ${W}.",
  "La guardia de ${E} detiene el ataque de ${P}.",
  "${P} golpea el aire; ${E} ya no estaba allí.",
  "Un bloqueo apresurado frena el ${W} de ${P}.",
  "${P} falla el ataque; ${E} se esconde entre sombras."
];

const RANGED_MISS = [
  "${P} dispara a ${E}, pero erra el tiro.",
  "El disparo de ${P} pasa zumbando junto a ${E}.",
  "¡Traba en ${W}! ${P} no puede disparar a tiempo.",
  "${P} apunta rápido; ${E} se cubre y el tiro falla.",
  "Viento cruzado: el disparo de ${P} no da en el blanco.",
  "${W} retrocede mal y el tiro de ${P} falla.",
  "Polvo en el cañón: ${P} pierde precisión.",
  "¡Clic! Munición mal alimentada en ${W}.",
  "El fogonazo desorienta y ${P} falla el disparo.",
  "${P} pierde línea de tiro; ${E} se oculta."
];

const HEAL_LINES = [
  "${P} se vende con medicina (+${V} PV).",
  "${P} aplica antiséptico y suturas (+${V} PV).",
  "${P} toma analgésicos y respira mejor (+${V} PV).",
  "${P} limpia la herida con cuidado (+${V} PV).",
  "${P} se estabiliza: pulso firme (+${V} PV).",
  "Manos firmes: ${P} se cura (+${V} PV).",
  "La compresa reduce el sangrado: ${P} (+${V} PV).",
  "Una inyección oportuna; ${P} mejora (+${V} PV).",
  "${P} cierra la herida y se recompone (+${V} PV).",
  "${P} administra dosis precisa: vigor recuperado (+${V} PV)."
];

const FLEE_LINES = [
  // 20 frases de huida
  "${P} se abre paso entre escombros y se aleja.",
  "${P} corre por un pasillo estrecho y escapa.",
  "${P} usa una puerta lateral y desaparece.",
  "${P} se desliza bajo un andamio y huye.",
  "Un salto por encima de un muro: ${P} se aleja.",
  "${P} se mezcla entre sombras y desaparece.",
  "Atajo improvisado: ${P} toma ventaja y se va.",
  "${P} tira distracción y gana distancia.",
  "${P} evita un zombi y cruza la valla.",
  "${P} escala una reja y se pierde de vista.",
  "Entre contenedores, ${P} se escurre y huye.",
  "Un giro brusco: ${P} rompe la línea de visión.",
  "${P} cierra una puerta y traba el pestillo.",
  "Pisadas rápidas; ${P} gana terreno.",
  "Un callejón oculto salva a ${P}.",
  "${P} cruza la calle en zigzag y escapa.",
  "Un salto a la azotea; ${P} se escabulle.",
  "${P} se cuela por una ventana rota.",
  "Con una voltereta, ${P} cae fuera del alcance.",
  "${P} desaparece detrás de un camión volcado."
];

const ENEMY_HIT = [
  "${E} embiste a ${P} (-${V} PV).",
  "${E} muerde el brazo de ${P} (-${V} PV).",
  "${E} derriba a ${P} de un empujón (-${V} PV).",
  "Uñas desgarran: ${E} hiere a ${P} (-${V} PV).",
  "Un zarpazo de ${E} alcanza a ${P} (-${V} PV).",
  "${E} golpea a ${P} con furia (-${V} PV).",
  "${E} muerde y no suelta: ${P} sufre (-${V} PV).",
  "Cabeza contra muro: ${E} aturde a ${P} (-${V} PV).",
  "${E} clava dientes en ${P} (-${V} PV).",
  "Con torpeza brutal, ${E} lastima a ${P} (-${V} PV)."
];

const ENEMY_MISS = [
  "${E} falla: ${P} se aparta.",
  "${E} tropieza y no alcanza a ${P}.",
  "${P} esquiva con un giro.",
  "${E} se estrella contra la pared.",
  "Un quiebre de cintura salva a ${P}.",
  "${P} interpone el antebrazo y resiste.",
  "${E} calcula mal la distancia.",
  "Un paso atrás y ${E} erra.",
  "${P} se agacha justo a tiempo.",
  "Ataque torpe de ${E}: falla."
];

function renderTpl(tpl: string, vars: Record<string,string|number>){
  return tpl
    .replaceAll("${P}", String(vars.P ?? "Jugador"))
    .replaceAll("${E}", String(vars.E ?? "Enemigo"))
    .replaceAll("${W}", String(vars.W ?? "arma"))
    .replaceAll("${V}", String(vars.V ?? ""));
}
function pick(arr: string[]){ return arr[Math.floor(Math.random()*arr.length)]; }

export { MELEE_MISS, RANGED_MISS, HEAL_LINES, FLEE_LINES, ENEMY_HIT, ENEMY_MISS, renderTpl, pick };
