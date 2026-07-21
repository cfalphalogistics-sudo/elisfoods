"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/data";
import { fetchDeliveryAreas, fetchStoreSettings } from "@/lib/services/storeService";
import Image from "next/image";
import Link from "next/link";

interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  minOrder: number;
}

interface StoreSetting {
  phone: string;
  whatsapp: string;
  email: string;
  hours_open: string;
  hours_close: string;
  is_open: boolean;
  payment_methods: string[];
  pickup_location: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const whatsappMode = searchParams.get("whatsapp") === "1";
  const { items, subtotal, addOnsTotal, packagingFee, deliveryFee, discount, total, customer, setCustomer, deliveryArea, setDeliveryArea } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<string>("hubtel");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSetting | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [areasData, settingsData] = await Promise.all([
        fetchDeliveryAreas(),
        fetchStoreSettings(),
      ]);
      setDeliveryAreas(areasData);
      setStoreSettings(settingsData);
    };
    loadData();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!storeSettings?.payment_methods?.length) return;
    const methods = storeSettings.payment_methods;
    if (whatsappMode && methods.includes("whatsapp") && paymentMethod !== "whatsapp") {
      setPaymentMethod("whatsapp");
      return;
    }
    if (!methods.includes(paymentMethod)) {
      setPaymentMethod(methods[0]);
    }
  }, [storeSettings, whatsappMode, paymentMethod]);

  // Load saved customer details once
  useEffect(() => {
    try {
      const saved = localStorage.getItem("elis-customer");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomer(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, [setCustomer]);

  // Save customer details as they change
  useEffect(() => {
    localStorage.setItem("elis-customer", JSON.stringify(customer));
  }, [customer]);

  if (!mounted) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center pb-32">
        <h1 className="font-heading text-headline-lg mb-2">Loading checkout...</h1>
      </main>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customer.name.trim()) newErrors.name = "Required";
    if (!customer.phone.trim()) newErrors.phone = "Required";
    if (customer.method === "delivery" && !customer.address.trim()) newErrors.address = "Required";
    if (customer.ghanaPostGps && !/^\w{2}-\d{3}-\d{4}$/i.test(customer.ghanaPostGps.trim())) {
      newErrors.ghanaPostGps = "Format: GT-000-0000";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      router.push("/order-confirmation?method=" + paymentMethod);
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center pb-32">
        <h1 className="font-heading text-headline-lg mb-2">Your cart is empty</h1>
        <Link href="/menu" className="text-primary font-label-bold">Browse menu</Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <h1 className="font-heading text-headline-xl mb-stack-md">{whatsappMode ? "Order on WhatsApp" : "Checkout"}</h1>
      <div className="flex flex-col lg:flex-row gap-gutter items-start">
        <form onSubmit={handleSubmit} className="flex-1 space-y-stack-md w-full">
          <section className="bg-surface rounded-3xl p-6 shadow-card">
            <h2 className="font-heading text-headline-md mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">person</span> Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Full Name *</label>
                <input value={customer.name} onChange={(e) => setCustomer({ name: e.target.value })} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="Joshua Abotsi" />
                {errors.name && <p className="text-error text-label-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Phone Number *</label>
                <input value={customer.phone} onChange={(e) => setCustomer({ phone: e.target.value })} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="024 987 5848" />
                {errors.phone && <p className="text-error text-label-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Alternative Phone</label>
                <input value={customer.altPhone} onChange={(e) => setCustomer({ altPhone: e.target.value })} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Email</label>
                <input type="email" value={customer.email} onChange={(e) => setCustomer({ email: e.target.value })} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="Optional" />
              </div>
            </div>
          </section>

          <section className="bg-surface rounded-3xl p-6 shadow-card">
            <h2 className="font-heading text-headline-md mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">local_shipping</span> Fulfilment Method</h2>
            <div className="flex gap-2 mb-4">
              {(["delivery", "pickup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCustomer({ method: m })}
                  className={`flex-1 py-3 rounded-xl font-label-bold text-label-bold border capitalize transition-all ${
                    customer.method === m ? "bg-primary text-white border-primary" : "bg-surface-container-low text-on-surface border-outline-variant hover:border-primary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {customer.method === "delivery" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Delivery Area</label>
                  <select value={deliveryArea} onChange={(e) => setDeliveryArea(e.target.value)} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md">
                    {deliveryAreas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} — {formatPrice(a.fee)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Full Address *</label>
                  <textarea value={customer.address} onChange={(e) => setCustomer({ address: e.target.value })} rows={2} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="House number, street, area..." />
                  {errors.address && <p className="text-error text-label-sm mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">GhanaPost GPS</label>
                    <input value={customer.ghanaPostGps} onChange={(e) => setCustomer({ ghanaPostGps: e.target.value })} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="GT-000-0000" />
                    {errors.ghanaPostGps && <p className="text-error text-label-sm mt-1">{errors.ghanaPostGps}</p>}
                  </div>
                  <div>
                    <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Landmark</label>
                    <input value={customer.landmark} onChange={(e) => setCustomer({ landmark: e.target.value })} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="e.g. Near Shell filling station" />
                  </div>
                </div>
              </div>
            )}
            {customer.method === "pickup" && (
              <div className="p-4 bg-tertiary/10 text-tertiary rounded-2xl">
                <p className="font-label-bold">Pickup Location</p>
                <p className="text-body-md">{storeSettings?.pickup_location ?? "Eli's Food Kitchen, Accra"}</p>
                {storeSettings && <p className="text-label-sm">Opening hours: {storeSettings.hours_open} — {storeSettings.hours_close}</p>}
              </div>
            )}
            <div className="mt-4">
              <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Preferred Time</label>
              <select value={customer.preferredTime} onChange={(e) => setCustomer({ preferredTime: e.target.value })} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md">
                <option>As soon as possible</option>
                <option>Schedule for later</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Delivery Instructions</label>
              <textarea value={customer.deliveryInstructions} onChange={(e) => setCustomer({ deliveryInstructions: e.target.value })} rows={2} className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="Any instructions for the rider..." />
            </div>
          </section>

          <section className="bg-surface rounded-3xl p-6 shadow-card">
            <h2 className="font-heading text-headline-md mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">payments</span> Payment Method</h2>
            <div className="space-y-3">
              {(storeSettings?.payment_methods ?? ["hubtel", "cash", "whatsapp"]).map((method) => {
                const label = {
                  hubtel: { title: "Pay Securely with Hubtel", description: "Mobile Money or bank card. Instant confirmation." },
                  cash: { title: "Pay on Delivery / Pickup", description: "Cash or Mobile Money when you receive." },
                  whatsapp: { title: "Order on WhatsApp", description: "Send your order summary to Eli's Food for confirmation." },
                }[method] ?? { title: method, description: "" };

                return (
                  <label key={method} className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === method ? "border-primary bg-primary/5" : "border-outline-variant"}`}>
                    <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mt-1" />
                    <div>
                      <p className="font-label-bold text-label-bold">{label.title}</p>
                      <p className="text-on-surface-variant text-body-md">{label.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </form>

        <aside className="w-full lg:w-[420px] bg-surface rounded-3xl p-6 shadow-card sticky top-24">
          <h2 className="font-heading text-headline-md mb-4">Order Summary</h2>
          <div className="space-y-4 max-h-[320px] overflow-y-auto hide-scrollbar pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-bold text-label-bold truncate">{item.name}</p>
                  <p className="text-on-surface-variant text-label-sm">Qty: {item.quantity}</p>
                </div>
                <span className="text-secondary font-label-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant space-y-2 text-body-md">
            <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal</span><span className="font-label-bold">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Add-ons</span><span className="font-label-bold">{formatPrice(addOnsTotal)}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Packaging</span><span className="font-label-bold">{formatPrice(packagingFee)}</span></div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Delivery {customer.method === "delivery" && deliveryAreas.find((a) => a.id === deliveryArea)?.name}</span>
              <span className="font-label-bold">{customer.method === "delivery" ? formatPrice(deliveryFee) : "Free"}</span>
            </div>
            {discount > 0 && <div className="flex justify-between text-tertiary"><span className="font-label-bold">Discount</span><span className="font-label-bold">-{formatPrice(discount)}</span></div>}
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant flex justify-between items-center">
            <span className="font-heading text-headline-md">Total</span>
            <span className="font-heading text-headline-md text-secondary">{formatPrice(total)}</span>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full mt-6 py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-70">
            {loading ? "Processing..." : paymentMethod === "whatsapp" ? "Send Order to WhatsApp" : paymentMethod === "cash" ? "Confirm Order" : "Place Order and Pay"}
          </button>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-stack-lg text-center text-on-surface-variant">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
