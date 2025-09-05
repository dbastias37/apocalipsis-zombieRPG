import React, { useState } from "react";
import type { LoreEntry } from "../../types/lore";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  entries: LoreEntry[];
};

export default function LoreLibraryModal({ isOpen, onClose, entries }: Props){
  const [openId, setOpenId] = useState<string | null>(null);
  if (!isOpen) return null;

  const sorted = [...entries].sort((a,b)=>a.createdAt - b.createdAt);

  return (
    <div className=\"fixed inset-0 z-50\">
      <div className=\"absolute inset-0 bg-black/60 backdrop-blur-sm\" onClick={onClose} />
      <div className=\"relative z-10 max-w-3xl mx-auto my-8 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl\">
        <h3 className=\"text-2xl font-bold\">📖 Historias</h3>
        <p className=\"text-sm text-neutral-300 mt-1\">
          Aquí podrás leer historias que conectan con el juego.<br/>
          Cada vez que saques una nota, se agregará una nota de historia a esta sección.<br/>
          Podrás leer cada una de ellas presionando sobre ellas.
        </p>
        {sorted.length === 0 ? (
          <p className=\"mt-4 text-neutral-500\">Aún no hay historias. Explora y encuentra notas.</p>
        ) : (
          <div className=\"mt-4 space-y-2\">
            {sorted.map(e=>(
              <div key={e.id} className=\"rounded-xl border border-neutral-800 overflow-hidden\">
                <button
                  className=\"w-full text-left px-4 py-3 bg-neutral-800 hover:bg-neutral-700/60 flex items-center justify-between\"
                  onClick={()=> setOpenId(openId===e.id? null : e.id)}
                >
                  <div>
                    <div className=\"text-sm opacity-70\">Día {e.day}</div>
                    <div className=\"font-semibold\">{e.title}</div>
                    <div className=\"text-xs opacity-70\">Nota #{e.noteId}</div>
                  </div>
                  <div className=\"text-xl\">{openId===e.id ? \"▴\" : \"▾\"}</div>
                </button>
                {openId===e.id && (
                  <pre className=\"whitespace-pre-wrap px-4 py-3 text-neutral-200 text-sm bg-neutral-900 max-h-[50vh] overflow-y-auto\">
{e.body}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
        <div className=\"mt-4 flex justify-end\">
          <button className=\"px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700\" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
