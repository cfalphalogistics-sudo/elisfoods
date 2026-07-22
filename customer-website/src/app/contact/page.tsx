"use client";

import { useToast } from "@/contexts/ToastContext";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";

const faqs = [
  { q: "Where is my order?", a: "Use the Track Order page with your order number and phone number." },
  { q: "How do I change my order?", a: "Call or WhatsApp us immediately after placing your order." },
  { q: "Payment failed", a: "Retry checkout or choose Order on WhatsApp for manual confirmation." },
  { q: "Wrong or missing item", a: "Contact us on WhatsApp with your order number and we’ll make it right." },
  { q: "Frozen-product storage", a: "Keep all frozen and marinated items refrigerated or frozen until ready to cook." },
];

export default function ContactPage() {
  const { showToast } = useToast();
  const storeSettings = useStoreSettings();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Support form submission requires a backend endpoint.", "info");
  };

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <h1 className="font-heading text-headline-xl mb-stack-md text-center">Contact & Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-stack-lg">
        <a href={`tel:${storeSettings.phone}`} className="bg-surface rounded-3xl p-8 shadow-card flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-5xl text-primary mb-4">phone</span>
          <h3 className="font-heading text-headline-md mb-2">Call Us</h3>
          <p className="text-on-surface-variant text-body-md">{storeSettings.phone}</p>
        </a>
        <a href={`https://wa.me/${storeSettings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white rounded-3xl p-8 shadow-card flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-5xl mb-4">chat</span>
          <h3 className="font-heading text-headline-md mb-2">WhatsApp</h3>
          <p className="text-white/90 text-body-md">Chat with Eli&apos;s Food</p>
        </a>
      </div>

      <section className="bg-surface rounded-3xl p-6 md:p-10 shadow-card mb-stack-lg">
        <h2 className="font-heading text-headline-md mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group bg-surface-container-low rounded-2xl p-4 cursor-pointer">
              <summary className="font-label-bold text-label-bold flex items-center justify-between list-none">
                {faq.q}
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <p className="text-on-surface-variant text-body-md mt-3">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low rounded-3xl p-6 md:p-10 mb-stack-lg">
        <h2 className="font-heading text-headline-md mb-6">Working Hours & Delivery Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter text-body-md">
          <div>
            <p className="font-label-bold text-label-bold mb-2 uppercase tracking-wider text-on-surface-variant">Opening Hours</p>
            <p className="mb-1">Monday — Sunday</p>
            <p className="text-on-surface-variant">{storeSettings.hoursOpen} — {storeSettings.hoursClose}</p>
          </div>
          <div>
            <p className="font-label-bold text-label-bold mb-2 uppercase tracking-wider text-on-surface-variant">Delivery Areas</p>
            <p className="text-on-surface-variant">Lashibi, Spintex, Sakumono, Accra Central, Tema, East Legon, Osu</p>
          </div>
        </div>
        <div className="mt-8 flex gap-4 justify-center md:justify-start">
          <a href={storeSettings.social.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center material-symbols-outlined hover:bg-primary/90">face_nod</a>
          <a href={storeSettings.social.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center material-symbols-outlined hover:bg-primary/90">photo_camera</a>
          <a href={storeSettings.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center material-symbols-outlined hover:bg-primary/90">music_note</a>
        </div>
      </section>

      <section className="max-w-2xl mx-auto bg-surface rounded-3xl p-6 md:p-10 shadow-card">
        <h2 className="font-heading text-headline-md mb-6 text-center">Send us a message</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="Your name" type="text" />
            <input className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" placeholder="Phone or email" type="text" />
          </div>
          <textarea className="w-full bg-surface-container-low rounded-xl p-3 border-none focus:ring-2 focus:ring-primary font-body-md" rows={4} placeholder="How can we help?" />
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all">Send Message</button>
        </form>
      </section>
    </main>
  );
}
