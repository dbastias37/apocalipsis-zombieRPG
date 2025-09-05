/** normaliza un item potencialmente string a caja con bullets */
export function normalizeAmmoBox(it:any): { name:"Caja de munición"; bullets:number } | null {
  if(!it) return null;
  if(typeof it === "string") {
    const s = it.trim().toLowerCase();
    if(s === "caja de munición" || s === "caja de municion") return { name:"Caja de munición", bullets:15 };
    return null;
  }
  if(it && typeof it === "object" && (it.name?.toLowerCase?.() === "caja de munición" || it.name?.toLowerCase?.() === "caja de municion")) {
    const n = Number(it.bullets);
    return { name:"Caja de munición", bullets: Number.isFinite(n) && n>0 ? n : 15 };
  }
  return null;
}

/** devuelve índice y caja normalizada de la PRIMERA caja en backpack; si existe, también la versión normalizada para actualizar */
export function findAmmoBoxInBackpack(p:any): { index:number; box:{name:"Caja de munición"; bullets:number} } | null {
  const bp = Array.isArray(p?.backpack) ? p.backpack : [];
  for(let i=0;i<bp.length;i++){
    const norm = normalizeAmmoBox(bp[i]);
    if(norm) return { index:i, box:norm };
  }
  return null;
}

/** sustituye en mochila el item en idx por objeto con bullets actualizados, o lo elimina si bullets<=0 */
export function applyAmmoBoxDeltaToBackpack(p:any, idx:number, remaining:number){
  const bp = Array.isArray(p?.backpack) ? [...p.backpack] : [];
  if(remaining <= 0){
    bp.splice(idx,1);
  } else {
    bp[idx] = { name:"Caja de munición", bullets: remaining };
  }
  return bp;
}

/** lista de armas elegibles del jugador (seguro y minimalista) */
export function getReloadableWeapons(p:any): { id:string; name:string }[] {
  const list: {id:string; name:string}[] = [];
  // 1) arma seleccionada si existe
  if (p?.selectedWeaponId) list.push({ id: p.selectedWeaponId, name: String(p.selectedWeaponId) });
  // 2) armas que ya tengan munición registrada
  if (p?.ammoByWeapon && typeof p.ammoByWeapon === "object") {
    Object.keys(p.ammoByWeapon).forEach(id=>{
      if(!list.find(w=>w.id===id)) list.push({ id, name: id });
    });
  }
  // 3) strings de la mochila que parezcan armas (evitar fists)
  const bp = Array.isArray(p?.backpack) ? p.backpack : [];
  bp.forEach((it:any)=>{
    if (typeof it === "string") {
      const s = it.toLowerCase();
      if (!/fists|puños|manos/.test(s) && /pistola|rifle|subfusil|escopeta|smg|ar|revolver|arma/.test(s)) {
        if(!list.find(w=>w.id===it)) list.push({ id: it, name: it });
      }
    }
  });
  // fallback: si quedó vacío, usa “fists” o el selected como único
  if(list.length===0 && p?.selectedWeaponId) list.push({ id:p.selectedWeaponId, name: p.selectedWeaponId });
  return list;
}

/** suma balas a arma del jugador (exactamente amount) */
export function addAmmoToWeapon(p:any, weaponId:string, amount:number){
  const map = { ...(p?.ammoByWeapon ?? {}) };
  const prev = Number(map[weaponId] ?? 0);
  map[weaponId] = prev + Math.max(0, Math.floor(amount));
  return map;
}

