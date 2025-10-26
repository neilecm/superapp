// src/plugins/shipping/index.ts
// Public surface (export whatever SDKs you want to use elsewhere)
export * from "./services/komerceRaja"; // optional, keep if you have this

// Mount the host (HMR-safe singleton) so it can listen for `checkout:start`.
import { mountShippingHost } from "./host";
mountShippingHost();
