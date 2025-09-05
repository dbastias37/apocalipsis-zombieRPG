import { useEffect, useRef } from "react";

type Options = {
  enabled?: boolean;
  /** Retorna true si un modal de resumen está abierto */
  getIsSummaryOpen?: () => boolean;
  /** Selector del contenedor del resumen */
  summarySelector?: string; // default: '[data-enter-scope="summary"]'
};

function isInteractive(el: Element | null): boolean {
  if (!el) return false;
  // Permite desactivar por zona con data-no-enter-tap
  if ((el as HTMLElement).closest?.('[data-no-enter-tap="true"]')) return true;

  const node = el as HTMLElement;
  const tag  = (node.tagName || "").toLowerCase();
  const role = node.getAttribute?.("role") || "";
  const editable = node.isContentEditable;
  const cls = String((node as any).className || "");

  if (editable) return true;
  if (["button","input","textarea","select","a","label","summary","details"].includes(tag)) return true;
  if (["button","switch","tab","menuitem"].includes(role)) return true;
  if (/\b(btn|button|toggle|dropdown|select|input)\b/i.test(cls)) return true;

  return false;
}

export function useEnterOnTap(opts: Options = {}) {
  const { enabled = true, getIsSummaryOpen, summarySelector = '[data-enter-scope="summary"]' } = opts;
  const lastRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const shouldSkip = (ev: PointerEvent): boolean => {
      // primario solamente
      if (ev.pointerType === "mouse" && ev.button !== 0) return true;
      // evitar taps sobre UI interactiva
      if (isInteractive(ev.target as Element)) return true;
      // evitar si hay selección de texto
      const sel = window.getSelection?.();
      if (sel && !sel.isCollapsed) return true;
      // throttling simple
      const now = Date.now();
      if (now - lastRef.current < 200) return true;
      lastRef.current = now;
      return false;
    };

    const onPointerDown = (ev: PointerEvent) => {
      if (shouldSkip(ev)) return;

      const summaryOpen = getIsSummaryOpen?.() ?? false;
      const scopeEl = document.querySelector(summarySelector);

      // Si el resumen está abierto, solo permitimos Enter si el tap ocurrió DENTRO del modal de resumen
      if (summaryOpen && scopeEl) {
        if (!scopeEl.contains(ev.target as Node)) return;
      }

      // Despachar el mismo keydown Enter que maneja la app
      const e = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      });

      // Si existe scope (resumen abierto), despachar sobre ese contenedor; sino, sobre document
      if (summaryOpen && scopeEl) {
        scopeEl.dispatchEvent(e);
      } else {
        document.dispatchEvent(e);
      }
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown as any);
    };
  }, [enabled, getIsSummaryOpen, summarySelector]);
}
