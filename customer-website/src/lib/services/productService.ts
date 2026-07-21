import { products as staticProducts, categories as staticCategories, addOns as staticAddOns } from "@/lib/data";
import type { Product, AddOn, ProductVariation } from "@/lib/data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Product data service.
 *
 * Fetches data from the Laravel API backend.
 * Falls back to static data if API is unavailable.
 */

export function getProducts(): Product[] {
  return staticProducts;
}

export function getProductById(id: string): Product | undefined {
  return staticProducts.find((p) => p.id === id);
}

export function getCategories() {
  return staticCategories;
}

export function getAddOns(): AddOn[] {
  return staticAddOns;
}

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const obj = data as { data?: unknown } | undefined;
  return Array.isArray(obj?.data) ? (obj.data as T[]) : [];
}

function normalizePrice(amount: number | undefined): number {
  return typeof amount === "number" ? amount / 100 : 0;
}

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

function normalizeCategory(c: ApiCategory) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    sort_order: c.sort_order,
    is_active: c.is_active,
  };
}

interface ApiAddOn {
  id: number;
  name: string;
  slug: string;
  category: "side" | "sauce" | "protein" | "drink";
  price: number;
  is_active?: boolean;
}

function normalizeAddOn(a: ApiAddOn): AddOn {
  return {
    id: String(a.id),
    name: a.name,
    price: normalizePrice(a.price),
    category: a.category,
  };
}

interface ApiVariation {
  id: number;
  product_id: number;
  label: string;
  price: number;
  stock_quantity: number;
}

function normalizeVariation(v: ApiVariation): ProductVariation {
  return {
    id: String(v.id),
    label: v.label,
    price: normalizePrice(v.price),
    stock: v.stock_quantity,
  };
}

interface ApiSize {
  label: string;
  price: number;
}

interface ApiOptions {
  sizes?: ApiSize[];
  spiceLevels?: string[];
}

interface ApiProduct {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  category: ApiCategory;
  price: number;
  compare_price: number | null;
  image: string;
  type: "prepared" | "marinated" | "frozen" | "combo";
  prep_time: number | null;
  rating: number;
  badge: string | null;
  available: boolean;
  is_featured: boolean;
  options: ApiOptions | null;
  add_ons: ApiAddOn[];
  variations: ApiVariation[];
}

function normalizeOptions(options: ApiOptions | null | undefined): Product["options"] {
  if (!options) return undefined;
  return {
    sizes: options.sizes?.map((s) => ({ label: s.label, price: normalizePrice(s.price) })),
    spiceLevels: options.spiceLevels,
  };
}

function normalizeProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    slug: p.slug,
    name: p.name,
    description: p.description,
    longDescription: p.long_description || undefined,
    category: p.category?.slug || String(p.category_id),
    price: normalizePrice(p.price),
    comparePrice: p.compare_price ? normalizePrice(p.compare_price) : undefined,
    image: p.image,
    type: p.type,
    prepTime: p.prep_time ? `${p.prep_time} min` : "—",
    available: p.available,
    rating: p.rating,
    badge: p.badge || undefined,
    options: normalizeOptions(p.options),
    addOns: p.add_ons?.map((a) => String(a.id)) || [],
    variations: p.variations?.map(normalizeVariation) || [],
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return asArray<ApiProduct>(data).map(normalizeProduct);
  } catch (error) {
    console.error("Failed to fetch products from API, using static data:", error);
    return staticProducts;
  }
}

export async function fetchProductById(slug: string): Promise<Product | undefined> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${slug}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    if (!data || typeof data !== "object") return undefined;
    return normalizeProduct(data as ApiProduct);
  } catch (error) {
    console.error(`Failed to fetch product ${slug} from API, using static data:`, error);
    return staticProducts.find((p) => p.slug === slug || p.id === slug);
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return asArray<ApiCategory>(data).map(normalizeCategory);
  } catch (error) {
    console.error("Failed to fetch categories from API, using static data:", error);
    return staticCategories;
  }
}

export async function fetchAddOns(): Promise<AddOn[]> {
  try {
    const res = await fetch(`${API_BASE}/api/add-ons`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return asArray<ApiAddOn>(data).map(normalizeAddOn);
  } catch (error) {
    console.error("Failed to fetch add-ons from API, using static data:", error);
    return staticAddOns;
  }
}
