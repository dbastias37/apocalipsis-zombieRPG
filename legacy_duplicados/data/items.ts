export type ItemKind = 'arma' | 'material' | 'util' | 'medico';

export interface GameItem {
  id: string;
  name: string;
  kind: ItemKind;
  note?: string;
  ammoBonus?: number;
  materialsBonus?: number;
}

export const ITEMS_CATALOG: GameItem[] = [
  { id: 'pistola9',       name: 'Pistola 9mm', kind: 'arma', note: 'Ligera y fiable', ammoBonus: 8 },
  { id: 'revolver38',     name: 'Revólver .38', kind: 'arma', note: 'Potente, recarga lenta', ammoBonus: 6 },
  { id: 'escopeta',       name: 'Escopeta', kind: 'arma', note: 'Devastadora a corta distancia', ammoBonus: 6 },
  { id: 'rifle_caza',     name: 'Rifle de caza', kind: 'arma', note: 'Preciso', ammoBonus: 6 },
  { id: 'rifle_asalto',   name: 'Rifle de asalto', kind: 'arma', note: 'Capacidad y cadencia', ammoBonus: 12 },
  { id: 'smg',            name: 'Subfusil', kind: 'arma', note: 'Compacto, rápido', ammoBonus: 12 },
  { id: 'francotirador',  name: 'Rifle francotirador', kind: 'arma', note: 'Alcance superior', ammoBonus: 5 },
  { id: 'arco',           name: 'Arco compuesto', kind: 'arma', note: 'Silencioso' },
  { id: 'ballesta',       name: 'Ballesta', kind: 'arma', note: 'Letal y discreta' },
  { id: 'machete',        name: 'Machete', kind: 'arma', note: 'Corta y abre paso' },
  { id: 'cuchillo',       name: 'Cuchillo táctico', kind: 'arma', note: 'Siempre útil' },
  { id: 'hacha',          name: 'Hacha', kind: 'arma', note: 'Herramienta y arma' },
  { id: 'lanza',          name: 'Lanza improvisada', kind: 'arma', note: 'Alcance básico' },
  { id: 'garrote',        name: 'Garrote reforzado', kind: 'arma', note: 'Golpes contundentes' },
  { id: 'escudo',         name: 'Escudo improvisado', kind: 'material', note: 'Defensa básica' },
  { id: 'chaleco',        name: 'Chaleco acolchado', kind: 'material', note: 'Mitiga daño' },
  { id: 'placas',         name: 'Placas metálicas', kind: 'material', note: 'Refuerzo de campamento', materialsBonus: 5 },
  { id: 'alambre',        name: 'Rollo de alambre', kind: 'material', note: 'Trampas y cercos', materialsBonus: 4 },
  { id: 'clavos',         name: 'Caja de clavos', kind: 'material', note: 'Construcción', materialsBonus: 5 },
  { id: 'tablas',         name: 'Listones y tablas', kind: 'material', note: 'Barricadas', materialsBonus: 6 },
  { id: 'herramientas',   name: 'Kit de herramientas', kind: 'util', note: 'Reparaciones rápidas' },
  { id: 'linterna',       name: 'Linterna', kind: 'util', note: 'Ver en la oscuridad' },
  { id: 'radio',          name: 'Radio de onda corta', kind: 'util', note: 'Comunicación' },
  { id: 'brujula',        name: 'Brújula', kind: 'util', note: 'Orientación' },
  { id: 'mapa',           name: 'Mapa local', kind: 'util', note: 'Rutas seguras' },
  { id: 'cuerda',         name: 'Cuerda resistente', kind: 'util', note: 'Escalar/atar' },
  { id: 'mochila',        name: 'Mochila reforzada', kind: 'util', note: 'Más capacidad' },
  { id: 'cantimplora',    name: 'Cantimplora', kind: 'util', note: 'Agua en ruta' },
  { id: 'kit_cocina',     name: 'Kit de cocina', kind: 'util', note: 'Raciones calientes' },
  { id: 'filtros',        name: 'Filtros de agua', kind: 'util', note: 'Purificación' },
  { id: 'potabiliz',      name: 'Pastillas potabilizadoras', kind: 'util', note: 'Emergencia' },
  { id: 'botiquin',       name: 'Botiquín grande', kind: 'medico', note: 'Curación y vendajes' },
  { id: 'vendas',         name: 'Vendas y gasas', kind: 'medico', note: 'Estabiliza heridas' },
  { id: 'analges',        name: 'Analgésicos', kind: 'medico', note: 'Calma el dolor' },
  { id: 'antibioticos',   name: 'Antibióticos', kind: 'medico', note: 'Trata infecciones' },
  { id: 'antiseptico',    name: 'Antiséptico', kind: 'medico', note: 'Desinfecta' },
  { id: 'termica',        name: 'Manta térmica', kind: 'util', note: 'Contra el frío' },
  { id: 'toldo',          name: 'Toldo reforzado', kind: 'util', note: 'Refugio ligero' },
  { id: 'martillo',       name: 'Martillo', kind: 'material', note: 'Construcción básica', materialsBonus: 2 },
  { id: 'destorn',        name: 'Destornilladores', kind: 'material', note: 'Reparaciones simples', materialsBonus: 2 },
];

export function getItemById(id?: string) {
  return ITEMS_CATALOG.find(it => it.id === id);
}
