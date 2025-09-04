export type TplVars = { P?: string; E?: string; W?: string; D?: number; V?: number };

export function render(tpl: string, v: TplVars) {
  return tpl
    .replaceAll("${P}", v.P ?? "")
    .replaceAll("${E}", v.E ?? "")
    .replaceAll("${W}", v.W ?? "")
    .replaceAll("${D}", v.D != null ? String(v.D) : "")
    .replaceAll("${V}", v.V != null ? String(v.V) : "");
}
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- CATEGORIZACIÓN DE ARMAS PARA FRASES ---
export type WeaponFlavor =
  | "fists"
  | "melee_blade"
  | "melee_blunt"
  | "ranged_pistol"
  | "ranged_rifle"
  | "ranged_shotgun"
  | "ranged_smg"
  | "ranged_xbow"
  | "ranged_sling"
  | "melee_other"
  | "ranged_other";

const bladeIds = new Set(["knife","dagger","kukri","machete","katana","saw","sdriver","bottle","axe","faxe"]);
const bluntIds = new Set(["bat","nailbat","pipe","pipehd","hammer","wrench","crowbar","club","mace","shovel","pick","chain"]);
const pistolIds = new Set(["pistol"]);
const rifleIds = new Set(["rifle"]);
const shotgunIds = new Set(["shotgun"]);
const smgIds = new Set(["smg"]);
const xbowIds = new Set(["xbow"]);
const slingIds = new Set(["sling"]);

export function weaponFlavorFrom(id: string, name: string, type: "melee"|"ranged"): WeaponFlavor {
  const lid = (id || "").toLowerCase();
  const lname = (name || "").toLowerCase();
  if (lid === "fists" || lname.includes("puño")) return "fists";
  if (type === "melee") {
    if (bladeIds.has(lid) || /cuchi|machete|katana|sierra|daga|corte|hacha/.test(lname)) return "melee_blade";
    if (bluntIds.has(lid) || /bate|tubo|martillo|llave|palanca|garrote|maza|pala|pico|cadena/.test(lname)) return "melee_blunt";
    return "melee_other";
  } else {
    if (pistolIds.has(lid) || /pistol/.test(lname)) return "ranged_pistol";
    if (rifleIds.has(lid) || /rifle/.test(lname)) return "ranged_rifle";
    if (shotgunIds.has(lid) || /escopeta|shotgun/.test(lname)) return "ranged_shotgun";
    if (smgIds.has(lid) || /subfusil|smg/.test(lname)) return "ranged_smg";
    if (xbowIds.has(lid) || /ballesta|xbow/.test(lname)) return "ranged_xbow";
    if (slingIds.has(lid) || /honda/.test(lname)) return "ranged_sling";
    return "ranged_other";
  }
}

// --- FRASES DE ÉXITO (se añaden “colas” de estado si aplica) ---
export const HIT_FISTS = [
  "${P} suelta un puñetazo directo a ${E} (−${D}).",
  "Con los puños, ${P} impacta a ${E} (−${D}).",
  "${P} conecta un derechazo contra ${E} (−${D}).",
  "Golpe en corto: ${P} sacude a ${E} (−${D}).",
  "${P} martilla con los nudillos a ${E} (−${D}).",
  "Un gancho preciso de ${P} da a ${E} (−${D}).",
];

export const HIT_MELEE_BLADE = [
  "${P} corta a ${E} con ${W} (−${D}).",
  "${P} desliza ${W} y abre defensa de ${E} (−${D}).",
  "Filo certero: ${P} hiere a ${E} con ${W} (−${D}).",
  "${W} silba y alcanza a ${E} (−${D}).",
  "${P} asesta un tajo con ${W} (−${D}).",
  "Con ${W}, ${P} busca arterias y golpea (−${D}).",
];

export const HIT_MELEE_BLUNT = [
  "${P} descarga ${W} contra ${E} (−${D}).",
  "Golpe contundente: ${P} aplasta a ${E} con ${W} (−${D}).",
  "${W} cruje sobre ${E} (−${D}).",
  "Impacto seco de ${P} con ${W} en ${E} (−${D}).",
  "${P} balancea ${W} y tumba a ${E} (−${D}).",
  "Golpazo de ${W} directo a ${E} (−${D}).",
];

export const HIT_PISTOL = [
  "${P} dispara ${W} a ${E} (−${D}).",
  "Tiro controlado: ${P} impacta a ${E} con ${W} (−${D}).",
  "La bala de ${W} alcanza a ${E} (−${D}).",
  "Disparo limpio de ${P} con ${W} (−${D}).",
  "${P} aprieta el gatillo y hiere a ${E} (−${D}).",
];

export const HIT_RIFLE = [
  "${P} apunta con ${W} y perfora a ${E} (−${D}).",
  "Tiro a distancia: ${P} castiga a ${E} con ${W} (−${D}).",
  "El proyectil de ${W} atraviesa cobertura (−${D}).",
  "Disparo preciso de ${P} con ${W} (−${D}).",
  "Ráfaga controlada de ${W} contra ${E} (−${D}).",
];

export const HIT_SHOTGUN = [
  "${P} suelta una descarga de ${W} sobre ${E} (−${D}).",
  "Perdigones de ${W} muerden a ${E} (−${D}).",
  "A bocajarro: ${P} castiga con ${W} (−${D}).",
  "Trueno de ${W}: ${E} recibe impacto (−${D}).",
  "Escopetazo de ${P} que sacude a ${E} (−${D}).",
];

export const HIT_SMG = [
  "Ráfaga corta de ${W}: ${E} recibe plomo (−${D}).",
  "${P} barre con ${W} y alcanza a ${E} (−${D}).",
  "Control de retroceso: ${P} acierta con ${W} (−${D}).",
  "Corta ráfaga de ${W} contra ${E} (−${D}).",
  "Trac-trac de ${W}: ${E} es impactado (−${D}).",
];

export const HIT_XBOW = [
  "Un virote de ${W} alcanza a ${E} (−${D}).",
  "${P} tensa ${W} y clava en ${E} (−${D}).",
  "Silencio letal: ${W} impacta a ${E} (−${D}).",
  "Tiro certero de ${W}: ${E} sufre (−${D}).",
  "El virote se incrusta en ${E} (−${D}).",
];

export const HIT_SLING = [
  "Piedra de ${W} da en ${E} (−${D}).",
  "${P} suelta la honda y golpea a ${E} (−${D}).",
  "Proyectil improvisado con ${W} alcanza a ${E} (−${D}).",
  "Tiro de ${W} directo a ${E} (−${D}).",
  "La piedra rebota y hiere a ${E} (−${D}).",
];

// --- FRASES DE FALLO (10 cada una) ---
export const MISS_MELEE = [
  "¡${P} falla el golpe con ${W}!",
  "${P} balancea ${W}, pero ${E} esquiva a último segundo.",
  "${P} duda y el golpe con ${W} no conecta.",
  "Mal ángulo: ${P} no impacta con ${W}.",
  "¡${E} se aparta! ${P} falla con ${W}.",
  "El suelo resbala: ${P} pierde postura.",
  "La guardia de ${E} detiene a ${P}.",
  "${P} golpea el aire; ${E} ya no estaba allí.",
  "Un bloqueo apresurado frena el ${W} de ${P}.",
  "${P} erra el ataque; ${E} se oculta entre sombras.",
];

export const MISS_RANGED = [
  "${P} dispara ${W}, pero falla a ${E}.",
  "El tiro de ${P} pasa zumbando junto a ${E}.",
  "¡Traba en ${W}! ${P} no dispara a tiempo.",
  "${P} apunta; ${E} se cubre y el tiro falla.",
  "Viento cruzado: el disparo no da en el blanco.",
  "Retroceso de ${W}: el tiro se va alto.",
  "Polvo en el cañón: ${P} pierde precisión.",
  "¡Clic! Munición mal alimentada en ${W}.",
  "El fogonazo desorienta y ${P} falla.",
  "${P} pierde línea de tiro; ${E} se oculta.",
];

// --- COLAS DE ESTADO PARA AÑADIR CUANDO APLICA ---
export const TAIL_BLEED = [
  " Deja sangrando a ${E}.",
  " La herida abre sangrado en ${E}.",
  " ${E} comienza a sangrar.",
];
export const TAIL_STUN = [
  " ${E} queda aturdido.",
  " Impacto a la sien: ${E} se aturde.",
  " ${E} tambalea, aturdido.",
];
export const TAIL_INFECT = [
  " La infección se propaga en ${E}.",
  " Herida sucia: posible infección en ${E}.",
  " ${E} muestra signos de infección.",
];

// Selección por flavor
export function hitPhraseByFlavor(flavor: WeaponFlavor): string[] {
  switch (flavor) {
    case "fists": return HIT_FISTS;
    case "melee_blade": return HIT_MELEE_BLADE;
    case "melee_blunt": return HIT_MELEE_BLUNT;
    case "ranged_pistol": return HIT_PISTOL;
    case "ranged_rifle": return HIT_RIFLE;
    case "ranged_shotgun": return HIT_SHOTGUN;
    case "ranged_smg": return HIT_SMG;
    case "ranged_xbow": return HIT_XBOW;
    case "ranged_sling": return HIT_SLING;
    case "melee_other": return HIT_MELEE_BLUNT;
    case "ranged_other": return HIT_PISTOL;
    default: return HIT_FISTS;
  }
}

// --- FRASES ADICIONALES ---
export const HEAL_LINES = [
  "${P} se vende con medicina (+${V} PV).",
  "${P} aplica antiséptico y suturas (+${V} PV).",
  "${P} toma analgésicos y respira mejor (+${V} PV).",
  "${P} limpia la herida con cuidado (+${V} PV).",
  "${P} se estabiliza: pulso firme (+${V} PV).",
  "Manos firmes: ${P} se cura (+${V} PV).",
  "La compresa reduce el sangrado: ${P} (+${V} PV).",
  "Una inyección oportuna; ${P} mejora (+${V} PV).",
  "${P} cierra la herida y se recompone (+${V} PV).",
  "${P} administra dosis precisa: vigor recuperado (+${V} PV).",
];

export const FLEE_LINES = [
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
  "${P} desaparece detrás de un camión volcado.",
];
