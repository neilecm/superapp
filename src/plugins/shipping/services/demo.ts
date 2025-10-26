import type { Address, ShippingRate } from "@/core/types";
export function demoRate(_: Address): ShippingRate { return { courierCode: "JNE", service: "REG", etd: "2-3 days", cost: 20000 }; }
