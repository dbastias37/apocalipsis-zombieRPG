import React, { useEffect, useRef } from "react";

export type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleKey);
      ref.current?.focus();
    }
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={title}
          ref={ref}
          tabIndex={-1}
          data-open={open}
          className="max-w-md w-[90%] rounded-2xl bg-zinc-900 p-5 ring-1 ring-zinc-800 shadow-xl scale-95 opacity-0 data-[open=true]:scale-100 data-[open=true]:opacity-100 transition"
        >
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700"
            >
              Cerrar
            </button>
          </header>
          <div>{children}</div>
        </section>
      </div>
    </>
  );
}

