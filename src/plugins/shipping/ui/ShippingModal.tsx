import { useState } from "react";
import type { Address, ShippingRate, OrderItem } from "@/core/types";
import { getProvider } from "../services";

export function ShippingModal({
  items, onClose, onConfirm,
}: {
  items: OrderItem[];
  onClose: () => void;
  onConfirm: (address: Address, rate: ShippingRate) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [cityId, setCityId] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<ShippingRate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const total = subtotal + (quote?.cost ?? 0);

  async function getRate() {
    setError(null); setLoading(true);
    try {
      const prov = getProvider();
      const weight = Math.max(100, items.reduce((w, it) => w + Math.ceil((it.qty || 1) * 200), 0));
      const originId = (import.meta as any).env.VITE_SHIP_ORIGIN_ID || "1";
      const originType = ((import.meta as any).env.VITE_SHIP_ORIGIN_TYPE || "city") as "city"|"district"|"subdistrict";
      const destinationType = ((import.meta as any).env.VITE_SHIP_DEST_TYPE || "city") as "city"|"district"|"subdistrict";
      const couriers = String((import.meta as any).env.VITE_SHIP_COURIERS || "jne:pos:tiki").split(/[:,]/).map((s:string)=>s.trim()).filter(Boolean);

      const res = await prov.calculateCost({ originId, originType, destinationId: cityId, destinationType, weight, couriers });
      const cheapest = [...res.results].sort((a,b)=>a.cost-b.cost)[0];
      if (!cheapest) throw new Error("No courier cost returned");
      setQuote({ courierCode: cheapest.courierCode, service: cheapest.service, etd: cheapest.etd || "", cost: cheapest.cost });
    } catch (e:any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const address: Address = { fullName, phone, line1, city: cityId, province: "", postalCode, country: "ID" };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Shipping</h2>
        <button onClick={onClose} className="text-sm text-gray-500">Close</button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <input className="border rounded-xl p-2" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
        <input className="border rounded-xl p-2" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input className="border rounded-xl p-2 sm:col-span-2" placeholder="Address line" value={line1} onChange={e=>setLine1(e.target.value)} />
        <input className="border rounded-xl p-2" placeholder="Destination City/District ID" value={cityId} onChange={e=>setCityId(e.target.value)} />
        <input className="border rounded-xl p-2" placeholder="Postal code" value={postalCode} onChange={e=>setPostalCode(e.target.value)} />
      </div>

      <div className="mt-3 flex gap-2">
        <button className="rounded-xl bg-gray-200 px-3 py-2 text-sm" onClick={getRate} disabled={!cityId || loading}>
          {loading ? "Fetching rate…" : "Get rate"}
        </button>
        {quote && <span className="text-sm self-center">Best: {quote.courierCode} {quote.service} · Rp {quote.cost.toLocaleString("id-ID")} ({quote.etd || "-"})</span>}
        {error && <span className="text-sm text-red-600 self-center">{error}</span>}
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm">
        <div className="flex justify-between"><span>Items subtotal</span><span>Rp {subtotal.toLocaleString("id-ID")}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>Rp {(quote?.cost ?? 0).toLocaleString("id-ID")}</span></div>
        <div className="mt-1 flex justify-between font-semibold"><span>Total</span><span>Rp {total.toLocaleString("id-ID")}</span></div>
      </div>

      <button className="mt-4 rounded-2xl bg-black text-white px-4 py-2 disabled:opacity-50" disabled={!fullName || !line1 || !cityId || !quote} onClick={()=>onConfirm(address, quote!)}>
        Continue to checkout
      </button>
    </div>
  );
}
