import type { Product, OrderItem } from "@/core/types";

export type CatalogOpenInput = {
  preselectId?: string;
};

export type CatalogResult =
  | { ok: true; item: OrderItem }
  | { ok: false; reason: "cancel" };

export type CatalogSDK = {
  openCatalog(input?: CatalogOpenInput): void;
  runCatalog(input?: CatalogOpenInput): Promise<CatalogResult>;
};
