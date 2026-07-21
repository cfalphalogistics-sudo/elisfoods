"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice, storeSettings } from "@/lib/data";
import { useOrders, type Order } from "@/contexts/OrderContext";
import { statusLabel, statusIcon } from "@/lib/services/orderService";

const allStatuses = [
  { id: "placed", label: "Order Placed", icon: "receipt" },
  { id: "confirmed", label: "Payment Confirmed", icon: "payments" },
  { id: "accepted", label: "Order Accepted", icon: "check_circle" },
  { id: "preparing", label: "Preparing your food", icon: "skillet" },
  { id: "ready", label: "Ready for pickup", icon: "inventory_2" },
  { id: "dispatched", label: "Out for delivery", icon: "local_shipping" },
  { id: "delivered", label: "Delivered", icon: "done_all" },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const { getOrderByReference } = useOrders();
  const [orderNumber, setOrderNumber] = useState(initialRef);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(Boolean(initialRef));
  const [order, setOrder] = useState<Order | null>(getOrderByReference(initialRef) || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = getOrderByReference(orderNumber);
    setOrder(found ?? null);
    setSubmitted(true);
  };

  const statusIndex = order ? allStatuses.findIndex((s) => s.id === order.status) : -1;
  const currentIndex = Math.max(0, statusIndex);

  useEffect(() => {
    if (!submitted || !order) return;
    const timer = setInterval(() => {
      // In a real app the status comes from the backend; this is a local demo progression.
      setOrder((prev) => {
        if (!prev) return prev;
        const idx = allStatuses.findIndex((s) => s.id === prev.status);
        const next = allStatuses[idx + 1];
        return next && next.id !== "cancelled" ? { ...prev, status: next.id as Order["status"] } : prev;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [submitted, order]);

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <h1 className="font-heading text-headline-xl mb-stack-md">Track Your Order</h1>

      {!submitted || !order ? (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-surface rounded-3xl p-6 shadow-card">
          {!order && submitted && (
            <p className="text-error text-body-md mb-4">Order not found. Please check the reference and try again.</p>
          )}
          <div className="mb-4">
            <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Order Number</label>
            <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="EF-XXXXXX-XXXX" />
          </div>
          <div className="mb-6">
            <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="024 987 5848" />
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all">Track Order</button>
        </form>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="bg-surface rounded-3xl p-6 shadow-card mb-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div>
                <p className="text-on-surface-variant text-label-sm uppercase tracking-wider font-label-bold">Order Number</p>
                <p className="font-heading text-headline-md">{order.reference}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-on-surface-variant text-label-sm uppercase tracking-wider font-label-bold">Status</p>
                <span className="inline-flex items-center gap-2 px-4 py-1 bg-primary/10 text-primary rounded-full font-label-bold text-label-bold">
                  <span className="material-symbols-outlined text-sm">{statusIcon(order.status)}</span> {statusLabel(order.status)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-body-md">
              <div>
                <p className="text-on-surface-variant text-label-sm">Customer</p>
                <p className="font-label-bold">{order.customer.name || order.customer.phone}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-sm">Payment</p>
                <p className="font-label-bold text-tertiary capitalize">{order.paymentMethod === "hubtel" ? "Hubtel" : order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-sm">Total</p>
                <p className="font-label-bold text-secondary">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-6 shadow-card">
            <h2 className="font-heading text-headline-md mb-6">Order Timeline</h2>
            <div className="relative">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-surface-container-highest" />
              {allStatuses.map((status, idx) => {
                const active = idx <= currentIndex;
                const current = idx === currentIndex;
                return (
                  <div key={status.id} className="relative flex items-start gap-4 mb-6 last:mb-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 ${active ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"}`}>
                      <span className="material-symbols-outlined text-sm">{status.icon}</span>
                    </div>
                    <div>
                      <p className={`font-label-bold text-label-bold ${current ? "text-primary" : active ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {status.label}
                      </p>
                      {current && <p className="text-on-surface-variant text-label-sm">Your food is being prepared now.</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
            <a href={`tel:${storeSettings.phone}`} className="px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-label-bold text-label-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">phone</span> Call Eli&apos;s Food
            </a>
            <a href={`https://wa.me/${storeSettings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white rounded-full font-label-bold text-label-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">chat</span> WhatsApp Support
            </a>
            <button onClick={() => { setSubmitted(false); setOrder(null); }} className="px-6 py-3 border-2 border-outline-variant text-on-surface rounded-full font-label-bold text-label-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">search</span> Track Another
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-stack-lg text-center text-on-surface-variant">Loading tracking...</div>}>
      <TrackContent />
    </Suspense>
  );
}
