import { bus } from "@/core/bus";
import type { CatalogOpenInput, CatalogResult } from "./types";

const OPEN = "catalog:open";
const DONE = "catalog:done";

/** Fire-and-forget open */
export function openCatalog(input: CatalogOpenInput = {}) {
  bus.emit(OPEN, { input });
}

/** Await a selection */
export function runCatalog(input: CatalogOpenInput = {}): Promise<CatalogResult> {
  return new Promise((resolve) => {
    const off = bus.on(DONE, (e) => {
      off();
      resolve((e as any).detail as CatalogResult);
    });
    bus.emit(OPEN, { input });
  });
}
