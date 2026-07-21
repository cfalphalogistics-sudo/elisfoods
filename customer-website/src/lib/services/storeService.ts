import { storeSettings as staticSettings, deliveryAreas as staticAreas } from "@/lib/data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const obj = data as { data?: unknown } | undefined;
  return Array.isArray(obj?.data) ? (obj.data as T[]) : [];
}

function normalizePrice(amount: number | undefined): number {
  return typeof amount === "number" ? amount / 100 : 0;
}

interface ApiStoreSettings {
  phone: string;
  whatsapp: string;
  email: string;
  social: { facebook: string; instagram: string; tiktok: string };
  hours: { open: string; close: string };
  packagingFee: number;
  isOpen: boolean;
}

function normalizeStoreSettings(s: ApiStoreSettings) {
  return {
    phone: s.phone,
    whatsapp: s.whatsapp,
    email: s.email,
    hours_open: s.hours.open,
    hours_close: s.hours.close,
    is_open: s.isOpen,
  };
}

const fallbackStoreSettings = {
  phone: staticSettings.phone,
  whatsapp: staticSettings.whatsapp,
  email: staticSettings.email,
  hours_open: staticSettings.hours.open,
  hours_close: staticSettings.hours.close,
  is_open: staticSettings.isOpen,
};

export async function fetchStoreSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/store-settings`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    if (!data || typeof data !== "object") return fallbackStoreSettings;
    return normalizeStoreSettings(data as ApiStoreSettings);
  } catch (error) {
    console.error("Failed to fetch store settings from API, using static data:", error);
    return fallbackStoreSettings;
  }
}

interface ApiDeliveryArea {
  id?: number;
  name: string;
  slug: string;
  fee: number;
  min_order: number;
}

function normalizeDeliveryArea(area: ApiDeliveryArea) {
  return {
    id: area.slug,
    name: area.name,
    fee: normalizePrice(area.fee),
    minOrder: normalizePrice(area.min_order),
  };
}

export async function fetchDeliveryAreas() {
  try {
    const res = await fetch(`${API_BASE}/api/delivery-areas`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return asArray<ApiDeliveryArea>(data).map(normalizeDeliveryArea);
  } catch (error) {
    console.error("Failed to fetch delivery areas from API, using static data:", error);
    return staticAreas;
  }
}

export async function validateCoupon(code: string) {
  try {
    const res = await fetch(`${API_BASE}/api/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to validate coupon:", error);
    return null;
  }
}
