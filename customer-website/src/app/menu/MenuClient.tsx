"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchProducts, fetchCategories } from "@/lib/services/productService";
import { fetchPromotions, type Promotion } from "@/lib/services/storeService";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import type { Product } from "@/lib/data";

interface Category {
  id: string | number;
  name: string;
  slug: string;
  icon: string;
}

const sidebarPromoDefault: Promotion = {
  slot: "menu_sidebar",
  eyebrow: "Weekly Special",
  headline: "Free Delivery on orders over ₵200",
  body: null,
  image: null,
  primary_label: "Order Now",
  primary_url: "/menu",
  secondary_label: null,
  secondary_url: null,
};

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState(500);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [productType, setProductType] = useState<string>("all");
  const [sort, setSort] = useState<"popular" | "price-asc" | "price-desc" | "newest">("popular");
  const [visibleCount, setVisibleCount] = useState(9);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sidebarPromo, setSidebarPromo] = useState<Promotion>(sidebarPromoDefault);

  useEffect(() => {
    const loadData = async () => {
      const [productsData, categoriesData, promotions] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchPromotions(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      if (promotions.menu_sidebar) setSidebarPromo(promotions.menu_sidebar);
    };
    loadData();
  }, []);

  useEffect(() => {
    setActiveCategory(initialCategory);
    setVisibleCount(9);
  }, [initialCategory, search, priceRange, inStockOnly, productType, sort]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const categoryObj = typeof p.category === "string" ? null : (p.category as { slug: string } | undefined);
      const categorySlug = typeof p.category === "string" ? p.category : categoryObj?.slug;
      if (activeCategory !== "all" && categorySlug !== activeCategory) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (p.price > priceRange) return false;
      if (inStockOnly && !p.available) return false;
      if (productType !== "all") {
        if (productType === "ready" && (p.type === "marinated" || p.type === "frozen")) return false;
        if (productType === "raw" && p.type !== "frozen" && p.type !== "marinated") return false;
        if (productType === "marinated" && p.type !== "marinated") return false;
      }
      return true;
    });

    if (sort === "price-asc") result = result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result = result.sort((a, b) => b.price - a.price);
    if (sort === "newest") result = result.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));

    return result;
  }, [activeCategory, search, priceRange, inStockOnly, productType, sort, products]);

  const paginated = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <section className="mb-stack-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h1 className="font-heading text-headline-xl text-on-surface tracking-tight">
            Our Delicious <span className="text-primary">Menu</span>
          </h1>
          <div className="relative w-full md:w-96">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 bg-surface-variant/50 border-none rounded-2xl pl-14 pr-6 focus:ring-2 focus:ring-primary focus:bg-surface transition-all placeholder:text-on-surface-variant/60 font-body text-body-md"
              placeholder="Search for turkey, shrimp, spices..."
              type="text"
            />
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-6 py-3 rounded-full font-label-bold text-label-bold whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 mb-4">
          <p className="text-on-surface-variant text-body-md">{filtered.length} dishes found</p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-surface-container-low text-on-surface rounded-xl px-4 py-2 font-label-bold text-label-sm border-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="popular">Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-gutter">
        <aside className="w-full md:w-72 space-y-8 flex-shrink-0">
          <div className="bg-surface-container-low p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-headline-md">Filters</h3>
              <button
                onClick={() => {
                  setPriceRange(500);
                  setInStockOnly(true);
                  setProductType("all");
                }}
                className="text-primary font-label-bold text-label-sm hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="mb-8">
              <p className="font-label-bold text-label-bold mb-4 uppercase tracking-widest text-on-surface-variant">Price Range</p>
              <input
                type="range"
                min={10}
                max={500}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm mt-2">
                <span>₵10</span>
                <span>₵{priceRange}+</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="font-label-bold text-label-bold mb-4 uppercase tracking-widest text-on-surface-variant">Availability</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-on-surface group-hover:text-primary transition-colors">In Stock</span>
                </label>
              </div>
            </div>

            <div>
              <p className="font-label-bold text-label-bold mb-4 uppercase tracking-widest text-on-surface-variant">Type</p>
              <div className="space-y-3">
                {[
                  { id: "all", label: "All" },
                  { id: "ready", label: "Ready to Eat" },
                  { id: "raw", label: "Raw / Frozen" },
                  { id: "marinated", label: "Spiced / Marinated" },
                ].map((t) => (
                  <label key={t.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="type"
                      value={t.id}
                      checked={productType === t.id}
                      onChange={() => setProductType(t.id)}
                      className="w-5 h-5 border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="text-on-surface group-hover:text-primary transition-colors">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-secondary p-8 text-white">
            <div className="relative z-10">
              {sidebarPromo.eyebrow && (
                <p className="font-label-bold text-label-bold mb-2">{sidebarPromo.eyebrow}</p>
              )}
              <h4 className="font-heading text-headline-md mb-4 leading-tight">{sidebarPromo.headline}</h4>
              {sidebarPromo.primary_label && (
                <Link href={sidebarPromo.primary_url || "/menu"} className="inline-block bg-white text-secondary px-6 py-2 rounded-full font-label-bold text-label-bold">
                  {sidebarPromo.primary_label}
                </Link>
              )}
            </div>
            <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-9xl opacity-10 rotate-12">local_shipping</span>
          </div>
        </aside>

        <div className="flex-grow">
          {filtered.length === 0 ? (
            <div className="text-center py-stack-lg">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
              <h3 className="font-heading text-headline-md mb-2">No products found</h3>
              <p className="text-on-surface-variant">Try a different category or search term.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + 9)}
                    className="px-8 py-3 bg-surface-container-high text-on-surface rounded-full font-label-bold text-label-bold hover:bg-surface-container transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function MenuSkeleton() {
  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <div className="h-10 bg-surface-container-high rounded-xl w-1/3 mb-8 animate-pulse" />
      <div className="h-14 bg-surface-container-high rounded-2xl w-full md:w-96 mb-8 animate-pulse" />
      <div className="flex gap-3 overflow-hidden mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 w-32 bg-surface-container-high rounded-full shrink-0 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {Array.from({ length: 9 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

export default function MenuClient() {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuContent />
    </Suspense>
  );
}
