import React, { useMemo } from "react";

interface Props {
  explorationActive: boolean;
  timeOfDay: string;
  threatLevel: number;
  startExploration: () => void;
}

export default function TopActions({
  explorationActive,
  timeOfDay,
  threatLevel,
  startExploration,
}: Props) {
  const canExplore = useMemo(() => {
    if (explorationActive) return { ok: false, reason: "Ya estás explorando" };
    if (timeOfDay === "dawn")
      return { ok: false, reason: "Aún es muy temprano para explorar" };
    if (threatLevel >= 5) return { ok: false, reason: "Amenaza demasiado alta" };
    return { ok: true, reason: "" };
  }, [explorationActive, timeOfDay, threatLevel]);

  return (
    <div>
      <button
        disabled={!canExplore.ok}
        onClick={() => canExplore.ok && startExploration()}
        title={!canExplore.ok ? canExplore.reason : undefined}
        className="px-3 py-1 rounded bg-rose-700 text-white disabled:opacity-50"
      >
        🧭 Explorar {explorationActive && "(en curso...)"}
      </button>
      {!canExplore.ok && (
        <div className="text-xs text-rose-300 mt-1">{canExplore.reason}</div>
      )}
    </div>
  );
}

