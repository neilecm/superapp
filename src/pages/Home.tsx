// src/pages/Home.tsx
import React from "react";

// Mount these hosts (HMR-safe singletons)
import "@/plugins/auth";
import "@/plugins/home";
import "@/plugins/shipping";      // ← mount Shipping so it can hear `checkout:start`

import { ensureSession } from "@/plugins/auth";

export default function Home() {
  const onSignIn = async () => {
    const res = await ensureSession();
    if (res.ok) console.log("Signed in:", res.session.user.email);
  };

  const onOpenCatalog = async () => {
  const mod = await import("@/plugins/catalog");
  if (typeof mod.runCatalog === "function") {
    const out = await mod.runCatalog();          // opens modal
    if (out?.ok && out.item) {
      window.dispatchEvent(new CustomEvent("checkout:start", { detail: { item: out.item } }));
    }
  } else {
    const { bus } = await import("@/core/bus");
    bus.emit("catalog:open", { input: {} });
  }
};


  return (
    <div className="p-6">
      <div className="mb-4">
        <button className="rounded-2xl bg-black text-white px-3 py-2" onClick={onSignIn}>
          Sign in to continue
        </button>
      </div>
      <div>
        <button className="rounded-2xl bg-gray-200 px-3 py-2" onClick={onOpenCatalog}>
          Open catalog
        </button>
      </div>
    </div>
  );
}
