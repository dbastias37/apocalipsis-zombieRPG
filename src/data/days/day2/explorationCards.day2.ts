import type { ExplorationCard } from "../../explorationCards";

export const day2ExplorationCards: ExplorationCard[] = [
  { id: 401, title: "Ferretería cerrada", text: "La persiana cede con palanca. Estantes a medias, olor a óxido.", loot:{ materials:2 }, threat:0, zombies:1, advanceMs:120000 },
  { id: 402, title: "Mini mercado húmedo", text: "Pisos encharcados, latas abolladas, ratas huyendo.", loot:{ food:1, water:1 }, zombies:2, advanceMs:120000 },
  { id: 403, title: "Azotea con tanque", text: "Queda agua verdosa. Con filtro, algo sirve.", loot:{ water:2, materials:-1 }, zombies:0, advanceMs:90000 },
  { id: 404, title: "Paradero de buses", text: "Bolsos olvidados entre asientos. Cristales rotos.", loot:{ medicine:1, materials:1 }, zombies:2, advanceMs:120000 },
  { id: 405, title: "Depósito de bebidas", text: "Puerta forzada a medias. Zumbido de moscas.", loot:{ water:3 }, zombies:3, advanceMs:150000 },
  { id: 406, title: "Kiosco blindado", text: "Pequeña caja fuerte en el piso.", loot:{ ammo:1, materials:1 }, zombies:2, advanceMs:120000 },
  { id: 407, title: "Taller con bidones", text: "Huele a combustible viejo. Aún queda algo útil.", loot:{ fuel:2 }, zombies:1, advanceMs:90000 },
  { id: 408, title: "Casa con botiquín", text: "Cajón con vendas y pastillas vencidas; varias sirven.", loot:{ medicine:2 }, zombies:1, advanceMs:90000 },
  { id: 409, title: "Patio con huerta", text: "Verduras pequeñas y herramientas oxidadas.", loot:{ food:1, materials:1 }, zombies:1, advanceMs:90000 },
  { id: 410, title: "Callejón con bolsos", text: "Se oyen pasos lejanos. Registrar rápido.", loot:{ materials:1, ammo:1 }, zombies:2, advanceMs:90000 },
  { id: 411, title: "Oficina abandonada", text: "Cajones con pilas y cinta adhesiva.", loot:{ materials:2 }, zombies:0, advanceMs:90000 },
  { id: 412, title: "Supermercado pequeño", text: "Cajas tiradas, cámaras rotas. Algo queda en depósito.", loot:{ food:2, water:1 }, zombies:3, advanceMs:150000 },
  { id: 413, title: "Farmacia saqueada", text: "Detrás del mostrador hay un alijo olvidado.", loot:{ medicine:2 }, zombies:2, advanceMs:120000 },
  { id: 414, title: "Parque con alijo enterrado", text: "Tierra removida fresca.", loot:{ food:1, ammo:1, materials:1 }, zombies:1, advanceMs:120000 },
  { id: 415, title: "Departamento tapiado", text: "Ventanas selladas, puerta floja.", loot:{ food:1, water:1, medicine:1 }, zombies:2, advanceMs:150000 },
  { id: 416, title: "Bodega de barrio", text: "Cajas de vidrio y madera. Olor a vino rancio.", loot:{ materials:2, water:1 }, zombies:1, advanceMs:120000 },
  { id: 417, title: "Gomería", text: "Cauchos, mangueras y parches útiles.", loot:{ materials:2 }, zombies:0, advanceMs:90000 },
  { id: 418, title: "Comedor escolar", text: "Bolsas de porotos y arroz a medias.", loot:{ food:3 }, zombies:2, advanceMs:150000 },
  { id: 419, title: "Patio con tanque de gas", text: "Queda poca presión, pero alcanza.", loot:{ fuel:1, materials:1 }, zombies:1, advanceMs:90000 },
  { id: 420, title: "Auto con guantera llena", text: "Linterna, pilas y un cargador solar roto.", loot:{ materials:1, ammo:1 }, zombies:1, advanceMs:90000 },
];
