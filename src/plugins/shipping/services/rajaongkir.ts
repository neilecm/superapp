import type { ShippingProvider, Province, City, District, Subdistrict, CostRequest, CostResult, CourierCost, WaybillResult } from "./provider";

const BASE = (import.meta as any).env.VITE_RAJAONGKIR_PROXY as string;

function requireBase() { if (!BASE) throw new Error("VITE_RAJAONGKIR_PROXY is not set"); }

async function ok<T>(r: Response): Promise<T> { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<T>; }

function mapProvince(r: any): Province { return { id: String(r.province_id ?? r.id), name: r.province ?? r.name }; }
function mapCity(r: any): City { return { id: String(r.city_id ?? r.id), provinceId: String(r.province_id), name: r.city_name ?? r.name, type: r.type, postalCode: r.postal_code }; }
function mapDistrict(r: any): District { return { id: String(r.district_id ?? r.id), cityId: String(r.city_id), name: r.district_name ?? r.name }; }
function mapSubdistrict(r: any): Subdistrict { return { id: String(r.subdistrict_id ?? r.id), districtId: String(r.district_id), name: r.subdistrict_name ?? r.name }; }

function flattenCosts(data: any): CourierCost[] {
  const results = (data?.results ?? data?.rajaongkir?.results ?? []);
  const arr: CourierCost[] = [];
  for (const cr of results) {
    const courierCode = cr.code;
    const courierName = cr.name;
    for (const svc of cr.costs ?? []) {
      for (const c of svc.cost ?? []) {
        arr.push({ courierCode, courierName, service: svc.service, description: svc.description, cost: Number(c.value), etd: c.etd, note: c.note });
      }
    }
  }
  return arr;
}

export const RajaOngkirProvider: ShippingProvider = {
  async listProvinces() {
    requireBase();
    const j = await ok<any>(await fetch(`${BASE}/province`));
    const list = j.results ?? j.rajaongkir?.results ?? j.data ?? [];
    return list.map(mapProvince);
  },
  async listCities(provinceId: string) {
    requireBase();
    const j = await ok<any>(await fetch(`${BASE}/city?province=${encodeURIComponent(provinceId)}`));
    const list = j.results ?? j.rajaongkir?.results ?? j.data ?? [];
    return list.map(mapCity);
  },
  async listDistricts(cityId: string) {
    requireBase();
    const j = await ok<any>(await fetch(`${BASE}/district?city=${encodeURIComponent(cityId)}`));
    const list = j.results ?? j.rajaongkir?.results ?? j.data ?? [];
    return list.map(mapDistrict);
  },
  async listSubdistricts(districtId: string) {
    requireBase();
    const j = await ok<any>(await fetch(`${BASE}/subdistrict?district=${encodeURIComponent(districtId)}`));
    const list = j.results ?? j.rajaongkir?.results ?? j.data ?? [];
    return list.map(mapSubdistrict);
  },
  async calculateCost(req: CostRequest): Promise<CostResult> {
    requireBase();
    const body = { origin: req.originId, originType: req.originType, destination: req.destinationId, destinationType: req.destinationType, weight: req.weight, courier: req.couriers.join(":") };
    const j = await ok<any>(await fetch(`${BASE}/cost`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
    return { results: flattenCosts(j), raw: j };
  },
  async trackWaybill(waybill: string, courierCode: string): Promise<WaybillResult> {
    requireBase();
    const j = await ok<any>(await fetch(`${BASE}/waybill`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ waybill, courier: courierCode }) }));
    const data = j?.rajaongkir ?? j;
    return { isDelivered: !!data?.result?.delivered, summary: data?.result?.summary, manifests: data?.result?.manifest };
  },
};
