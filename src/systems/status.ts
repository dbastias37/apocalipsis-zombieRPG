export type ConditionId = 'bleeding'|'infected'|'stunned';
export type ConditionInfo = { id: ConditionId; turnsLeft?: number; intensity?: number; persistent?: boolean; };
export type Conditions = Partial<Record<ConditionId, ConditionInfo>>;

export function hasCondition(c: Conditions|undefined, id: ConditionId){ return !!c && !!c[id]; }
export function addCondition(c: Conditions|undefined, info: ConditionInfo): Conditions { return { ...(c ?? {}), [info.id]: info }; }
export function removeCondition(c: Conditions|undefined, id: ConditionId): Conditions { const n={...(c??{})}; delete n[id]; return n; }

export function applyStartOfTurnConditions(actor:{name:string;maxHp:number;hp:number;conditions?:Conditions}, log:(s:string)=>void){
  let skipAction=false; let newC:Conditions={...(actor.conditions??{})};
  const st=newC.stunned;
  if(st){ if(Math.random()<0.25){ log(`😵 ${actor.name} está aturdido y no logra actuar este turno.`); skipAction=true; }
    if(typeof st.turnsLeft==='number'){ const tl=Math.max(0,st.turnsLeft-1); newC=tl===0?removeCondition(newC,'stunned'):addCondition(newC,{...st,turnsLeft:tl}); } }
  return { skipAction, newConditions:newC };
}

export function applyEndOfTurnConditions(actor:{name:string;maxHp:number;hp:number;conditions?:Conditions}, log:(s:string)=>void){
  let hpDelta=0; let newC:Conditions={...(actor.conditions??{})};
  const bleed=newC.bleeding; if(bleed){ const dmg=Math.max(1,Math.floor(actor.maxHp/16)); hpDelta-=dmg; log(`🩸 ${actor.name} sangra (-${dmg} PV).`);
    if(typeof bleed.turnsLeft==='number'){ const tl=Math.max(0,bleed.turnsLeft-1); newC=tl===0?removeCondition(newC,'bleeding'):addCondition(newC,{...bleed,turnsLeft:tl}); } }
  const inf=newC.infected; if(inf){ const dmg=Math.max(1,Math.floor(actor.maxHp/8)); hpDelta-=dmg; log(`🧪 La infección avanza en ${actor.name} (-${dmg} PV).`); }
  return { hpDelta, newConditions:newC };
}

export function cureCondition(c:Conditions|undefined, id:ConditionId){ return removeCondition(c,id); }
