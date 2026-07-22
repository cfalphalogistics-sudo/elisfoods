"use client";

import { useStoreSettings } from "@/contexts/StoreSettingsContext";

export default function WhatsAppButton() {
  const { whatsapp } = useStoreSettings();
  const message = encodeURIComponent("Hello Eli's Food, I'd like to place an order.");
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
      aria-label="Chat with Eli's Food on WhatsApp"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.055 2.285 7.04L.49 23.49l4.45-1.795A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.74 16.74c-.25.71-1.44 1.44-2.01 1.54-.55.1-1.07.14-3.36-.7-2.84-1.03-4.67-3.72-4.81-3.89-.14-.18-1.14-1.52-1.14-2.9 0-1.39.72-2.07.99-2.35.27-.28.6-.35.8-.35.2 0 .39.01.56.01.18 0 .43-.07.67.51.25.58.84 2.01.91 2.16.08.14.13.31.03.5-.1.2-.15.32-.3.5-.15.18-.32.38-.45.51-.14.14-.29.29-.13.57.16.28.71 1.17 1.54 1.9 1.06.96 1.95 1.26 2.43 1.4.34.1.72-.05.92-.25.29-.29.52-.76.68-1.2.12-.34.05-.63-.08-.73-.13-.1-.31-.15-.65-.3z" />
      </svg>
      <span className="font-label-bold text-label-bold hidden md:inline">Chat with Eli&apos;s Food</span>
    </a>
  );
}
