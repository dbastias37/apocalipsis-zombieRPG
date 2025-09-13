import { AnimatePresence, motion } from "framer-motion";
import React from "react";

type Props = { lines: string[] };

export default function BattleTicker({ lines }: Props) {
  // solo 4 visibles
  const visible = lines.slice(-4);
  return (
    <div className="relative w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 mb-3 overflow-hidden">
      <div className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {visible.map((text, i) => (
            <motion.div
              key={`${i}-${text}`}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-sm bg-white/5 rounded px-2 py-1"
            >
              {text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
