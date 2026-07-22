"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { addOns, formatPrice } from "@/lib/data";

function CartLineItem({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity, updateItem } = useCart();
  const addOnTotal = item.addOns.reduce((sum, a) => sum + a.price, 0);
  const lineTotal = (item.price + addOnTotal) * item.quantity;

  const removeAddOn = (addonId: string) => {
    updateItem(item.id, { addOns: item.addOns.filter((a) => a.id !== addonId) });
  };

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-card flex gap-4">
      <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-headline-md text-[18px] truncate">{item.name}</h3>
          <span className="text-secondary font-bold shrink-0">{formatPrice(lineTotal)}</span>
        </div>
        <div className="text-on-surface-variant text-body-md mb-2">
          {item.size && <span>Size: {item.size}</span>}
          {item.size && item.spiceLevel && <span className="mx-1">•</span>}
          {item.spiceLevel && <span>{item.spiceLevel}</span>}
          {item.variation && <span>{item.variation.label}</span>}
        </div>
        {item.addOns.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {item.addOns.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container-low rounded-lg text-label-sm text-on-surface-variant">
                {a.name} +{formatPrice(a.price)}
                <button onClick={() => removeAddOn(a.id)} className="text-error hover:text-error/80 material-symbols-outlined text-[16px]">close</button>
              </span>
            ))}
          </div>
        )}
        {item.instructions && (
          <p className="text-label-sm text-on-surface-variant italic truncate">“{item.instructions}”</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center bg-surface-container-low rounded-full">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center material-symbols-outlined text-primary">remove</button>
            <span className="w-8 text-center font-heading font-bold text-sm">{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center material-symbols-outlined text-primary">add</button>
          </div>
          <button onClick={() => removeItem(item.id)} className="text-error font-label-bold text-label-sm flex items-center gap-1 hover:underline">
            <span className="material-symbols-outlined text-sm">delete</span> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, subtotal, addOnsTotal, packagingFee, deliveryFee, discount, total, itemCount, couponCode, setCouponCode, applyCoupon, appliedCoupon, updateItem, isHydrated } = useCart();
  const router = useRouter();
  const { showToast } = useToast();
  const suggestions = addOns.filter((a) => ["coleslaw", "shito", "soft-drink", "fried-yam"].includes(a.id));

  const addSuggested = (addon: typeof addOns[number]) => {
    if (items.length === 0) return;
    const target = items[0];
    if (target.addOns.some((a) => a.id === addon.id)) {
      showToast(`${addon.name} is already added`, "info");
      return;
    }
    updateItem(target.id, { addOns: [...target.addOns, addon] });
    showToast(`${addon.name} added to ${target.name}`, "success");
  };

  // Wait for the real cart to load from localStorage before declaring it
  // empty — items starts at [] on every page load until that finishes (see
  // CartContext), so checking this too early flashes "cart is empty" even
  // when the customer has items.
  if (!isHydrated) {
    return <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg" />;
  }

  if (items.length === 0) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center pb-32">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-surface-container-low rounded-full mb-6">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">shopping_basket</span>
        </div>
        <h1 className="font-heading text-headline-lg mb-2">Your cart is empty</h1>
        <p className="text-on-surface-variant mb-6">Discover delicious meals and add them here.</p>
        <Link href="/menu" className="px-8 py-4 bg-primary text-white rounded-full font-label-bold text-label-bold inline-block">Browse Menu</Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <h1 className="font-heading text-headline-xl mb-stack-md">Your Cart <span className="text-primary">({itemCount})</span></h1>
      <div className="flex flex-col lg:flex-row gap-gutter items-start">
        <div className="flex-1 space-y-4 w-full">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}

          <div className="bg-secondary-container/30 rounded-2xl p-5">
            <h3 className="font-heading text-headline-md mb-3">Suggested Add-ons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((addon) => (
                <div key={addon.id} className="bg-surface rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-label-bold text-label-bold">{addon.name}</p>
                    <p className="text-secondary text-sm">+{formatPrice(addon.price)}</p>
                  </div>
                  <button onClick={() => addSuggested(addon)} className="px-4 py-2 bg-primary text-white rounded-full text-label-sm font-label-bold hover:bg-primary/90">Add</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-96 bg-surface rounded-3xl p-6 shadow-card sticky top-24">
          <h2 className="font-heading text-headline-md mb-6">Order Summary</h2>
          <div className="space-y-3 text-body-md">
            <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal</span><span className="font-label-bold">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Add-ons</span><span className="font-label-bold">{formatPrice(addOnsTotal)}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Packaging</span><span className="font-label-bold">{formatPrice(packagingFee)}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Delivery</span><span className="font-label-bold">{formatPrice(deliveryFee)}</span></div>
            {discount > 0 && <div className="flex justify-between text-tertiary"><span className="font-label-bold">Discount</span><span className="font-label-bold">-{formatPrice(discount)}</span></div>}
          </div>

          <div className="my-6 pt-4 border-t border-outline-variant">
            <div className="flex justify-between items-center">
              <span className="font-heading text-headline-md">Total</span>
              <span className="font-heading text-headline-md text-secondary">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider block mb-2">Promo Code</label>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Try ELI10 or FREEDEL"
                className="flex-1 bg-surface-container-low rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-primary font-body-md"
              />
              <button onClick={applyCoupon} className="px-4 py-2 bg-primary text-white rounded-xl font-label-bold text-label-bold">Apply</button>
            </div>
            {appliedCoupon && <p className="text-tertiary text-label-sm mt-2 font-label-bold">Coupon applied: {appliedCoupon}</p>}
          </div>

          <button onClick={() => router.push("/checkout")} className="w-full py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all mb-3">
            Proceed to Checkout
          </button>
          <Link href="/checkout?whatsapp=1" className="w-full py-4 border-2 border-primary text-primary rounded-full font-label-bold text-label-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all">
            <span className="material-symbols-outlined">chat</span> Order on WhatsApp
          </Link>
        </aside>
      </div>
    </main>
  );
}
