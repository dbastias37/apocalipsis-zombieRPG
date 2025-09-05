import { WEAPONS } from "./data/weapons";
// Helper functions for ammo handling and weapon listing

function normalize(str?:string){return String(str||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();}

// Detecta si el item es caja de munición (string u objeto)
export function isAmmoBoxItem(it:any): boolean {
  if (!it) return false;
  if (typeof it === "object" && (it.type === "ammo" || it.kind === "ammoBox")) return true;
  const name = String(it?.name ?? it ?? "").toLowerCase();
  return /caja\s+de\s+munici(o|ó)n/.test(name);
}

// Lee cuántas balas contiene una caja. Por defecto 15.
export function getBoxBullets(it:any): number {
  if (!isAmmoBoxItem(it)) return 0;
  if (typeof it === "object") {
    const n = Number(it.bullets ?? it.count ?? it.qty ?? it.amount ?? 15);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 15;
  }
  // string "Caja de munición"
  return 15;
}

// Regresa true y cantidad si es “Munición (N)” o {name:"Munición", count:N}
export function getLooseAmmoCount(it:any): number {
  if (!it) return 0;
  if (typeof it === "object") {
    const nm = String(it.name ?? it.title ?? "").toLowerCase();
    if (/munici(o|ó)n/.test(nm) && !isAmmoBoxItem(it)) {
      const n = Number(it.count ?? it.qty ?? it.amount ?? 0);
      return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    }
    return 0;
  }
  // string
  const s = String(it).toLowerCase();
  const m = s.match(/munici(?:o|ó)n\s*\((\d+)\)/);
  return m ? Math.max(0, parseInt(m[1],10)) : 0;
}

// Suma total disponible (suelta + cajas) en backpack + inventory
export function getTotalAmmoAvailable(player:any){
  const lists = [
    Array.isArray(player?.inventory) ? player.inventory : [],
    Array.isArray(player?.backpack)  ? player.backpack  : [],
  ];
  let loose = 0, boxesBullets = 0, boxesCount = 0;
  for (const list of lists){
    for (const it of list){
      const boxB = isAmmoBoxItem(it) ? getBoxBullets(it) : 0;
      if (boxB > 0){ boxesBullets += boxB; boxesCount += 1; continue; }
      const looseN = getLooseAmmoCount(it);
      loose += looseN;
    }
  }
  return { loose, boxesBullets, boxesCount, total: loose + boxesBullets };
}

// Consume N balas del jugador: primero sueltas, luego cajas (parcialmente si hace falta).
// Devuelve { playerActualizado, tomado } (tomado<=requested si no alcanza)
export function consumeAmmoFromPlayer(player:any, requested:number){
  let need = Math.max(0, Math.floor(requested));
  if (need <= 0) return { player, taken: 0 };

  function consumeFromList(list:any[]){
    const out:any[] = [];
    let taken = 0;
    for (const it of list){
      if (taken >= need){ out.push(it); continue; }

      // 1) balas sueltas
      const loose = getLooseAmmoCount(it);
      if (loose > 0){
        const use = Math.min(loose, need - taken);
        const remain = loose - use;
        taken += use;
        if (remain > 0){
          // si era string "Munición (N)" lo reemplazamos por el mismo formato actualizado
          if (typeof it === "string"){
            out.push(`Munición (${remain})`);
          } else {
            out.push({ ...(it||{}), name: it.name ?? "Munición", count: remain });
          }
        }
        continue;
      }

      // 2) cajas
      if (isAmmoBoxItem(it)){
        const box = getBoxBullets(it);
        const use = Math.min(box, need - taken);
        const remain = box - use;
        taken += use;
        if (remain > 0){
          // mantener como objeto con bullets
          out.push({ name: "Caja de munición", bullets: remain, kind: "ammoBox" });
        }
        continue;
      }

      // item normal
      out.push(it);
    }
    return { out, taken };
  }

  // consume inventory luego backpack
  const inv = Array.isArray(player?.inventory) ? player.inventory : [];
  const bp  = Array.isArray(player?.backpack)  ? player.backpack  : [];

  const a = consumeFromList(inv);
  const b = (a.taken >= need) ? { out: bp, taken: 0 } : consumeFromList(bp);

  const totalTaken = a.taken + b.taken;
  return {
    player: { ...player, inventory: a.out, backpack: b.out },
    taken: totalTaken
  };
}

// Lista armas recargables (usar selected + las que sean de fuego)
import { getSelectedWeapon, isRangedWeapon } from "./systems/weapons";

export function listReloadableWeapons(player:any): {id:string; name:string}[]{
  const list: {id:string; name:string}[] = [];
  // 1) seleccionado si es de fuego
  const sel = (player as any)?.selectedWeaponId;
  const catSel = WEAPONS.find(w => w.id === sel);
  if (catSel && catSel.type === "ranged") {
    list.push({ id: catSel.id, name: catSel.name });
  }

  // 2) detectar armas por nombre en inventario/mochila (strings)
  const normName = (s:string) => normalize(s);
  const addUnique = (id:string, name:string) => {
    if (!list.find(w=>w.id===id)) list.push({ id, name });
  };
  const all = [
    ...(Array.isArray((player as any)?.inventory) ? (player as any).inventory : []),
    ...(Array.isArray((player as any)?.backpack)  ? (player as any).backpack  : []),
  ];
  for (const it of all){
    if (typeof it === "string"){
      const s = normName(it);
      const match = WEAPONS.find(w => w.type === "ranged" && (normName(w.name)===s || w.id===s));
      if (match) addUnique(match.id, match.name);
      continue;
    }
    if (it && typeof it === "object"){
      // objetos con type:'ranged' + id
      if (it.type === "ranged" && typeof it.id === "string"){
        const w = WEAPONS.find(w => w.id === it.id) ?? { id: it.id, name: (it.name ?? it.id) };
        addUnique(w.id, w.name);
      }
      // strings en 'name' que hagan match
      const nm = normName(String(it.name ?? ""));
      const match2 = WEAPONS.find(w => w.type === "ranged" && normName(w.name)===nm);
      if (match2) addUnique(match2.id, match2.name);
    }
  }
  return list;
}
[]{
  const list: {id:string; name:string}[] = [];
  const sel = getSelectedWeapon(player);
  if (isRangedWeapon(sel)) list.push({ id: sel.id, name: sel.name ?? sel.id });

  // si tienes catálogo, puedes añadir otras armas del backpack con type:"ranged"
  const bp = Array.isArray(player?.backpack) ? player.backpack : [];
  bp.forEach((it:any)=>{
    if (it?.type === "ranged" && it?.id){
      if (!list.find(w=>w.id===it.id)) list.push({ id: it.id, name: it.name ?? it.id });
    }
  });

  // si quedó vacío y el seleccionado es melee, no hay recarga posible
  return list;
}

