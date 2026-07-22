"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createOrder as createOrderApi } from "@/lib/services/orderService";
import type { CartItem, CustomerInfo } from "./CartContext";

export type OrderStatus = "placed" | "confirmed" | "accepted" | "preparing" | "ready" | "dispatched" | "delivered" | "cancelled";

export interface Order {
  reference: string;
  items: CartItem[];
  customer: CustomerInfo;
  paymentMethod: "hubtel" | "cash" | "whatsapp";
  status: OrderStatus;
  subtotal: number;
  addOnsTotal: number;
  packagingFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
  createdAt: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "createdAt">) => Promise<Order>;
  getOrderByReference: (reference: string) => Order | undefined;
  updateOrderStatus: (reference: string, status: OrderStatus) => void;
}

const ORDER_STORAGE_KEY = "elis-orders";

function loadStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Order[]) : [];
  } catch {
    return [];
  }
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  // Start empty on both the prerendered HTML and the client's first hydration
  // pass, then load real localStorage data after mount. Reading localStorage
  // directly in the initializer would make the first client render diverge
  // from the static HTML (this site is statically exported) and trigger a
  // React hydration mismatch (error #418).
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOrders(loadStoredOrders());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const addOrder = useCallback(async (order: Omit<Order, "createdAt">): Promise<Order> => {
    const created = await createOrderApi(order);
    setOrders((prev) => [created, ...prev]);
    return created;
  }, []);

  const getOrderByReference = useCallback(
    (reference: string) => orders.find((o) => o.reference.toLowerCase() === reference.toLowerCase()),
    [orders]
  );

  const updateOrderStatus = useCallback((reference: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.reference.toLowerCase() === reference.toLowerCase() ? { ...o, status } : o))
    );
  }, []);

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrderByReference, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within OrderProvider");
  return context;
}
