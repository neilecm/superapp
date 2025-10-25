// Tiny event bus (SSR-safe)
type Handler = (e: CustomEvent) => void;

const isBrowser = typeof window !== "undefined";

export const bus = {
  on(type: string, handler: Handler) {
    if (!isBrowser) return () => {};
    const h = handler as unknown as EventListener;
    window.addEventListener(type, h);
    return () => window.removeEventListener(type, h);
  },
  emit<T = any>(type: string, detail?: T) {
    if (!isBrowser) return;
    window.dispatchEvent(new CustomEvent(type, { detail }));
  }
};
