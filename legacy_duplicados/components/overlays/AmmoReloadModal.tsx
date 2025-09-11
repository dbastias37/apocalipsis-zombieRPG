import React, { useMemo, useState } from "react";

type Weapon = { id:string; name:string };

type Props = {
  isOpen: boolean;
  player: any|null;
  onClose: () => void;
  onConfirm: (weaponId:string, bullets:number) => void;
};

// Helpers (idénticos a App) mínimos que necesitamos
function norm(s?: string){ return String(s||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase(); }
function isAmmoBoxItem(it:any): boolean {
  if (!it) return false;
  if (typeof it === "object" && (it.type === "ammo" || it.kind === "ammoBox")) return true;
  const name = String(it?.name ?? it ?? "").toLowerCase();
  return /caja\s+de\s+munici(o|ó)n/.test(name);
}
function getBoxBullets(it:any): number {
  if (!isAmmoBoxItem(it)) return 0;
  if (typeof it === "object") {
    const n = Number(it.bullets ?? it.count ?? it.qty ?? it.amount ?? 15);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 15;
  }
  return 15;
}
function getLooseAmmoCount(it:any): number {
  if (!it) return 0;
  if (typeof it === "object") {
    const nm = String(it.name ?? it.title ?? "").toLowerCase();
    if (/munici(o|ó)n/.test(nm) && !isAmmoBoxItem(it)) {
      const n = Number(it.count ?? it.qty ?? it.amount ?? 0);
      return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    }
    return 0;
  }
  const s = String(it).toLowerCase();
  const m = s.match(/munici(?:o|ó)n\s*\((\d+)\)/);
  return m ? Math.max(0, parseInt(m[1],10)) : 0;
}
function getTotalAmmoAvailable(player:any){
  const lists = [
    Array.isArray(player?.inventory) ? player.inventory : [],
    Array.isArray(player?.backpack)  ? player.backpack  : [],
  ];
  let loose = 0, boxesBullets = 0;
  for (const list of lists){
    for (const it of list){
      const boxB = isAmmoBoxItem(it) ? getBoxBullets(it) : 0;
      if (boxB > 0){ boxesBullets += boxB; continue; }
      loose += getLooseAmmoCount(it);
    }
  }
  return { total: loose + boxesBullets };
}

import { WEAPONS } from "../../data/weapons";
function listReloadableWeapons(player:any): Weapon[] {
  const list: Weapon[] = [];
  const add = (id:string, name:string) => { if(!list.find(w=>w.id===id)) list.push({id,name}); };

  const selId = (player as any)?.currentWeaponId ?? (player as any)?.selectedWeaponId;
  const byId = selId ? WEAPONS.find(w => w.id === selId) : null;
  if (byId && byId.type === "ranged") add(byId.id, byId.name);

  const all = [
    ...(Array.isArray(player?.inventory) ? player.inventory : []),
    ...(Array.isArray(player?.backpack)  ? player.backpack  : []),
  ];
  for (const it of all){
    if (typeof it === "string"){
      const s = norm(it);
      const match = WEAPONS.find(w => w.type === "ranged" && (norm(w.name)===s || w.id===s));
      if (match) add(match.id, match.name);
      continue;
    }
    if (it && typeof it === "object"){
      if (it.type === "ranged" && typeof it.id === "string"){
        const w = WEAPONS.find(w => w.id === it.id) ?? { id: it.id, name: (it as any).name ?? it.id };
        add(w.id, w.name);
      } else if (typeof (it as any).name === "string"){
        const nm = norm((it as any).name);
        const match2 = WEAPONS.find(w => w.type === "ranged" && norm(w.name)===nm);
        if (match2) add(match2.id, match2.name);
      }
    }
  }
  return list;
}

export default function AmmoReloadModal({ isOpen, player, onClose, onConfirm }: Props){
  if(!isOpen || !player) return null;

  const available = useMemo(()=>getTotalAmmoAvailable(player), [player]);
  const weapons   = useMemo(()=>listReloadableWeapons(player), [player]);

  const [wid, setWid] = useState<string>(weapons[0]?.id ?? "");
  const [count, setCount] = useState<number>(Math.min(5, available.total));
  const maxBullets = available.total;

  const disabled = maxBullets<=0 || !wid;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 max-w-lg mx-auto my-10 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
        <h3 className="text-xl font-bold">Recarga tu arma</h3>
        <p className="text-xs text-neutral-400 mt-1">Disponible: <b>{maxBullets}</b> municiones</p>

        <div className="mt-4 space-y-4">
          {weapons.length > 1 ? (
            <div>
              <div className="text-sm mb-2">Elige arma</div>
              <div className="flex flex-wrap gap-2">
                {weapons.map(w=>(
                  <button key={w.id}
                    className={`px-3 py-1 rounded-lg border ${wid===w.id ? 'border-emerald-500 bg-emerald-600/20' : 'border-neutral-700 bg-neutral-800'}`}
                    onClick={()=>setWid(w.id)}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm mb-1">Arma</div>
              <div className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 inline-block">
                {weapons[0]?.name ?? '—'}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Municiones a cargar</div>
                <div className="text-xs text-neutral-400">Selecciona cuántas transferir</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
                        onClick={()=>setCount(c=>Math.max(0, c-1))}>-</button>
                <span className="w-12 text-center font-bold">{count}</span>
                <button className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
                        onClick={()=>setCount(c=>Math.min(maxBullets, c+1))}>+</button>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-400">recuerda utilizar tu munición de forma inteligente</p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-lg px-4 py-2 bg-neutral-800 hover:bg-neutral-700" onClick={onClose}>Cancelar</button>
          <button
            className={`rounded-lg px-4 py-2 ${!disabled ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'}`}
            disabled={disabled || count<=0}
            onClick={()=>onConfirm(wid, count)}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

