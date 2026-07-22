import type { Order, OrderStatus } from "@/contexts/OrderContext";

/**
 * Order data service.
 *
 * Currently stores orders in localStorage via the OrderContext. When the Laravel
 * API is ready, swap these calls to `fetch('/api/orders')` endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function toApiPayload(payload: Omit<Order, "createdAt">): unknown {
  return {
    reference: payload.reference,
    items: payload.items.map((item) => ({
      product_id: null,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size ?? null,
      spice_level: item.spiceLevel ?? null,
      variation_label: item.variation?.label ?? null,
      instructions: item.instructions ?? null,
      add_ons: item.addOns.map((addOn) => ({ name: addOn.name, price: addOn.price })),
    })),
    customer: {
      name: payload.customer.name,
      phone: payload.customer.phone,
      alt_phone: payload.customer.altPhone || null,
      email: payload.customer.email || null,
      method: payload.customer.method,
      address: payload.customer.address || null,
      ghana_post_gps: payload.customer.ghanaPostGps || null,
      landmark: payload.customer.landmark || null,
      delivery_instructions: payload.customer.deliveryInstructions || null,
      area: payload.customer.area || null,
      preferred_time: payload.customer.preferredTime || null,
    },
    payment_method: payload.paymentMethod,
    totals: {
      subtotal: payload.subtotal,
      add_ons_total: payload.addOnsTotal,
      packaging_fee: payload.packagingFee,
      delivery_fee: payload.deliveryFee,
      discount: payload.discount,
      total: payload.total,
    },
  };
}

export async function createOrder(payload: Omit<Order, "createdAt">): Promise<Order> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toApiPayload(payload)),
    });
    if (!res.ok) throw new Error("Failed to create order");
    const created = (await res.json()) as Order;
    return created;
  }

  // Fallback for local-only demo
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const reference = `EF-${day}${month}-${hours}${minutes}`;
  const order: Order = { ...payload, reference, createdAt: date.toISOString() };
  return order;
}

export async function getOrders(): Promise<Order[]> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/orders`);
    return res.json() as Promise<Order[]>;
  }
  return [];
}

/** Maps a backend order status to the frontend timeline status. */
const API_STATUS_MAP: Record<string, OrderStatus> = {
  placed: "placed",
  confirmed: "confirmed",
  preparing: "preparing",
  "out-for-delivery": "dispatched",
  delivered: "delivered",
  cancelled: "cancelled",
};

interface ApiOrder {
  reference: string;
  customer_name: string;
  phone: string;
  alt_phone: string | null;
  email: string | null;
  method: "delivery" | "pickup";
  address: string | null;
  ghana_post_gps: string | null;
  landmark: string | null;
  delivery_instructions: string | null;
  preferred_time: string | null;
  payment_method: "hubtel" | "cash" | "whatsapp";
  status: string;
  subtotal: number;
  add_ons_total: number;
  packaging_fee: number;
  delivery_fee: number;
  discount: number;
  total: number;
  created_at: string;
  items?: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    size: string | null;
    spice_level: string | null;
    instructions: string | null;
    add_ons: Array<{ name: string; price: number }> | null;
  }>;
}

function mapApiOrder(data: ApiOrder): Order {
  return {
    reference: data.reference,
    items: (data.items ?? []).map((item) => ({
      id: String(item.id),
      productId: "",
      name: item.name,
      image: "",
      price: item.price / 100,
      quantity: item.quantity,
      size: item.size ?? undefined,
      spiceLevel: item.spice_level ?? undefined,
      addOns: (item.add_ons ?? []).map((a, i) => ({
        id: String(i),
        name: a.name,
        price: a.price / 100,
        category: "side" as const,
      })),
      instructions: item.instructions ?? "",
    })),
    customer: {
      name: data.customer_name,
      phone: data.phone,
      altPhone: data.alt_phone ?? "",
      email: data.email ?? "",
      address: data.address ?? "",
      area: "",
      ghanaPostGps: data.ghana_post_gps ?? "",
      landmark: data.landmark ?? "",
      deliveryInstructions: data.delivery_instructions ?? "",
      method: data.method,
      preferredTime: data.preferred_time ?? "",
    },
    paymentMethod: data.payment_method,
    status: API_STATUS_MAP[data.status] ?? "placed",
    subtotal: data.subtotal / 100,
    addOnsTotal: data.add_ons_total / 100,
    packagingFee: data.packaging_fee / 100,
    deliveryFee: data.delivery_fee / 100,
    discount: data.discount / 100,
    total: data.total / 100,
    createdAt: data.created_at,
  };
}

/**
 * Fetches a single order (with live status) from the API by its reference.
 * Returns null when the API is unreachable or the order does not exist.
 */
export async function fetchOrderByReference(reference: string): Promise<Order | null> {
  if (!API_BASE || !reference.trim()) return null;

  try {
    const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(reference.trim())}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return mapApiOrder((await res.json()) as ApiOrder);
  } catch {
    return null;
  }
}

export function statusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    placed: "Order Placed",
    confirmed: "Payment Confirmed",
    accepted: "Order Accepted",
    preparing: "Preparing your food",
    ready: "Ready for pickup",
    dispatched: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function statusIcon(status: OrderStatus): string {
  const icons: Record<OrderStatus, string> = {
    placed: "receipt",
    confirmed: "payments",
    accepted: "check_circle",
    preparing: "skillet",
    ready: "inventory_2",
    dispatched: "local_shipping",
    delivered: "done_all",
    cancelled: "cancel",
  };
  return icons[status];
}
