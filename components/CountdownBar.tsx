import React from "react";

type Props = {
  currentMs: number;
  maxMs: number;
  label?: string;
};

export default function CountdownBar({ currentMs, maxMs, label }: Props) {
  const pct = Math.max(0, Math.min(100, 100 - (currentMs / Math.max(1, maxMs)) * 100));
  return (
    <div className="w-full">
      {label && <div className="text-xs mb-1 opacity-80">{label}</div>}
      <div className="w-full h-2 bg-gray-800/60 rounded overflow-hidden border border-gray-700">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
