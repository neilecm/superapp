// Global, plugin-agnostic types you can reuse later.

export type Money = number; // keep in IDR major units for now

export type Product = {
  id: string;
  name: string;
  price: Money;
  imageUrl?: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: Money;
  qty: number;
  imageUrl?: string;
  variantId?: string;
};

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string; // e.g., "ID"
};

export type ShippingRate = {
  courierCode: string; // JNE, POS, etc.
  service: string;     // REG, YES, etc.
  etd: string;         // "2-3 days"
  cost: Money;
};

export type OrderDraft = {
  items: OrderItem[];
  address?: Address;
  shipping?: ShippingRate;
  subtotal?: Money;
  total?: Money;
};
