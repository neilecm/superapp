import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { bus } from "@/core/bus";
import { HomeScreen } from "./ui/HomeScreen";

type State = { email?: string };

function Host() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({});

  useEffect(() => {
    const offOpen = bus.on("home:open", (e) => {
      const email = (e as any).detail?.input?.sessionEmail as string | undefined;
      setState({ email });
      setOpen(true);
    });

    const offAuth = bus.on("auth:done", (e) => {
      const detail = (e as any).detail as { ok: boolean; session?: { user?: { email?: string } } };
      if (detail?.ok) {
        setState({ email: detail.session?.user?.email });
        setOpen(true);
      }
    });

    // open after OAuth redirect (auth host broadcasts session on startup)
    const offSession = bus.on("auth:session-result", (e) => {
      const s = (e as any).detail?.session as { user?: { email?: string } } | null;
      if (s?.user?.email) {
        setState({ email: s.user.email });
        setOpen(true);
      }
    });

    return () => {
      offOpen();
      offAuth();
      offSession();
    };
  }, []);

  if (!open) return null;

  const onStartShopping = async () => {
    // lazy-load Catalog so the page doesn’t need to import it
    try { await import("@/plugins/catalog"); } catch (e) { console.warn(e); }
    bus.emit("catalog:open", { input: {} });
    setOpen(false);
  };

  const onViewOrders = async () => {
  // Look for an Orders plugin, but don’t require it
  const candidates = import.meta.glob("/src/plugins/orders/index.ts");
  const entry = candidates["/src/plugins/orders/index.ts"];

  if (entry) {
    // Load it (returns a promise), then open
    await entry();
    bus.emit("orders:open", {});
    setOpen(false);
  } else {
    // Not installed yet — show a friendly notice (or no-op)
    alert("Orders plugin not installed yet.");
    // setOpen(false); // optional
  }
};


  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg">
        <HomeScreen
          email={state.email}
          onClose={() => setOpen(false)}
          onStartShopping={onStartShopping}
          onViewOrders={onViewOrders}
        />
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ---- HMR-safe singleton (uses same React/DOM as app) ----
declare global {
  // eslint-disable-next-line no-var
  var __HOME_HOST_MOUNTED__: boolean | undefined;
}
if (typeof document !== "undefined" && !globalThis.__HOME_HOST_MOUNTED__) {
  globalThis.__HOME_HOST_MOUNTED__ = true;
  const el = document.createElement("div");
  el.id = "__home_host__";
  document.body.appendChild(el);
  createRoot(el).render(<Host />);
}
