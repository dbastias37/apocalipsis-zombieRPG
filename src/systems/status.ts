export type ConditionId = 'bleeding'|'infected'|'stunned';

export type ConditionInfo = {
  id: ConditionId;
  turnsLeft?: number;
  intensity?: number;
  persistent?: boolean;
};

export type Conditions = Partial<Record<ConditionId, ConditionInfo>>;

export function hasCondition(conds: Conditions|undefined, id: ConditionId){
  return !!conds && !!conds[id];
}

export function addCondition(conds: Conditions|undefined, c: ConditionInfo): Conditions {
  return { ...(conds ?? {}), [c.id]: c };
}

export function removeCondition(conds: Conditions|undefined, id: ConditionId): Conditions {
  if(!conds) return {};
  const nc = { ...conds }; delete nc[id];
  return nc;
}

export function applyStartOfTurnConditions(
  actor: { name: string; maxHp: number; hp: number; conditions?: Conditions },
  log: (s:string)=>void
): { skipAction: boolean; newConditions: Conditions } {
  let skipAction = false;
  let newConds: Conditions = { ...(actor.conditions ?? {}) };

  const st = newConds.stunned;
  if (st) {
    if (Math.random() < 0.25) {
      log(`😵 ${actor.name} está aturdido y no logra actuar este turno.`);
      skipAction = true;
    }
    if (typeof st.turnsLeft === 'number') {
      const tl = Math.max(0, st.turnsLeft - 1);
      if (tl === 0) newConds = removeCondition(newConds, 'stunned');
      else newConds = addCondition(newConds, { ...st, turnsLeft: tl });
    }
  }

  return { skipAction, newConditions: newConds };
}

export function applyEndOfTurnConditions(
  actor: { name: string; maxHp: number; hp: number; conditions?: Conditions },
  log: (s:string)=>void
): { hpDelta: number; newConditions: Conditions } {
  let hpDelta = 0;
  let newConds: Conditions = { ...(actor.conditions ?? {}) };

  const bleed = newConds.bleeding;
  if (bleed) {
    const dmg = Math.max(1, Math.floor(actor.maxHp / 16));
    hpDelta -= dmg;
    log(`🩸 ${actor.name} sangra (-${dmg} PV).`);
    if (typeof bleed.turnsLeft === 'number') {
      const tl = Math.max(0, bleed.turnsLeft - 1);
      if (tl === 0) newConds = removeCondition(newConds, 'bleeding');
      else newConds = addCondition(newConds, { ...bleed, turnsLeft: tl });
    }
  }

  const inf = newConds.infected;
  if (inf) {
    const dmg = Math.max(1, Math.floor(actor.maxHp / 8));
    hpDelta -= dmg;
    log(`🧪 La infección avanza en ${actor.name} (-${dmg} PV).`);
  }

  return { hpDelta, newConditions: newConds };
}

export function cureCondition(conds: Conditions|undefined, id: ConditionId): Conditions {
  return removeCondition(conds, id);
}
