export async function autoResolveEnemyRound(state:any, opts?:{delayMs?:number}){
  const delayMs = opts?.delayMs ?? 250; // breve, solo para feedback
  const enemies = state.enemies?.filter((e:any)=>e.hp>0) ?? [];
  let s = state;
  for (const enemy of enemies){
    // elige un jugador vivo
    const targetIdx = (s.players.findIndex((p:any)=>p.hp>0) + Math.floor(Math.random()*s.players.length)) % s.players.length;
    // aplica daño base (ajústalo a tu sistema real)
    const base = Math.max(1, Math.round(5 + Math.random()*4));
    s = dealDamageToPlayer(s, targetIdx, base); // implementa/usa tu helper real
    await new Promise(r=>setTimeout(r, delayMs));
    s = { ...s }; // trigger de render
    s.turn.activeIndex++;
  }
  // fin ronda enemigos → vuelve a jugadores
  s.turn.phase = 'player';
  s.turn.activeIndex = 0;
  s.turn.turnNumber += 1;
  s.ui = { ...(s.ui||{}), toast: { type:'info', text:`Turno ${s.turn.turnNumber}: ¡tu equipo!` } };
  return s;
}

function dealDamageToPlayer(state:any, idx:number, dmg:number){
  const players = [...state.players];
  const p = { ...(players[idx]||{}) };
  p.hp = Math.max(0, (p.hp ?? 0) - dmg);
  players[idx] = p;
  return { ...state, players };
}
