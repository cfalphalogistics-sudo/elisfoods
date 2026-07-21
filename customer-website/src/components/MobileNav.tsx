"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const links = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/menu", icon: "restaurant_menu", label: "Menu" },
  { href: "/track", icon: "location_on", label: "Track" },
  { href: "/account", icon: "receipt_long", label: "Orders" },
  { href: "/account", icon: "person", label: "Account" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 pb-safe md:hidden bg-surface shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl border-t border-outline-variant/10">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-2xl relative ${
              active
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="font-label-sm text-label-sm">{link.label}</span>
            {link.icon === "receipt_long" && itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
