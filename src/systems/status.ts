export type ConditionId = 'bleeding'|'infected'|'stunned';
export type ConditionInfo = {
  id: ConditionId;
  turnsLeft?: number;
  intensity?: number;
  persistent?: boolean;
  // Para infección con cuenta atrás opcional
  expiresAtMs?: number;
};
export type Conditions = Partial<Record<ConditionId, ConditionInfo>>;

export function hasCondition(c: Conditions|undefined, id: ConditionId){ return !!c && !!c[id]; }
export function addCondition(c: Conditions|undefined, info: ConditionInfo): Conditions { return { ...(c ?? {}), [info.id]: info }; }
export function removeCondition(c: Conditions|undefined, id: ConditionId): Conditions { const n={...(c??{})}; delete n[id]; return n; }

// INICIO DE TURNO: solo mensajes de estado y bloqueo de acción
export function applyStartOfTurnConditions(
  actor:{name:string;maxHp:number;hp:number;conditions?:Conditions},
  log:(s:string)=>void
){
  let skipAction=false; let newC:Conditions={...(actor.conditions??{})};

  const st=newC.stunned;
  if(st){
    log(`😵 ${actor.name} está aturdido y pierde este turno.`);
    skipAction=true;
    if(typeof st.turnsLeft==='number'){
      const tl=Math.max(0,st.turnsLeft-1);
      newC = tl===0 ? removeCondition(newC,'stunned') : addCondition(newC,{...st,turnsLeft:tl});
    }else{
      newC = removeCondition(newC,'stunned');
    }
  }

  const inf=newC.infected;
  if(inf){
    log(`🧪 ${actor.name} está infectado y no puede actuar hasta curarse.`);
    skipAction=true; // se gestiona muerte por temporizador fuera
  }

  // Sangrado NO hace daño aquí; solo avisamos si quieres
  if(newC.bleeding){
    log(`🩸 ${actor.name} sigue sangrando.`);
  }

  return { skipAction, newConditions:newC };
}

// FIN DE TURNO: daño de sangrado y mantenimiento
export function applyEndOfTurnConditions(
  actor:{name:string;maxHp:number;hp:number;conditions?:Conditions},
  log:(s:string)=>void
){
  let hpDelta=0; let newC:Conditions={...(actor.conditions??{})};

  const bleed=newC.bleeding;
  if(bleed){
    const dmg = 2; // fijo por diseño
    hpDelta -= dmg;
    log(`🩸 ${actor.name} pierde sangre (-${dmg} PV).`);
    // sangrado es persistente hasta curar; no se reduce solo
  }

  // infección no hace daño aquí (se maneja por expiración/curación)
  return { hpDelta, newConditions:newC };
}

export function cureCondition(c:Conditions|undefined, id:ConditionId){ return removeCondition(c,id); }
