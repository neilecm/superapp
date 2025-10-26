export type Province = { id: string; name: string };
export type City = { id: string; provinceId: string; name: string; type?: string; postalCode?: string };
export type District = { id: string; cityId: string; name: string };
export type Subdistrict = { id: string; districtId: string; name: string };

export type CourierCost = {
  courierCode: string;
  courierName?: string;
  service: string;
  description?: string;
  cost: number;
  etd?: string;
  note?: string;
};

export type WaybillEvent = { date?: string; desc?: string; city?: string; status?: string; };
export type WaybillResult = { isDelivered?: boolean; summary?: Record<string, any>; manifests?: WaybillEvent[]; };

export type CostRequest = {
  originId: string;
  originType: "district" | "subdistrict" | "city";
  destinationId: string;
  destinationType: "district" | "subdistrict" | "city";
  weight: number;
  couriers: string[];
};

export type CostResult = { results: CourierCost[]; raw?: any; };

export interface ShippingProvider {
  listProvinces(): Promise<Province[]>;
  listCities(provinceId: string): Promise<City[]>;
  listDistricts(cityId: string): Promise<District[]>;
  listSubdistricts(districtId: string): Promise<Subdistrict[]>;
  calculateCost(req: CostRequest): Promise<CostResult>;
  trackWaybill(waybill: string, courierCode: string): Promise<WaybillResult>;
}
