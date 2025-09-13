import React from "react";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: number;
  onClick?: () => void;
};

export default function CampTileButton({ icon, label, value, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="text-center p-3 rounded-xl bg-neutral-800 animate-breath transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-neutral-400">{label}</div>
    </button>
  );
}

