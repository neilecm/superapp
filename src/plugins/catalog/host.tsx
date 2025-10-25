import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { bus } from "@/core/bus";
import type { CatalogOpenInput, CatalogResult } from "./types";
import type { OrderItem } from "@/core/types";
import { CatalogModal } from "./ui/CatalogModal";

const OPEN = "catalog:open";
const DONE = "catalog:done";

function Host() {
  const [open, setOpen] = useState(false);
  const [preselectId, setPreselectId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const offOpen = bus.on(OPEN, (e) => {
      const input = (e as any).detail?.input as CatalogOpenInput | undefined;
      setPreselectId(input?.preselectId);
      setOpen(true);
    });
    return () => { offOpen(); };
  }, []);

  const close = () => {
    setOpen(false);
    bus.emit(DONE, { ok: false, reason: "cancel" } as CatalogResult);
  };
  const select = (item: OrderItem) => {
    setOpen(false);
    bus.emit(DONE, { ok: true, item } as CatalogResult);
  };

  if (!open) return null;

  const node = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-6xl rounded-2xl bg-white shadow-lg">
        <CatalogModal onClose={close} onSelect={select} preselectId={preselectId} />
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

// ---- Auto-mount once (HMR-safe) ----
declare global {
  // eslint-disable-next-line no-var
  var __CATALOG_HOST_MOUNTED__: boolean | undefined;
}
if (typeof document !== "undefined" && !globalThis.__CATALOG_HOST_MOUNTED__) {
  globalThis.__CATALOG_HOST_MOUNTED__ = true;
  const el = document.createElement("div");
  el.id = "__catalog_host__";
  document.body.appendChild(el);
  createRoot(el).render(<Host />);
}
