"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { storeSettings, isStoreOpen } from "@/lib/data";
import { fetchProducts, fetchCategories } from "@/lib/services/productService";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/data";

function StoreBanner() {
  const [open, setOpen] = useState(storeSettings.isOpen);
  useEffect(() => {
    setOpen(isStoreOpen());
  }, []);
  const whatsappUrl = `https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent("Hello Eli's Food, I would like to place a pre-order.")}`;
  return (
    <div className={`${open ? "bg-tertiary" : "bg-error"} text-white py-3 px-container-mobile md:px-container-desktop`}>
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-center gap-2 text-center">
        <p className="font-label-bold text-label-bold flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">{open ? "verified" : "schedule"}</span>
          {open
            ? "We're Open! Place your order now."
            : "We're Currently Closed. Browse and schedule your order."}
        </p>
        {!open && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-2 font-label-bold text-label-sm hover:text-white/80"
          >
            Order on WhatsApp <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
        )}
      </div>
    </div>
  );
}

interface Category {
  id: string | number;
  name: string;
  slug: string;
  icon: string;
}

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const visited = sessionStorage.getItem("elis-splash-seen");
    if (visited) setShowSplash(false);
    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("elis-splash-seen", "true");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    };
    loadData();
  }, []);

  const popular = products.filter((p) => ["fried-turkey-jollof", "crispy-fried-turkey", "fried-shrimp", "family-turkey-pack"].includes(p.slug));
  const combos = products.filter((p) => p.type === "combo");

  return (
    <>
      {showSplash && (
        <div className="fixed inset-0 z-[100] bg-primary-container flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/p6.png')" }} />
          <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-primary rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-secondary rounded-full blur-3xl opacity-20" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-stack-md">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-110" />
              <div className="relative w-40 h-40 md:w-48 md:h-48 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 animate-pulse">
                <div className="flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[64px] md:text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                  <span className="font-heading text-headline-md text-primary mt-[-4px]">Eli&apos;s</span>
                </div>
              </div>
            </div>
            <h1 className="font-heading text-headline-lg-mobile md:text-headline-lg text-white tracking-tight drop-shadow-md mb-2">
              Tasty Menu Everyday
            </h1>
            <p className="text-body-md text-white/80 max-w-[260px] text-center mb-stack-lg">
              Authentic Ghanaian flavors delivered to your door.
            </p>
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>dinner_dining</span>
              </div>
            </div>
          </div>
          <p className="absolute bottom-10 text-label-sm text-white/40 font-label-bold uppercase tracking-widest text-center">
            © 2024 Eli&apos;s Food • Ghana&apos;s Premium Food Service
          </p>
        </div>
      )}

      <div>
        <StoreBanner />

        <section className="relative min-h-[720px] flex items-center px-container-mobile md:px-container-desktop py-stack-lg overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80"
              alt="Delicious fried Ghanaian food spread"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-stack-md">
            <span className="inline-block px-4 py-1 bg-primary-container text-on-primary-container rounded-full font-label-bold text-label-bold">
              Premium Delivery in Accra & Tema
            </span>
            <h1 className="font-heading text-headline-xl text-on-background leading-tight">
              Freshly Fried. <br /><span className="text-primary">Perfectly Seasoned.</span> <br />Delivered to You.
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              Order delicious fried turkey, fish, shrimp, squid, marinated meats and frozen products from Eli&apos;s Food.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/menu" className="px-8 py-4 bg-primary text-on-primary rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2">
                Order Now <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link href="/track" className="px-8 py-4 bg-surface border-2 border-primary text-primary rounded-full font-label-bold text-label-bold hover:bg-primary/5 transition-all">
                Track Order
              </Link>
            </div>
            <div className="pt-4 flex flex-wrap gap-3">
              {[
                { label: "Fried Turkey", href: "/menu?category=fried-turkey" },
                { label: "Fish", href: "/menu?category=fish" },
                { label: "Shrimp", href: "/menu?category=shrimp" },
                { label: "Marinated", href: "/menu?category=marinated" },
                { label: "Frozen", href: "/menu?category=frozen" },
              ].map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-outline-variant rounded-full text-label-bold font-label-bold text-on-surface hover:bg-white hover:border-primary transition-all"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-stack-lg px-container-mobile md:px-container-desktop">
          <div className="flex items-center justify-between mb-stack-md">
            <h2 className="font-heading text-headline-lg">Explore Menu</h2>
            <Link href="/menu" className="text-primary font-label-bold flex items-center gap-1">View All <span className="material-symbols-outlined">chevron_right</span></Link>
          </div>
          <div className="flex gap-gutter overflow-x-auto hide-scrollbar pb-4 snap-x">
            {categories.slice(1, 7).map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.slug}`}
                className="snap-start flex-shrink-0 w-32 md:w-40 flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-secondary-container transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[32px] text-primary group-hover:text-on-secondary-container">{cat.icon}</span>
                </div>
                <span className="font-label-bold text-label-bold text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-stack-lg px-container-mobile md:px-container-desktop bg-surface-container-low">
          <div className="flex items-center justify-between mb-stack-md">
            <div>
              <h2 className="font-heading text-headline-lg">Popular Today</h2>
              <p className="text-on-surface-variant font-body-md">What our foodies are loving right now.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {popular.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="py-stack-lg px-container-mobile md:px-container-desktop">
          <div className="bg-secondary-container rounded-4xl overflow-hidden flex flex-col lg:flex-row items-stretch">
            <div className="flex-1 p-stack-lg space-y-stack-md flex flex-col justify-center">
              <span className="font-label-bold text-label-bold text-on-secondary-container uppercase tracking-widest">Home Cooking Made Easy</span>
              <h2 className="font-heading text-headline-xl text-on-secondary-container">Stock Your Freezer</h2>
              <p className="text-body-lg text-on-secondary-container/80">
                Skip the prep! Our vacuum-sealed marinated meats and pre-portioned frozen products are ready to cook whenever you are.
              </p>
              <div className="flex gap-4 pt-4 flex-wrap">
                <Link href="/menu?category=marinated" className="px-8 py-4 bg-primary text-on-primary rounded-full font-label-bold text-label-bold shadow-lg hover:scale-105 transition-transform">
                  Shop Marinated Meat
                </Link>
                <Link href="/menu?category=frozen" className="px-8 py-4 bg-on-secondary-container text-on-secondary rounded-full font-label-bold text-label-bold hover:scale-105 transition-transform">
                  View Frozen Range
                </Link>
              </div>
            </div>
            <div className="flex-1 min-h-[400px] relative">
              <Image
                src="https://images.unsplash.com/photo-1607623814075-e51df1bd6567?auto=format&fit=crop&w=1200&q=80"
                alt="Vacuum sealed marinated meats"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-stack-lg px-container-mobile md:px-container-desktop bg-surface-container-low text-center">
          <h2 className="font-heading text-headline-lg mb-stack-lg">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {[
              { icon: "touch_app", title: "Choose", text: "Select your favorite freshly fried meals or frozen stocks." },
              { icon: "tune", title: "Customize", text: "Pick your sides, spiciness level, and delivery time." },
              { icon: "payments", title: "Pay", text: "Secure checkout via Mobile Money or Credit Card." },
              { icon: "local_shipping", title: "Track", text: "Follow your order in real-time until it reaches you." },
            ].map((step) => (
              <div key={step.title} className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">{step.icon}</span>
                </div>
                <h3 className="font-label-bold text-headline-md text-[18px]">{step.title}</h3>
                <p className="text-on-surface-variant text-body-md">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-stack-lg px-container-mobile md:px-container-desktop">
          <div className="flex items-center justify-between mb-stack-md">
            <h2 className="font-heading text-headline-lg">Combo Deals</h2>
            <Link href="/menu?category=combos" className="text-primary font-label-bold">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {combos.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
