export type ConditionId = 'bleeding'|'infected'|'stunned';
export type ConditionInfo = {
  id: ConditionId;
  turnsLeft?: number;
  intensity?: number;
  persistent?: boolean;
  // NUEVO: para infección con cuenta atrás en ms (epoch ms)
  expiresAtMs?: number;
};
export type Conditions = Partial<Record<ConditionId, ConditionInfo>>;

export function hasCondition(c: Conditions|undefined, id: ConditionId){ return !!c && !!c[id]; }
export function addCondition(c: Conditions|undefined, info: ConditionInfo): Conditions { return { ...(c ?? {}), [info.id]: info }; }
export function removeCondition(c: Conditions|undefined, id: ConditionId): Conditions { const n={...(c??{})}; delete n[id]; return n; }

// Al inicio de turno:
// - stunned: salta turno (1 turno) y decrece turnsLeft
// - infected: deshabilita actuar mientras dure (se gestiona muerte por temporizador fuera)
// - bleeding: no bloquea actuar, pero causa -2 HP al INICIO del turno
export function applyStartOfTurnConditions(actor:{name:string;maxHp:number;hp:number;conditions?:Conditions}, log:(s:string)=>void){
  let skipAction=false; let hpDelta=0; let newC:Conditions={...(actor.conditions??{})};

  const st=newC.stunned;
  if(st){
    log(`😵 ${actor.name} está aturdido y pierde este turno.`);
    skipAction=true;
    if(typeof st.turnsLeft==='number'){
      const tl=Math.max(0,st.turnsLeft-1);
      newC = tl===0 ? removeCondition(newC,'stunned') : addCondition(newC,{...st,turnsLeft:tl});
    }else{
      // por defecto un turno
      newC = removeCondition(newC,'stunned');
    }
  }

  const inf=newC.infected;
  if(inf){
    // Infectado: deshabilita actuar; la muerte por tiempo se comprueba fuera (App)
    skipAction=true;
    log(`🧪 ${actor.name} está infectado y no puede actuar hasta curarse.`);
  }

  const bleed=newC.bleeding;
  if(bleed){
    hpDelta -= 2; // daño fijo
    log(`🩸 ${actor.name} sangra (-2 PV).`);
    // bleeding es persistente hasta curarse con "Curar"
  }

  return { skipAction, hpDelta, newConditions:newC };
}

// Al final de turno no hacemos nada adicional (el sangrado ya se aplicó al inicio)
export function applyEndOfTurnConditions(actor:{name:string;maxHp:number;hp:number;conditions?:Conditions}, log:(s:string)=>void){
  return { hpDelta: 0, newConditions:{...(actor.conditions??{})} };
}

export function cureCondition(c:Conditions|undefined, id:ConditionId){ return removeCondition(c,id); }
