import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { bus } from "@/core/bus";
import type { AuthResult, Session } from "./types";
import { AuthModal } from "./ui/AuthModal";
import { getSupabase, toSession } from "./services/supabase";

const OPEN = "auth:open";
const DONE = "auth:done";
const SIGNOUT = "auth:signout";
const GET_SESSION = "auth:get-session";
const SESSION_RESULT = "auth:session-result";

function Host() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const offOpen = bus.on(OPEN, () => setOpen(true));
    const offSignOut = bus.on(SIGNOUT, async () => {
      const supa = await getSupabase();
      if (supa) {
        await supa.auth.signOut();
      } else {
        localStorage.removeItem("auth:mock:user");
      }
      bus.emit(SESSION_RESULT, { session: null as Session | null });
    });
    const offGet = bus.on(GET_SESSION, async () => {
      const supa = await getSupabase();
      let session: Session | null = null;
      if (supa) {
        const { data } = await supa.auth.getSession();
        session = toSession(data.session);
      } else {
        const txt = localStorage.getItem("auth:mock:user");
        session = txt ? (JSON.parse(txt) as Session) : null;
      }
      bus.emit(SESSION_RESULT, { session });
    });
    return () => { offOpen(); offSignOut(); offGet(); };
  }, []);

  const close = () => setOpen(false);
  const done = (res: AuthResult) => {
    setOpen(false);
    bus.emit(DONE, res);
    if (res.ok) bus.emit(SESSION_RESULT, { session: res.session });
  };

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg">
        <AuthModal onClose={close} onDone={done} />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ---- Auto-mount on import (zero App edits) ----
let mounted = false;
if (typeof document !== "undefined" && !mounted) {
  mounted = true;
  const el = document.createElement("div");
  document.body.appendChild(el);
  import("react-dom/client").then(({ createRoot }) => {
    createRoot(el).render(<Host />);
  });
}
