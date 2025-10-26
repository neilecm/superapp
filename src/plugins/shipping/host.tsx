// src/plugins/shipping/host.tsx
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function ShippingModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Shipping</h2>
          <button
            className="rounded-lg bg-gray-100 px-2 py-1 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-600">
          Listening for <code>checkout:start</code> → show address/rates here.
        </p>
      </div>
    </div>
  );
}

function ShippingHost() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<any>(null);

  useEffect(() => {
    const onCheckoutStart = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setPayload(detail);
      setOpen(true);
      console.log("[Shipping] checkout:start", detail);
    };
    window.addEventListener("checkout:start", onCheckoutStart as EventListener);
    return () => {
      window.removeEventListener(
        "checkout:start",
        onCheckoutStart as EventListener
      );
    };
  }, []);

  if (!open) return null;
  return <ShippingModal onClose={() => setOpen(false)} />;
}

export function mountShippingHost() {
  // HMR-safe singleton
  const g = globalThis as any;
  if (g.__SHIPPING_HOST_MOUNTED__) return;
  g.__SHIPPING_HOST_MOUNTED__ = true;

  const el = document.createElement("div");
  el.id = "__ship_host__";
  document.body.appendChild(el);
  const root = createRoot(el);
  root.render(<ShippingHost />);
}
