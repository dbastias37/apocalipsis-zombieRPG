import React from "react";

type Actor = { name: string };

interface Props {
  turnOrder: Actor[];
  currentIndex: number;
}

export default function Header({ turnOrder, currentIndex }: Props) {
  const current = turnOrder[currentIndex];
  const next = turnOrder[(currentIndex + 1) % turnOrder.length];

  return (
    <div className="flex items-baseline gap-2">
      <h3 className="text-lg font-bold">Turno de {current.name}</h3>
      <span className="text-xs opacity-70">Siguiente: {next.name}</span>
    </div>
  );
}

