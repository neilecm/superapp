# Shipping Plugin — RajaOngkir-ready

This drop-in adds provider abstraction and RajaOngkir V2 (Step-by-Step) via a proxy.

## Files
- `src/plugins/shipping/services/provider.ts` — shared types & interface
- `src/plugins/shipping/services/rajaongkir.ts` — client mapping
- `src/plugins/shipping/services/index.ts` — selects provider via env
- `src/plugins/shipping/ui/ShippingModal.tsx` — calls provider to fetch cost
- `supabase/functions/raja/index.ts` — Edge Function proxy (safe key)

## Env (web)
```
VITE_SHIPPING_PROVIDER=raja
VITE_RAJAONGKIR_PROXY=/functions/raja
VITE_SHIP_ORIGIN_ID=501
VITE_SHIP_ORIGIN_TYPE=city     # city|district|subdistrict
VITE_SHIP_DEST_TYPE=city
VITE_SHIP_COURIERS=jne:pos:tiki
```

## Env (Edge Function)
```
RAJAONGKIR_KEY=your_key
RAJAONGKIR_BASE=https://pro.rajaongkir.com/api
```

## Use
```ts
import "@/plugins/catalog";
import "@/plugins/shipping";  // auto-opens after catalog:done
```

Click **Get rate** inside Shipping to fetch costs; the modal picks the cheapest and continues.
