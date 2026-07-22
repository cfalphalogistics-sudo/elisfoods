"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { products, generateOrderReference, storeSettings, deliveryAreas } from "@/lib/data";
import type { AddOn, ProductVariation } from "@/lib/data";

const CART_STORAGE_KEY = "elis-cart";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  spiceLevel?: string;
  variation?: ProductVariation;
  addOns: AddOn[];
  instructions: string;
}

interface CartContextType {
  items: CartItem[];
  // False until the real cart has been loaded from localStorage (see
  // CartProvider). Pages that branch on `items` being empty at mount —
  // treating it as "cart is empty" or gating a one-time effect — must wait
  // for this to be true first, or they'll act on the pre-hydration [] state.
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (id: string, updates: Partial<Omit<CartItem, "id">>) => void;
  clearCart: () => void;
  subtotal: number;
  addOnsTotal: number;
  packagingFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
  itemCount: number;
  deliveryArea: string;
  setDeliveryArea: (area: string) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: string | null;
  applyCoupon: () => void;
  orderReference: string;
  resetOrderReference: () => void;
  customer: CustomerInfo;
  setCustomer: (info: Partial<CustomerInfo>) => void;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  area: string;
  ghanaPostGps: string;
  landmark: string;
  deliveryInstructions: string;
  method: "delivery" | "pickup";
  preferredTime: string;
}

const defaultCustomer: CustomerInfo = {
  name: "",
  phone: "",
  altPhone: "",
  email: "",
  address: "",
  area: "",
  ghanaPostGps: "",
  landmark: "",
  deliveryInstructions: "",
  method: "delivery",
  preferredTime: "As soon as possible",
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Start empty on both the prerendered HTML and the client's first hydration
  // pass, then load real localStorage data after mount. Reading localStorage
  // directly in the initializer would make the first client render diverge
  // from the static HTML (this site is statically exported) and trigger a
  // React hydration mismatch (error #418).
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [deliveryArea, setDeliveryArea] = useState("lashibi");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  // Placeholder only — generateOrderReference() uses the current time, which
  // would also differ between build time and hydration time. The real order
  // number always comes from the API response once an order is created.
  const [orderReference, setOrderReference] = useState("");
  const [customer, setCustomerState] = useState<CustomerInfo>(defaultCustomer);

  useEffect(() => {
    setItems(loadStoredCart());
    setOrderReference(generateOrderReference());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const resetOrderReference = useCallback(() => setOrderReference(generateOrderReference()), []);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    setItems((prev) => [
      ...prev,
      { ...item, id: `${item.productId}-${Date.now().toString(36)}` },
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Omit<CartItem, "id">>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    resetOrderReference();
  }, [resetOrderReference]);

  const addOnsTotal = items.reduce(
    (sum, item) => sum + item.addOns.reduce((a, b) => a + b.price, 0) * item.quantity,
    0
  );
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const packagingFee = items.length > 0 ? storeSettings.packagingFee * items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const areaFee = deliveryAreas.find((a) => a.id === deliveryArea)?.fee ?? 0;
  const deliveryFee = customer.method === "delivery" ? areaFee : 0;

  let discount = 0;
  if (appliedCoupon === "ELI10") discount = subtotal * 0.1;
  if (appliedCoupon === "FREEDEL") discount = customer.method === "delivery" ? areaFee : 0;

  const total = Math.max(0, subtotal + addOnsTotal + packagingFee + deliveryFee - discount);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = useCallback(() => {
    const code = couponCode.trim().toUpperCase();
    if (code === "ELI10" || code === "FREEDEL") {
      setAppliedCoupon(code);
    } else {
      setAppliedCoupon(null);
    }
  }, [couponCode]);

  const setCustomer = useCallback((info: Partial<CustomerInfo>) => {
    setCustomerState((prev) => ({ ...prev, ...info }));
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated: hydrated,
        addItem,
        removeItem,
        updateQuantity,
        updateItem,
        clearCart,
        subtotal,
        addOnsTotal,
        packagingFee,
        deliveryFee,
        discount,
        total,
        itemCount,
        deliveryArea,
        setDeliveryArea,
        couponCode,
        setCouponCode,
        appliedCoupon,
        applyCoupon,
        orderReference,
        resetOrderReference,
        customer,
        setCustomer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}
