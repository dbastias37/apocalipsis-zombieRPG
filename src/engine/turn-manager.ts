export interface TurnActor { id: string; hp: number; status?: string; canCounter?: boolean };

export type Reaction = () => void | Promise<void>;

/**
 * Avanza el indice al siguiente actor vivo en el orden dado.
 * Ignora actores con hp <= 0 o status 'dead'/'out'.
 */
export function advanceTurn(order: string[], actors: Record<string, TurnActor>, current: number): number {
  let idx = current;
  const len = order.length;
  for (let i = 0; i < len; i++) {
    idx = (idx + 1) % len;
    const act = actors[order[idx]];
    if (act && act.hp > 0 && act.status !== 'dead' && act.status !== 'out') {
      return idx;
    }
  }
  return current;
}

/** Gestor de turnos con cola de reacciones.
 * Todas las acciones (y sus reacciones) terminan con un único avance de turno.
 */
export class TurnManager {
  private order: string[];
  actors: Record<string, TurnActor>;
  private idx: number;
  private reactionQueue: Reaction[] = [];
  private turnLock = false;
  private listeners: ((actor: TurnActor) => void)[] = [];

  constructor(order: string[], actors: Record<string, TurnActor>, current = 0) {
    this.order = order;
    this.actors = actors;
    this.idx = current;
  }

  currentActor(): TurnActor {
    return this.actors[this.order[this.idx]];
  }

  onTurnChange(fn: (actor: TurnActor) => void) {
    this.listeners.push(fn);
  }

  enqueueReaction(r: Reaction) {
    this.reactionQueue.push(r);
  }

  private async processReactions() {
    while (this.reactionQueue.length) {
      const r = this.reactionQueue.shift()!;
      try {
        await r();
      } catch {
        // swallow errors to guarantee turn advance
      }
    }
  }

  async execute(action: () => void | Promise<void>) {
    if (this.turnLock) return;
    this.turnLock = true;
    try {
      await action();
      await this.processReactions();
    } finally {
      this.turnLock = false;
      this.idx = advanceTurn(this.order, this.actors, this.idx);
      const actor = this.currentActor();
      this.listeners.forEach(fn => fn(actor));
    }
  }
}
