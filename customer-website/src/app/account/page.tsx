"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { useOrders, type Order } from "@/contexts/OrderContext";
import { statusLabel } from "@/lib/services/orderService";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import Link from "next/link";

const addresses = [
  { id: 1, label: "Home", address: "Community 18, Lashibi, near Shell filling station" },
  { id: 2, label: "Work", address: "Spintex Road, Accra" },
];

const favourites = [
  { id: "fried-turkey-jollof", name: "Fried Turkey + Jollof", price: 75 },
  { id: "fried-shrimp", name: "Garlic Butter Shrimp", price: 120 },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "favourites">("orders");
  const [loggedIn, setLoggedIn] = useState(false);
  const { customer } = useCart();
  const { orders } = useOrders();
  const storeSettings = useStoreSettings();
  const displayName = customer.name.trim() || "Guest";
  const displayPhone = customer.phone.trim() || storeSettings.phone;

  if (!loggedIn) {
    return (
      <main className="max-w-md mx-auto px-container-mobile md:px-container-desktop py-stack-lg pb-32">
        <h1 className="font-heading text-headline-xl mb-2 text-center">Welcome Back</h1>
        <p className="text-on-surface-variant text-center mb-8">Sign in or continue as guest to place your order faster.</p>
        <form className="bg-surface rounded-3xl p-6 shadow-card space-y-4" onSubmit={(e) => { e.preventDefault(); setLoggedIn(true); }}>
          <div>
            <label className="block text-label-sm font-label-bold text-on-surface-variant mb-1">Phone Number</label>
            <div className="flex items-center bg-surface-container-low rounded-xl px-3">
              <span className="text-on-surface-variant font-body-md pr-2">+233</span>
              <input type="tel" className="flex-1 bg-transparent border-none focus:ring-0 p-3 font-body-md" placeholder="24 987 5848" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all">Send Verification Code</button>
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink-0 mx-4 text-on-surface-variant text-label-sm font-label-bold">OR</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>
          <button type="button" onClick={() => setLoggedIn(true)} className="w-full py-4 bg-surface-container-high text-on-surface rounded-full font-label-bold text-label-bold hover:bg-surface-container transition-all">Continue as Guest</button>
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <div className="flex flex-col md:flex-row gap-gutter items-start">
        <aside className="w-full md:w-72 bg-surface rounded-3xl p-4 shadow-card">
          <div className="flex items-center gap-4 p-3 mb-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">person</span>
            </div>
            <div>
              <p className="font-heading text-headline-md text-[18px]">{displayName}</p>
              <p className="text-on-surface-variant text-label-sm">{displayPhone}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {[
              { id: "orders", icon: "receipt_long", label: "Orders" },
              { id: "addresses", icon: "location_on", label: "Saved Addresses" },
              { id: "favourites", icon: "favorite", label: "Favourites" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-label-bold text-label-bold transition-colors ${
                  activeTab === t.id ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined">{t.icon}</span>
                {t.label}
              </button>
            ))}
            <button onClick={() => setLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-label-bold text-label-bold text-error hover:bg-error-container transition-colors">
              <span className="material-symbols-outlined">logout</span>
              Log out
            </button>
          </nav>
        </aside>

        <div className="flex-1 w-full">
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="font-heading text-headline-md mb-4">Order History</h2>
              {orders.length === 0 && <p className="text-on-surface-variant text-body-md">No orders yet.</p>}
              {orders.map((order: Order) => (
                <div key={order.reference} className="bg-surface rounded-3xl p-5 shadow-card">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-label-bold text-label-bold">{order.reference}</p>
                      <p className="text-on-surface-variant text-label-sm">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full font-label-bold text-label-sm">{statusLabel(order.status)}</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant mb-3">{order.items.map((i) => i.name).join(", ")}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-headline-md text-[18px] text-secondary">{formatPrice(order.total)}</span>
                    <div className="flex gap-2">
                      <Link href={`/track?ref=${order.reference}`} className="px-4 py-2 border border-primary text-primary rounded-full font-label-bold text-label-sm hover:bg-primary/5">Track</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "addresses" && (
            <div>
              <h2 className="font-heading text-headline-md mb-4">Saved Addresses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-surface rounded-3xl p-5 shadow-card">
                    <p className="font-label-bold text-label-bold mb-1">{addr.label}</p>
                    <p className="text-on-surface-variant text-body-md mb-4">{addr.address}</p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border border-primary text-primary rounded-full font-label-bold text-label-sm">Edit</button>
                      <button className="px-4 py-2 text-error font-label-bold text-label-sm">Delete</button>
                    </div>
                  </div>
                ))}
                <button className="bg-surface rounded-3xl p-5 shadow-card border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-primary min-h-[140px]">
                  <span className="material-symbols-outlined text-3xl mb-2">add</span>
                  <span className="font-label-bold text-label-bold">Add New Address</span>
                </button>
              </div>
            </div>
          )}
          {activeTab === "favourites" && (
            <div>
              <h2 className="font-heading text-headline-md mb-4">Favourites</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {favourites.map((fav) => (
                  <Link href={`/product/${fav.id}`} key={fav.id} className="bg-surface rounded-2xl p-5 shadow-card flex justify-between items-center hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-label-bold text-label-bold">{fav.name}</p>
                      <p className="text-secondary font-bold">{formatPrice(fav.price)}</p>
                    </div>
                    <span className="material-symbols-outlined text-primary">chevron_right</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
