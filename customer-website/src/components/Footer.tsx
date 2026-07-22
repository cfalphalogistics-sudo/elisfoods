"use client";

import Link from "next/link";
import Image from "next/image";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";

export default function Footer() {
  const storeSettings = useStoreSettings();

  return (
    <footer className="w-full py-stack-lg px-container-mobile md:px-container-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter bg-surface-container-highest border-t border-outline-variant mb-20 md:mb-0">
      <div className="space-y-4">
        <Image src="/logo.png" alt="Eli's Food" width={56} height={56} className="h-14 w-14" />
        <p className="text-on-surface-variant text-body-md">
          Bringing the finest fried delights and gourmet kitchen essentials straight to your doorstep.
        </p>
        <div className="flex gap-4">
          <a href={storeSettings.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors material-symbols-outlined text-[20px]">
            face_nod
          </a>
          <a href={storeSettings.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors material-symbols-outlined text-[20px]">
            photo_camera
          </a>
          <a href={storeSettings.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors material-symbols-outlined text-[20px]">
            music_note
          </a>
        </div>
      </div>
      <div>
        <h4 className="font-label-bold text-label-bold mb-4 uppercase tracking-wider">Quick Links</h4>
        <ul className="space-y-3">
          <li><Link href="/menu" className="text-on-surface-variant hover:text-primary transition-all">Menu</Link></li>
          <li><Link href="/track" className="text-on-surface-variant hover:text-primary transition-all">Track Order</Link></li>
          <li><Link href="/menu?category=frozen" className="text-on-surface-variant hover:text-primary transition-all">Frozen Shop</Link></li>
          <li><Link href="/contact" className="text-on-surface-variant hover:text-primary transition-all">About Us</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-label-bold text-label-bold mb-4 uppercase tracking-wider">Support</h4>
        <ul className="space-y-3">
          <li><Link href="/contact" className="text-on-surface-variant hover:text-primary transition-all">Privacy Policy</Link></li>
          <li><Link href="/contact" className="text-on-surface-variant hover:text-primary transition-all">Terms of Service</Link></li>
          <li><Link href="/contact" className="text-on-surface-variant hover:text-primary transition-all">Shipping Info</Link></li>
          <li><Link href="/contact" className="text-on-surface-variant hover:text-primary transition-all">Refund Policy</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-label-bold text-label-bold mb-4 uppercase tracking-wider">Contact</h4>
        <ul className="space-y-3 text-on-surface-variant">
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">phone</span>
            {storeSettings.phone}
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">mail</span>
            {storeSettings.email}
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            Accra, Ghana
          </li>
        </ul>
      </div>
      <div className="col-span-1 md:col-span-4 pt-stack-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-on-surface-variant text-label-sm">© 2024 Eli&apos;s Food. All rights reserved.</p>
        <div className="flex gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined">payments</span>
          <span className="material-symbols-outlined">account_balance_wallet</span>
        </div>
      </div>
    </footer>
  );
}
