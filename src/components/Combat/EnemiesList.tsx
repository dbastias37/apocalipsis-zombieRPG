import React, { useState } from "react";

type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
};

interface Props {
  enemies: Enemy[];
  attack: (enemyId: string) => void;
}

export default function EnemiesList({ enemies, attack }: Props) {
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);

  return (
    <div>
      <ul className="space-y-2">
        {enemies.map(e => (
          <li
            key={e.id}
            onClick={() => setSelectedEnemyId(e.id)}
            className={`p-2 rounded border cursor-pointer ${
              selectedEnemyId === e.id
                ? "border-amber-400 bg-amber-900/20"
                : "border-slate-600"
            }`}
          >
            <div className="flex justify-between">
              <span>{e.name}</span>
              <span>
                HP {e.hp}/{e.maxHp}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={() => selectedEnemyId && attack(selectedEnemyId)}
        disabled={!selectedEnemyId}
        className="mt-2 px-3 py-1 rounded bg-amber-600 text-white disabled:opacity-50"
      >
        Atacar
      </button>
    </div>
  );
}

