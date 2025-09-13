export type TurnId = string;

export type TurnPhase = 'world' | 'combat';

export interface TurnActor { id: TurnId; hp: number; status?: 'alive'|'dead'|'out'; canCounter?: boolean }

export interface Encounter { enemies: TurnActor[]; active: boolean }

type Reaction = () => void | Promise<void>;

export function advanceTurn(order: TurnId[], actors: Record<TurnId, TurnActor>, current: number, skip?: Set<TurnId>): number {
  let idx = current;
  const len = order.length;
  for (let i = 0; i < len; i++) {
    idx = (idx + 1) % len;
    const act = actors[order[idx]];
    if (!act) continue;
    if (act.hp <= 0 || (act.status && act.status !== 'alive')) continue;
    if (skip && skip.has(act.id)) { skip.delete(act.id); continue; }
    return idx;
  }
  return current;
}

export class TurnSystem {
  private order: TurnId[];
  actors: Record<TurnId, TurnActor>;
  private idx = 0;
  private reactionQueue: Reaction[] = [];
  private pendingSkip: Set<TurnId> = new Set();
  private skipNextTurn: Set<TurnId> = new Set();
  private listeners: ((actor: TurnActor) => void)[] = [];
  private gateOpen = false;
  private _phase: TurnPhase = 'world';
  private _encounter: Encounter | null = null;

  constructor(order: TurnId[], actors: Record<TurnId, TurnActor>) {
    this.order = order;
    this.actors = actors;
  }

  get phase(): TurnPhase { return this._phase; }
  get encounter(): Encounter | null { return this._encounter; }

  currentActor(): TurnActor { return this.actors[this.order[this.idx]]; }

  onTurnChange(fn: (actor: TurnActor) => void): void { this.listeners.push(fn); }

  openTurnGate(index?: number): void { if (typeof index === 'number') this.idx = index % this.order.length; this.gateOpen = true; }
  startTurn(): void { this.gateOpen = false; }
  endTurn(): void { if (this.gateOpen) return; this.advanceTurn(); }

  beginCombat(enc: Encounter): void { this._encounter = enc; this._phase = 'combat'; }
  endCombat(): void { this._encounter = null; this._phase = 'world'; }
  tryFlee(): boolean { const ok = Math.random() < 0.5; if (ok) this.endCombat(); return ok; }

  async execute(action: () => void | Promise<void>): Promise<void> {
    try {
      await action();
      await this.processReactions();
    } finally {
      this.pendingSkip.forEach(id => {
        const actor = this.actors[id];
        if (actor && actor.hp > 0 && actor.status === 'alive') {
          this.skipNextTurn.add(id);
        }
      });
      this.pendingSkip.clear();
    }
  }

  enqueueReaction(r: Reaction): void { this.reactionQueue.push(r); }
  registerCounterAttack(defenderId: TurnId): void { this.pendingSkip.add(defenderId); }

  private async processReactions(): Promise<void> {
    while (this.reactionQueue.length) {
      const r = this.reactionQueue.shift()!;
      try { await r(); } catch { /* swallow */ }
    }
  }

  private advanceTurn(): void {
    this.idx = advanceTurn(this.order, this.actors, this.idx, this.skipNextTurn);
    const actor = this.currentActor();
    this.listeners.forEach(fn => fn(actor));
  }
}

