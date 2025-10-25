// src/plugins/home/host.tsx
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

    // NEW: open Home when a session is broadcast on load (after OAuth redirect)
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

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg">
        <HomeScreen email={state.email} onClose={() => setOpen(false)} />
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ---- Auto-mount once (HMR-safe singleton) ----
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
