import type { Order, OrderStatus } from "@/contexts/OrderContext";

/**
 * Order data service.
 *
 * Currently stores orders in localStorage via the OrderContext. When the Laravel
 * API is ready, swap these calls to `fetch('/api/orders')` endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

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
    const res = await fetch(`${API_BASE}/orders`, {
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
    const res = await fetch(`${API_BASE}/orders`);
    return res.json() as Promise<Order[]>;
  }
  return [];
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
