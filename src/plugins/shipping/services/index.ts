import type { ShippingProvider, CostResult } from "./provider";
import { RajaOngkirProvider } from "./rajaongkir";

const DemoProvider: ShippingProvider = {
  async listProvinces() { return []; },
  async listCities() { return []; },
  async listDistricts() { return []; },
  async listSubdistricts() { return []; },
  async calculateCost() { return { results: [{ courierCode: "JNE", service: "REG", cost: 20000, etd: "2-3" }], raw: { source: "demo" } }; },
  async trackWaybill() { return { isDelivered: false, manifests: [] }; },
};

export function getProvider(): ShippingProvider {
  const mode = (import.meta as any).env.VITE_SHIPPING_PROVIDER || "demo";
  if (String(mode).toLowerCase() === "raja") return RajaOngkirProvider;
  return DemoProvider;
}
