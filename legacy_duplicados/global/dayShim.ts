// Global shim to avoid ReferenceError: day is not defined
declare global {
  // eslint-disable-next-line no-var
  var day: number | undefined;
  interface Window { day?: number; }
}

// Initialize a safe default so any accidental global day usage won't crash.
if (typeof (globalThis as any).day === "undefined") {
  (globalThis as any).day = 1;
}
export {};
