"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice, type Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const href = `/product?slug=${product.slug}`;

  return (
    <div className="product-card-hover group bg-surface rounded-2xl overflow-hidden shadow-card flex flex-col h-full">
      <Link href={href} className="relative block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        {product.badge && (
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full font-label-bold text-label-sm text-white ${
            product.badge === "Bestseller" ? "bg-primary" :
            product.badge === "New" ? "bg-secondary-container text-on-secondary-container" :
            product.badge === "Fresh Catch" ? "bg-tertiary" : "bg-primary"
          }`}>
            {product.badge}
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-surface/70 flex items-center justify-center">
            <span className="bg-error text-white px-4 py-2 rounded-full font-label-bold text-label-bold">Sold Out</span>
          </div>
        )}
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading text-headline-md text-on-surface">{product.name}</h3>
          <div className="text-right shrink-0">
            <p className="text-secondary font-bold text-lg">{formatPrice(product.price)}</p>
            {product.comparePrice && (
              <p className="text-on-surface-variant line-through text-sm">{formatPrice(product.comparePrice)}</p>
            )}
          </div>
        </div>
        <p className="text-body-md text-on-surface-variant line-clamp-2 mb-6">{product.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center text-secondary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-on-surface ml-1 font-label-bold">{product.rating}</span>
          </div>
          <Link
            href={href}
            className="px-5 py-2 bg-primary text-white rounded-xl font-label-bold text-label-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            {product.type === "prepared" || product.type === "combo" ? "Select Options" : "Add"}
          </Link>
        </div>
      </div>
    </div>
  );
}
