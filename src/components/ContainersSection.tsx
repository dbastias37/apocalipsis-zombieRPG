import React, { useMemo } from 'react';
import { getAvailableContainers, openContainer } from '../systems/containers';
import { GameState } from '../types/game';
import { gameLog } from '../utils/logger';
import { getCurrentDay } from '../utils/day';

type Props = {
  day?: number;
  state: GameState;
  setState: (updater:(s:GameState)=>GameState) => void;
};

export default function ContainersSection({ day, state, setState }: Props) {
  const currentDay = typeof day === 'number' ? day : getCurrentDay(state);
  const list = useMemo(() => getAvailableContainers(currentDay, state), [currentDay, state]);

  if (!list.length) {
    return <div className="mt-2 text-sm opacity-70">Sin contenedores disponibles por ahora.</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Contenedores</h3>
      <ul className="mt-2 space-y-2">
        {list.map(c => (
          <li key={c.id} className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs opacity-70">{c.place}</div>
            </div>
            <button
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:opacity-90"
              onClick={()=>{
                setState(prev=>{
                  const next: any = { ...prev };
                  const gained = openContainer(currentDay, c.id, next);
                  if (gained <= 0) {
                    gameLog('No se pudo abrir el contenedor.');
                  }
                  return next;
                });
              }}
            >
              Abrir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
