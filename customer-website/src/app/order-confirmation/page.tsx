"use client";

import { useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { formatPrice, storeSettings } from "@/lib/data";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const method = searchParams.get("method") || "hubtel";
  const { total, customer, orderReference, items, clearCart, deliveryFee, discount, subtotal, addOnsTotal, packagingFee } = useCart();
  const { addOrder } = useOrders();

  const buildWhatsAppMessage = useCallback(() => {
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
  }, [customer, items, orderReference, total]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await addOrder({
        reference: orderReference,
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

      if (method === "whatsapp") {
        const message = buildWhatsAppMessage();
        const url = `https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
      }
      clearCart();
    })();

    return () => { cancelled = true; };
  }, [method, buildWhatsAppMessage, clearCart, addOrder, orderReference, items, customer, total, deliveryFee, discount, subtotal, addOnsTotal, packagingFee]);

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
          <span className="font-label-bold text-right">{orderReference}</span>
          <span className="text-on-surface-variant">Total</span>
          <span className="font-label-bold text-right text-secondary">{formatPrice(total)}</span>
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
            {items.map((item) => (
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
        <Link href="/track" className="px-8 py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2">
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
