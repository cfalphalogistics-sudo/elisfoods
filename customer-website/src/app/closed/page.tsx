import Link from "next/link";
import { storeSettings } from "@/lib/data";

export default function ClosedPage() {
  const whatsappUrl = `https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent("Hello Eli's Food, I would like to place a pre-order for when you open.")}`;

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg pb-32 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-error-container rounded-full mb-6">
        <span className="material-symbols-outlined text-5xl text-error">schedule</span>
      </div>
      <h1 className="font-heading text-headline-xl mb-4">We&apos;re Currently Closed</h1>
      <p className="text-on-surface-variant text-body-lg max-w-md mx-auto mb-8">
        Our kitchen is resting. You can still browse the menu and pre-order via WhatsApp. We&apos;ll prepare your order as soon as we open.
      </p>

      <div className="bg-surface rounded-3xl p-6 shadow-card max-w-md mx-auto mb-8 text-left">
        <p className="font-label-bold text-label-bold uppercase tracking-wider text-on-surface-variant mb-2">Opening Hours</p>
        <p className="text-body-md text-on-surface mb-1">Monday — Sunday</p>
        <p className="text-body-md text-on-surface-variant">{storeSettings.hours.open} — {storeSettings.hours.close}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-[#25D366] text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-[#1DA851] transition-all inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">chat</span> Pre-Order on WhatsApp
        </a>
        <Link href="/menu" className="px-8 py-4 border-2 border-primary text-primary rounded-full font-label-bold text-label-bold hover:bg-primary/5 transition-all inline-flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">menu_book</span> Browse Menu
        </Link>
      </div>
    </main>
  );
}
