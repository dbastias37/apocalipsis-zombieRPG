import React, { useEffect, useState } from "react";

// Simple toast system: call toast(message) to show
// Positioned at bottom-right, auto hides after ~3.5s

type ToastState = { id: number; text: string } | null;

let trigger: ((msg: string) => void) | null = null;

export function toast(msg: string) {
  trigger?.(msg);
}

export function ToastContainer() {
  const [toastState, setToastState] = useState<ToastState>(null);

  useEffect(() => {
    trigger = (msg: string) => setToastState({ id: Date.now(), text: msg });
    return () => {
      trigger = null;
    };
  }, []);

  useEffect(() => {
    if (!toastState) return;
    const id = setTimeout(() => setToastState(null), 3500);
    return () => clearTimeout(id);
  }, [toastState]);

  if (!toastState) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow" key={toastState.id}>
      {toastState.text}
    </div>
  );
}
