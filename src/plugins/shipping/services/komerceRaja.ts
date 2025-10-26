// Minimal, no external helpers.
// Talks to your Supabase proxy set in VITE_RAJAONGKIR_PROXY
const BASE = import.meta.env.VITE_RAJAONGKIR_PROXY as string;

function errMsg(j: any, status: number) {
  return j?.meta?.message || j?.message || `HTTP ${status}`;
}

export async function searchDomestic(search: string, limit = 50, offset = 0) {
  const u = new URL(`${BASE}/destination/domestic-destination`);
  u.searchParams.set("search", search);
  u.searchParams.set("limit", String(limit));
  u.searchParams.set("offset", String(offset));

  const r = await fetch(u.toString());
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(errMsg(j, r.status));
  return j.data as any[]; // array of destinations
}

export async function calcDomesticCost(params: {
  origin: string | number;
  destination: string | number;
  weight: number;               // grams
  courier: string;              // e.g. "jne"
  price?: "lowest" | "highest"; // optional
}) {
  const body = new URLSearchParams({
    origin: String(params.origin),
    destination: String(params.destination),
    weight: String(params.weight),
    courier: params.courier,
    price: params.price || "lowest",
  });

  const r = await fetch(`${BASE}/calculate/domestic-cost`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(errMsg(j, r.status));
  return j.data as any[]; // list of services with cost/etd
}
