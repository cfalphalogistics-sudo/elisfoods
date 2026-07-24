"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { formatPrice } from "@/lib/data";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";

interface OrderSummary {
  items: CartItem[];
  total: number;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const method = searchParams.get("method") || "hubtel";
  const { total, customer, items, clearCart, deliveryFee, discount, subtotal, addOnsTotal, packagingFee, isHydrated } = useCart();
  const { addOrder } = useOrders();
  const storeSettings = useStoreSettings();
  // The reference shown here must be the one the backend actually created —
  // the client-side placeholder is never accepted by the API, so displaying
  // it would show the customer a number that doesn't exist in the database
  // and can't be tracked.
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // clearCart() runs right after the order is placed, which zeroes out the
  // live `items`/`total` from useCart(). Freeze a copy at submission time so
  // the confirmation view keeps showing what was actually ordered.
  const [summary, setSummary] = useState<OrderSummary | null>(null);

  const buildWhatsAppMessage = useCallback((orderReference: string) => {
    const lines: (string | false)[] = [
      "Hello Eli's Food, I would like to place an order.",
      "",
      `Order Reference: ${orderReference}`,
      `Customer: ${customer.name}`,
      `Phone: ${customer.phone}`,
      `Order Type: ${customer.method === "delivery" ? "Delivery" : "Pickup"}`,
      "",
      "Items",
      ...items.map((i) => {
        const parts = [i.name, i.size && `(${i.size})`, i.spiceLevel, i.variation?.label].filter(Boolean);
        const addons = i.addOns.length ? ` + ${i.addOns.map((a) => a.name).join(", ")}` : "";
        return `• ${parts.join(" ")} × ${i.quantity}${addons}`;
      }),
      "",
      customer.deliveryInstructions && `Special Instruction: ${customer.deliveryInstructions}`,
      customer.method === "delivery" && `Delivery Area: ${customer.address}`,
      customer.ghanaPostGps && `GhanaPost GPS: ${customer.ghanaPostGps}`,
      customer.landmark && `Landmark: ${customer.landmark}`,
      `Preferred Time: ${customer.preferredTime}`,
      "",
      `Estimated Total: ${formatPrice(total)}`,
      "",
      "Please confirm availability, final delivery fee and payment instructions.",
    ];
    return lines.filter((line): line is string => typeof line === "string" && line.length > 0).join("\n");
  }, [customer, items, total]);

  useEffect(() => {
    // CartContext loads the real cart from localStorage after mount (to avoid
    // a hydration mismatch — see CartContext.tsx). Wait for that before
    // deciding whether there's anything to submit, otherwise this effect can
    // run first with the pre-hydration empty cart and silently skip the order.
    if (!isHydrated) return;
    if (items.length === 0) {
      setError("We couldn't find an order to confirm. Your cart may already be empty.");
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setSummary({ items: [...items], total });

        const created = await addOrder({
          // Discarded by the API — it always mints its own reference server-side.
          reference: "pending",
          items: [...items],
          customer,
          paymentMethod: method as "hubtel" | "cash" | "whatsapp",
          status: "placed",
          subtotal,
          addOnsTotal,
          packagingFee,
          deliveryFee,
          discount,
          total,
        });

        if (cancelled) return;
        setReference(created.reference);

        if (method === "whatsapp") {
          const message = buildWhatsAppMessage(created.reference);
          const url = `https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent(message)}`;
          // window.open() here happens after an awaited network call, well
          // outside the click handler that triggered this page — browsers
          // treat that as untrusted and silently block the popup (confirmed:
          // this was the actual cause of "orders don't arrive on WhatsApp").
          // A top-level redirect is never blocked, so fall back to it
          // whenever the popup doesn't open.
          const popup = window.open(url, "_blank");
          if (!popup || popup.closed || typeof popup.closed === "undefined") {
            window.location.href = url;
          }
        }
        clearCart();
      } catch {
        if (!cancelled) setError("We couldn't place your order. Please check your connection and try again, or contact us directly.");
      }
    })();

    return () => { cancelled = true; };
    // Deliberately excludes `items`/`customer`/totals etc: clearCart() inside
    // this effect flips `items` to [], and including it in the deps would
    // immediately re-fire the effect and submit a second, empty order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, isHydrated]);

  if (error) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center pb-32">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-error/10 rounded-full mb-6">
          <span className="material-symbols-outlined text-5xl text-error">error</span>
        </div>
        <h1 className="font-heading text-headline-xl mb-2">We hit a snag</h1>
        <p className="text-on-surface-variant text-body-lg max-w-md mx-auto mb-8">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/checkout" className="px-8 py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">refresh</span> Back to Checkout
          </Link>
          <a href={`https://wa.me/${storeSettings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="px-8 py-4 border-2 border-primary text-primary rounded-full font-label-bold text-label-bold hover:bg-primary/5 transition-all inline-flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">chat</span> Contact Us
          </a>
        </div>
      </main>
    );
  }

  if (!reference || !summary) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center pb-32">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6 animate-pulse">
          <span className="material-symbols-outlined text-5xl text-primary">hourglass_top</span>
        </div>
        <h1 className="font-heading text-headline-xl mb-2">Placing your order...</h1>
        <p className="text-on-surface-variant text-body-lg max-w-md mx-auto">This will only take a moment.</p>
      </main>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center pb-32">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-tertiary/10 rounded-full mb-6 animate-bounce">
        <span className="material-symbols-outlined text-5xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <h1 className="font-heading text-headline-xl mb-2">Your Order Has Been Received!</h1>
      {method === "whatsapp" ? (
        <p className="text-on-surface-variant text-body-lg max-w-md mx-auto mb-8">
          We opened WhatsApp with your order summary. Eli&apos;s Food will confirm availability, delivery fee, and payment instructions.
        </p>
      ) : (
        <p className="text-on-surface-variant text-body-lg max-w-md mx-auto mb-8">
          Thank you {customer.name || "Customer"}! Your order is being prepared.
        </p>
      )}

      <div className="bg-surface rounded-3xl p-6 shadow-card max-w-lg mx-auto text-left mb-8 space-y-6">
        <div className="grid grid-cols-2 gap-y-3 text-body-md">
          <span className="text-on-surface-variant">Order Number</span>
          <span className="font-label-bold text-right">{reference}</span>
          <span className="text-on-surface-variant">Total</span>
          <span className="font-label-bold text-right text-secondary">{formatPrice(summary.total)}</span>
          <span className="text-on-surface-variant">Payment</span>
          <span className="font-label-bold text-right capitalize">{method === "hubtel" ? "Hubtel" : method}</span>
          <span className="text-on-surface-variant">Method</span>
          <span className="font-label-bold text-right capitalize">{customer.method}</span>
          <span className="text-on-surface-variant">Phone</span>
          <span className="font-label-bold text-right">{customer.phone}</span>
        </div>

        <div className="border-t border-outline-variant pt-4">
          <h3 className="font-label-bold text-label-bold uppercase tracking-wider text-on-surface-variant mb-3">Items Ordered</h3>
          <ul className="space-y-3">
            {summary.items.map((item) => (
              <li key={item.id} className="flex justify-between items-start text-body-md">
                <div>
                  <p className="font-label-bold text-label-bold">{item.name} × {item.quantity}</p>
                  {item.addOns.length > 0 && (
                    <p className="text-label-sm text-on-surface-variant">+ {item.addOns.map((a) => a.name).join(", ")}</p>
                  )}
                </div>
                <span className="font-label-bold shrink-0">
                  {formatPrice((item.price + item.addOns.reduce((s, a) => s + a.price, 0)) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href={`/track?ref=${encodeURIComponent(reference)}`} className="px-8 py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">location_on</span> Track Order
        </Link>
        <Link href="/menu" className="px-8 py-4 border-2 border-primary text-primary rounded-full font-label-bold text-label-bold hover:bg-primary/5 transition-all inline-flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">shopping_bag</span> Continue Shopping
        </Link>
      </div>

      <p className="text-label-sm text-on-surface-variant mt-8">Estimated ready time: 25 — 45 minutes.</p>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-stack-lg text-center text-on-surface-variant">Confirming your order...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
