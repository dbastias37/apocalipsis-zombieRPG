import type { StoryCard } from "@/data/storyCards";
import type { CombatCard } from "@/data/combatCards";

/**
 * Tipo unificado de carta (decisión morada o combate roja).
 * Ambas comparten firma de `choices` y `effect` para que
 * el motor pueda procesarlas por la misma ruta.
 */
export type AnyCard = StoryCard | CombatCard;

export type ChoiceEffect = {
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

export type DeckState = {
  /** IDs en orden de robo (top = final del array para pop rápido) */
  drawPile: number[];
  /** IDs descartados (top = final del array) */
  discardPile: number[];
};

export type DeckBundle = {
  /** Índice por ID para acceso O(1) a la carta */
  byId: Record<number, AnyCard>;
  /** Todos los IDs posibles del mazo (inmutable) */
  allIds: number[];
  /** Estado mutable del mazo (robo/descartes) */
  state: DeckState;
};

/* Utilidad Fisher–Yates (in-place) */
function shuffleInPlace<T>(arr: T[], rng: () => number = Math.random): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Crea un índice por ID para un arreglo de cartas */
function indexById(cards: AnyCard[]): Record<number, AnyCard> {
  return cards.reduce<Record<number, AnyCard>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});
}

/**
 * Crea un mazo a partir de cartas, con barajado inicial.
 * - `excludeIds`: IDs que NO deben entrar al drawPile (opcional).
 * - `seededRng`: RNG inyectable para tests (opcional).
 */
export function createDeck(
  cards: AnyCard[],
  opts?: { excludeIds?: number[]; seededRng?: () => number }
): DeckBundle {
  const exclude = new Set<number>(opts?.excludeIds ?? []);
  const byId = indexById(cards);
  const allIds = cards.map((c) => c.id);

  const drawPile = cards
    .map((c) => c.id)
    .filter((id) => !exclude.has(id));

  // Barajar
  shuffleInPlace(drawPile, opts?.seededRng);

  return {
    byId,
    allIds,
    state: { drawPile, discardPile: [] },
  };
}

/** Devuelve true si el mazo está sin cartas para robar */
export function isEmpty(deck: DeckBundle): boolean {
  return deck.state.drawPile.length === 0;
}

/**
 * Roba UNA carta.
 * - Si el mazo está vacío y hay descartes, re-integra y baraja automáticamente.
 * - Devuelve la carta (o undefined si no hay ninguna) y el estado mutado del mazo.
 */
export function drawOne(deck: DeckBundle, rng?: () => number): AnyCard | undefined {
  if (deck.state.drawPile.length === 0 && deck.state.discardPile.length > 0) {
    reintegrateDiscards(deck, rng);
  }
  const id = deck.state.drawPile.pop();
  if (id == null) return undefined;
  return deck.byId[id];
}

/** Descarta una carta por ID (la pone en la cima de descartes). */
export function discardById(deck: DeckBundle, id: number): void {
  // Evitar duplicados accidentales si ya estuviera en descartes
  const top = deck.state.discardPile[deck.state.discardPile.length - 1];
  if (top !== id) deck.state.discardPile.push(id);
}

/** Baraja el drawPile actual sin tocar descartes. */
export function shuffleDrawPile(deck: DeckBundle, rng?: () => number): void {
  shuffleInPlace(deck.state.drawPile, rng);
}

/**
 * Reintegra descartes al mazo:
 * - Mueve TODO discardPile a drawPile
 * - Vacía descartes
 * - Baraja drawPile
 */
export function reintegrateDiscards(deck: DeckBundle, rng?: () => number): void {
  if (deck.state.discardPile.length === 0) return;
  deck.state.drawPile.push(...deck.state.discardPile);
  deck.state.discardPile.length = 0;
  shuffleInPlace(deck.state.drawPile, rng);
}

/**
 * Reinicia el mazo a estado completo:
 * - drawPile = todos los IDs (menos los opcionalmente excluidos)
 * - discardPile = []
 * - barajado
 */
export function resetDeck(
  deck: DeckBundle,
  opts?: { excludeIds?: number[]; seededRng?: () => number }
): void {
  const exclude = new Set<number>(opts?.excludeIds ?? []);
  deck.state.drawPile = deck.allIds.filter((id) => !exclude.has(id));
  deck.state.discardPile = [];
  shuffleInPlace(deck.state.drawPile, opts?.seededRng);
}

/**
 * Quita un ID específico de donde esté (robo/descartes).
 * Útil si quieres “retirar” temporalmente una carta del mazo.
 */
export function removeCard(deck: DeckBundle, id: number): void {
  deck.state.drawPile = deck.state.drawPile.filter((x) => x !== id);
  deck.state.discardPile = deck.state.discardPile.filter((x) => x !== id);
}

/**
 * Inserta una carta al fondo del mazo (útil para “postergar” una carta).
 */
export function putOnBottom(deck: DeckBundle, id: number): void {
  // Asegura no duplicar
  removeCard(deck, id);
  deck.state.drawPile.unshift(id);
}

/**
 * Crea dos mazos separados a partir de las barajas de datos:
 * - `stories` moradas (decisión)
 * - `combats` rojas
 * Permite excluir IDs ya utilizados si se desea.
 */
export function createDualDecks(
  stories: StoryCard[],
  combats: CombatCard[],
  opts?: { excludeStoryIds?: number[]; excludeCombatIds?: number[]; seededRng?: () => number }
): { storyDeck: DeckBundle; combatDeck: DeckBundle } {
  const storyDeck = createDeck(stories, {
    excludeIds: opts?.excludeStoryIds,
    seededRng: opts?.seededRng,
  });
  const combatDeck = createDeck(combats, {
    excludeIds: opts?.excludeCombatIds,
    seededRng: opts?.seededRng,
  });
  return { storyDeck, combatDeck };
}

/**
 * Dado un mazo y un ID, devuelve la carta (segura).
 */
export function getCard(deck: DeckBundle, id: number): AnyCard | undefined {
  return deck.byId[id];
}

/**
 * Convierte una carta en un “preview DTO” mínimo para UI.
 * Útil si quieres listar sin cargar todo el objeto.
 */
export function toPreview(card: AnyCard) {
  return {
    id: card.id,
    category: card.category,
    title: card.title,
  };
}

/**
 * Helpers de categoría para UI
 */
export function isStory(card: AnyCard): card is StoryCard {
  return card.category === "story";
}
export function isCombat(card: AnyCard): card is CombatCard {
  return card.category === "combat";
}
