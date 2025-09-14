import { create } from 'zustand';

export type Phase = 'out_of_combat' | 'players' | 'enemies';
export type Actor = { id:string; name:string; hp:number; hpMax:number; def:number; atk:number; conditions?:any };

type TurnState = {
  phase: Phase;
  round: number;
  order: string[];
  index: number;
  lock: boolean;
  players: Actor[];
  enemies: Actor[];
  currentActorId: string | null;
  isEnemyPhase: boolean;
};

type TurnAPI = {
  startCombat(players: Actor[], enemies: Actor[]): void;
  endCombat(): void;
  canAct(actorId: string): boolean;
  perform(action: 'attack'|'defend'|'heal'|'eat'|'flee', params?: any): void;
  endTurn(): void;
  applyDamage(targetId: string, dmg: number): void;
  applyCondition(targetId: string, cond: any): void;
  autoRunEnemies(): Promise<void>;
  setLock(v:boolean): void;
};

function derive(state: Omit<TurnState,'currentActorId'|'isEnemyPhase'>): TurnState {
  const currentActorId = state.phase === 'players' ? state.order[state.index] ?? null : null;
  const isEnemyPhase = state.phase === 'enemies';
  return { ...state, currentActorId, isEnemyPhase };
}

export const useTurn = create<TurnState & TurnAPI>((set, get) => derive({
  phase: 'out_of_combat',
  round: 0,
  order: [],
  index: 0,
  lock: false,
  players: [],
  enemies: [],
}) as TurnState & TurnAPI);

// Overwrite with API methods
useTurn.setState(state => state); // noop to satisfy TS

const setState = (partial: Partial<TurnState>) =>
  set(s => derive({ ...s, ...partial }));

export const turnAPI: TurnAPI = {
  startCombat(players, enemies){
    const order = [...players.filter(p=>p.hp>0), ...enemies.filter(e=>e.hp>0)].map(a=>a.id);
    setState({ phase:'players', round:1, order, index:0, lock:false, players:[...players], enemies:[...enemies] });
  },
  endCombat(){
    setState({ phase:'out_of_combat', round:0, order:[], index:0, lock:false, players:[], enemies:[] });
  },
  canAct(actorId){
    const s = get();
    const actor = s.players.find(p=>p.id===actorId);
    return s.phase==='players' && !s.lock && s.currentActorId===actorId && !!actor && actor.hp>0;
  },
  perform(action, params){
    const s = get();
    const actorId = s.currentActorId;
    if(!actorId || !turnAPI.canAct(actorId)) return;
    const players = [...s.players];
    const enemies = [...s.enemies];
    const actorIdx = players.findIndex(p=>p.id===actorId);
    const actor = players[actorIdx];
    const log = console.log;
    switch(action){
      case 'attack':{
        const targetId = params?.enemyId;
        const targetIdx = enemies.findIndex(e=>e.id===targetId);
        if(targetIdx<0) return;
        const target = enemies[targetIdx];
        const roll = Math.floor(Math.random()*20)+1;
        const total = roll + actor.atk;
        if(total >= target.def){
          const dmg = Math.max(1, actor.atk);
          target.hp = Math.max(0, target.hp - dmg);
          log(`${actor.name} golpea a ${target.name} (${dmg})`);
        } else {
          log(`${actor.name} falla contra ${target.name}`);
        }
        enemies[targetIdx] = target;
        setState({ enemies });
        if(enemies.every(e=>e.hp<=0)){
          turnAPI.endCombat();
          return;
        }
        turnAPI.endTurn();
        break; }
      case 'defend':{
        players[actorIdx] = { ...actor, conditions:{...(actor.conditions||{}), defending:true} };
        setState({ players });
        log(`${actor.name} se defiende`);
        turnAPI.endTurn();
        break; }
      case 'heal':{
        const healed = Math.min(actor.hpMax, actor.hp + 5);
        players[actorIdx] = { ...actor, hp: healed };
        setState({ players });
        log(`${actor.name} se cura`);
        turnAPI.endTurn();
        break; }
      case 'eat':{
        const healed = Math.min(actor.hpMax, actor.hp + 3);
        players[actorIdx] = { ...actor, hp: healed };
        setState({ players });
        log(`${actor.name} come algo`);
        turnAPI.endTurn();
        break; }
      case 'flee':{
        if(Math.random()<0.5){
          log(`${actor.name} escapa`);
          turnAPI.endCombat();
        }else{
          log(`${actor.name} no logra huir`);
          turnAPI.endTurn();
        }
        break; }
    }
  },
  endTurn(){
    const s = get();
    if(s.phase==='players'){
      const playersCount = s.players.length;
      let next = s.index + 1;
      while(next < playersCount && s.players.find(p=>p.id===s.order[next])?.hp<=0) next++;
      if(next < playersCount){
        setState({ index: next });
      } else {
        setState({ phase:'enemies', index:0 });
        turnAPI.autoRunEnemies();
      }
    } else if(s.phase==='enemies'){
      setState({ phase:'players', round: s.round + 1, index:0 });
    }
  },
  applyDamage(targetId, dmg){
    const s = get();
    let players = [...s.players];
    let enemies = [...s.enemies];
    const pIdx = players.findIndex(p=>p.id===targetId);
    if(pIdx>=0){
      const p = players[pIdx];
      players[pIdx] = { ...p, hp: Math.max(0, p.hp - dmg) };
      setState({ players });
      return;
    }
    const eIdx = enemies.findIndex(e=>e.id===targetId);
    if(eIdx>=0){
      const e = enemies[eIdx];
      enemies[eIdx] = { ...e, hp: Math.max(0, e.hp - dmg) };
      setState({ enemies });
    }
  },
  applyCondition(targetId, cond){
    const s = get();
    let players = [...s.players];
    let enemies = [...s.enemies];
    const pIdx = players.findIndex(p=>p.id===targetId);
    if(pIdx>=0){
      const p = players[pIdx];
      players[pIdx] = { ...p, conditions:{...(p.conditions||{}), ...cond} };
      setState({ players });
      return;
    }
    const eIdx = enemies.findIndex(e=>e.id===targetId);
    if(eIdx>=0){
      const e = enemies[eIdx];
      enemies[eIdx] = { ...e, conditions:{...(e.conditions||{}), ...cond} };
      setState({ enemies });
    }
  },
  async autoRunEnemies(){
    const s = get();
    setState({ lock:true });
    for(const enemy of s.enemies){
      if(enemy.hp<=0) continue;
      const alive = get().players.filter(p=>p.hp>0);
      if(alive.length===0) break;
      const target = alive[Math.floor(Math.random()*alive.length)];
      const roll = Math.floor(Math.random()*20)+1;
      const total = roll + enemy.atk;
      if(total >= target.def){
        const dmg = Math.max(1, enemy.atk);
        turnAPI.applyDamage(target.id, dmg);
        console.log(`${enemy.name} ataca a ${target.name} (${dmg})`);
      }else{
        console.log(`${enemy.name} falla a ${target.name}`);
      }
      await new Promise(r=>setTimeout(r,250));
    }
    setState({ lock:false });
    turnAPI.endTurn();
  },
  setLock(v){ setState({ lock:v }); }
};

// Bind API methods to store
useTurn.setState(state => ({...state, ...turnAPI}));

