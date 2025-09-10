import React from "react";

type Props = {
  item: { label?: string; name?: string } | string;
  onMove: () => void;
};

export default function ItemRow({ item, onMove }: Props) {
  const label =
    typeof item === "string" ? item : item?.label || item?.name || "Ítem";
  return (
    <li
      onClick={onMove}
      className="flex justify-between p-2 rounded hover:bg-slate-800 cursor-pointer"
    >
      <span>{label}</span>
      <span className="opacity-70 group-hover:opacity-100">→</span>
    </li>
  );
}

