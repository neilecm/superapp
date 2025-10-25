import { useMemo, useState } from "react";
import type { Product, OrderItem } from "@/core/types";
import { MOCK_PRODUCTS } from "../data/mock";

export function CatalogModal({
  onClose,
  onSelect,
  preselectId,
}: {
  onClose: () => void;
  onSelect: (item: OrderItem) => void;
  preselectId?: string;
}) {
  const [query, setQuery] = useState("");

  const products: Product[] = MOCK_PRODUCTS;
  const filtered = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Catalog</h2>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
      </div>

      <div className="mt-3">
        <input
          className="w-full border rounded-xl p-2 text-sm"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className={`rounded-2xl border bg-white overflow-hidden shadow-sm ${preselectId === p.id ? "ring-2 ring-black" : ""}`}>
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">Rp {p.price.toLocaleString("id-ID")}</div>
              <button
                className="mt-3 w-full rounded-xl bg-black text-white px-3 py-2 text-sm"
                onClick={() => onSelect({ productId: p.id, name: p.name, price: p.price, qty: 1, imageUrl: p.imageUrl })}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
