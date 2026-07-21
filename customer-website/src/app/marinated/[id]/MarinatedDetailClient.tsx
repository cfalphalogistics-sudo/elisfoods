"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { formatPrice, storeSettings, type Product } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";

interface Props {
  product: Product;
}

export default function MarinatedDetailClient({ product }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(product.variations?.[0] || null);
  const [instructions, setInstructions] = useState("");

  const price = selectedVariation?.price || product.price;
  const itemTotal = price * quantity;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price,
      quantity,
      variation: selectedVariation || undefined,
      instructions,
      addOns: [],
    });
    showToast(`${product.name} added to cart`, "success");
    router.push("/cart");
  };

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-card bg-surface">
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          {product.badge && (
            <div className="absolute top-4 left-4 bg-primary text-white px-4 py-1 rounded-full font-label-bold text-label-sm">{product.badge}</div>
          )}
        </div>

        <div className="space-y-stack-md">
          <div>
            <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-label-sm mb-3">
              {product.type === "frozen" ? "Frozen Product" : "Marinated Meat"}
            </span>
            <h1 className="font-heading text-headline-xl mb-2">{product.name}</h1>
            <p className="text-body-lg text-on-surface-variant">{product.longDescription || product.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-secondary font-bold text-headline-lg">{formatPrice(itemTotal)}</span>
            <span className="ml-auto flex items-center text-secondary-container bg-secondary-container/10 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="ml-1 font-label-bold text-on-surface">{product.rating}</span>
            </span>
          </div>

          {product.weight && (
            <div className="grid grid-cols-2 gap-4 text-body-md">
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <span className="block text-on-surface-variant text-label-sm font-label-bold uppercase">Weight</span>
                {product.weight}
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <span className="block text-on-surface-variant text-label-sm font-label-bold uppercase">Packaging</span>
                {product.packageInfo || "Sealed pack"}
              </div>
            </div>
          )}

          {product.variations && product.variations.length > 0 && (
            <div>
              <h3 className="font-label-bold text-label-bold mb-3 uppercase tracking-wider text-on-surface-variant">Select Pack Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v)}
                    className={`px-4 py-2 rounded-xl font-label-bold text-label-bold border transition-all ${
                      selectedVariation?.id === v.id
                        ? "bg-primary text-white border-primary"
                        : "bg-surface-container-low text-on-surface border-outline-variant hover:border-primary"
                    }`}
                  >
                    {v.label} — {formatPrice(v.price)}
                  </button>
                ))}
              </div>
              {selectedVariation && (
                <p className="text-label-sm text-on-surface-variant mt-2">{selectedVariation.stock} packs in stock</p>
              )}
            </div>
          )}

          <div className="bg-tertiary/10 text-tertiary p-4 rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined">ac_unit</span>
            <div>
              <p className="font-label-bold text-label-bold">Keep frozen until ready to prepare</p>
              <p className="text-body-md">{product.storage}</p>
            </div>
          </div>

          <div>
            <h3 className="font-label-bold text-label-bold mb-2 uppercase tracking-wider text-on-surface-variant">Cooking Instructions</h3>
            <p className="text-body-md text-on-surface">{product.cookingInstructions}</p>
          </div>

          <div>
            <h3 className="font-label-bold text-label-bold mb-3 uppercase tracking-wider text-on-surface-variant">Special Instructions</h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any delivery or packaging requests..."
              className="w-full bg-surface-container-low rounded-2xl p-4 border-none focus:ring-2 focus:ring-primary font-body-md text-body-md"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container-low rounded-full">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center material-symbols-outlined text-primary hover:bg-surface-container rounded-l-full">remove</button>
              <span className="w-12 text-center font-heading font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-12 h-12 flex items-center justify-center material-symbols-outlined text-primary hover:bg-surface-container rounded-r-full">add</button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all"
            >
              Add to Cart — {formatPrice(itemTotal)}
            </button>
          </div>

          {!storeSettings.isOpen && (
            <div className="p-4 bg-error-container rounded-2xl text-error text-body-md">
              The store is currently closed. You can still add this to your cart and schedule an order.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
