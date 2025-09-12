import { useEffect, useRef } from "react";

interface Options {
  enabled?: boolean;
  /** Solo activa los eventos de puntero en dispositivos táctiles */
  mobileOnly?: boolean;
}

const INTERACTIVE_SELECTOR =
  'button, a[href], input, select, textarea, [role="button"], [contenteditable="true"], [data-no-tap-advance="true"]';

function isInteractive(target: EventTarget | null): boolean {
  if (!target) return false;
  return !!(target as HTMLElement).closest?.(INTERACTIVE_SELECTOR);
}

function isMobileDevice(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia?.("(pointer: coarse)").matches || navigator.maxTouchPoints > 0)
  );
}

export function useAdvanceControls(
  onAdvance: () => void,
  opts: Options = {}
) {
  const { enabled = true, mobileOnly = true } = opts;
  const startRef = useRef<{ x: number; y: number; id: number; moved: boolean } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const allowPointer = !mobileOnly || isMobileDevice();

    const onPointerDown = (ev: PointerEvent) => {
      if (!allowPointer) return;
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      if (isInteractive(ev.target)) return;
      startRef.current = { x: ev.clientX, y: ev.clientY, id: ev.pointerId, moved: false };
    };

    const onPointerMove = (ev: PointerEvent) => {
      const start = startRef.current;
      if (!start || start.id !== ev.pointerId) return;
      if (Math.abs(ev.clientX - start.x) > 10 || Math.abs(ev.clientY - start.y) > 10) {
        start.moved = true;
      }
    };

    const onPointerEnd = (ev: PointerEvent) => {
      const start = startRef.current;
      startRef.current = null;
      if (!allowPointer) return;
      if (!start || start.id !== ev.pointerId) return;
      if (start.moved) return;
      if (isInteractive(ev.target)) return;
      const sel = window.getSelection?.();
      if (sel && !sel.isCollapsed) return;
      onAdvance();
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      if (isInteractive(ev.target)) return;
      ev.preventDefault();
      onAdvance();
    };

    if (allowPointer) {
      document.addEventListener("pointerdown", onPointerDown, { passive: true });
      document.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerup", onPointerEnd, { passive: true });
      document.addEventListener("pointercancel", onPointerEnd, { passive: true });
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      if (allowPointer) {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerEnd);
        document.removeEventListener("pointercancel", onPointerEnd);
      }
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled, mobileOnly, onAdvance]);
}

