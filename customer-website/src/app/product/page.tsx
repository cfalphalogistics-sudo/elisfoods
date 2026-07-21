"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { fetchProductById } from "@/lib/services/productService";
import type { Product } from "@/lib/data";
import ProductDetailClient from "./[id]/ProductDetailClient";
import MarinatedDetailClient from "../marinated/[id]/MarinatedDetailClient";

function ProductContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const data = await fetchProductById(slug);
      if (!cancelled) {
        setProduct(data || null);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (!slug) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center">
        <h1 className="font-heading text-headline-lg mb-4">Product not found</h1>
        <Link href="/menu" className="text-primary font-label-bold">Back to menu</Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-high rounded-xl w-1/3" />
          <div className="h-96 bg-surface-container-high rounded-3xl" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center">
        <h1 className="font-heading text-headline-lg mb-4">Product not found</h1>
        <Link href="/menu" className="text-primary font-label-bold">Back to menu</Link>
      </main>
    );
  }

  if (product.type === "marinated" || product.type === "frozen") {
    return <MarinatedDetailClient product={product} />;
  }

  return <ProductDetailClient product={product} />;
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-high rounded-xl w-1/3" />
          <div className="h-96 bg-surface-container-high rounded-3xl" />
        </div>
      </main>
    }>
      <ProductContent />
    </Suspense>
  );
}
