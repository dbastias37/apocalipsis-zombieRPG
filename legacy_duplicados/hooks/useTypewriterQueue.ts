import { useEffect, useRef, useState } from "react";

export type TWMessage = {
  id?: string;
  text: string;               // línea a escribir
  onDone?: () => void;        // callback al finalizar (al continuar)
};

export function useTypewriterQueue() {
  const [queue, setQueue] = useState<TWMessage[]>([]);
  const [current, setCurrent] = useState<TWMessage|null>(null);
  const [visible, setVisible] = useState<string>("");
  const [typing, setTyping] = useState<boolean>(false);

  const idxRef = useRef(0);
  const typingRef = useRef<NodeJS.Timeout|null>(null);

  function push(msg: TWMessage | string, onDone?: () => void) {
    const item = typeof msg === "string" ? { text: msg, onDone } : msg;
    setQueue(q => [...q, { ...item, id: item.id ?? crypto.randomUUID() }]);
  }

  function startNext() {
    if (typingRef.current) clearTimeout(typingRef.current);
    const next = queue[0] ?? null;
    setCurrent(next);
    setQueue(q => q.slice(1));
    setVisible("");
    idxRef.current = 0;
    setTyping(!!next);
  }

  // Llamar cuando el usuario presione Enter y aún se está escribiendo
  function skipTyping() {
    if (!current) return;
    if (typingRef.current) clearTimeout(typingRef.current);
    setVisible(current.text);
    setTyping(false);
  }

  // Llamar cuando el usuario presione Enter y ya terminó de escribirse
  function continueNext() {
    if (!current) return;
    const done = current.onDone;
    setCurrent(null);
    setVisible("");
    setTyping(false);
    if (done) done();
    // Pasar al siguiente
    setTimeout(startNext, 0);
  }

  useEffect(() => {
    if (!current) return;
    setTyping(true);
    function step() {
      if (!current) return;
      const target = current.text;
      if (idxRef.current < target.length) {
        idxRef.current += 1;
        setVisible(target.slice(0, idxRef.current));
        typingRef.current = setTimeout(step, 18); // velocidad
      } else {
        setTyping(false);
      }
    }
    step();
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [current?.id]);

  // Arrancar primer mensaje automáticamente si no hay actual
  useEffect(() => {
    if (!current && queue.length > 0) startNext();
  }, [queue.length, current]);

  return { push, current, text: visible, typing, skipTyping, continueNext, hasPending: !!current || queue.length>0 };
}
