"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Order Food" },
  { href: "/menu?category=marinated", label: "Marinated Meat" },
  { href: "/menu?category=frozen", label: "Frozen Products" },
  { href: "/track", label: "Track Order" },
];

// These two categories have no equivalent in MobileNav's bottom tab bar
// (which only covers Home/Menu/Track/Orders/Account), so on mobile they were
// only reachable via the desktop-only nav above — effectively invisible on
// phones. Surfaced here as a scrollable chip row for mobile.
const mobileCategoryShortcuts = [
  { href: "/menu?category=marinated", label: "Marinated Meat" },
  { href: "/menu?category=frozen", label: "Frozen Products" },
];

export default function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between px-container-mobile md:px-container-desktop py-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" className="flex items-center" aria-label="Eli's Food home">
            <Image src="/logo.png" alt="Eli's Food" width={44} height={44} priority className="h-11 w-11" />
          </Link>
          <div className="flex md:hidden gap-4 text-primary">
            <Link href="/menu" className="material-symbols-outlined">search</Link>
            <Link href="/cart" className="relative material-symbols-outlined">
              shopping_cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-surface">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav
          aria-label="Shop by category"
          className="flex md:hidden w-full items-center gap-2 overflow-x-auto hide-scrollbar mt-3 -mx-container-mobile px-container-mobile pb-1"
        >
          {mobileCategoryShortcuts.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="shrink-0 px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant font-label-bold text-label-sm whitespace-nowrap hover:bg-surface-container-highest transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="hidden md:flex items-center gap-8 mt-4 md:mt-0">
          {navLinks.map((link) => {
            const active = pathname === link.href.split("?")[0];
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-label-bold text-label-bold transition-colors ${
                  active
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/menu" className="relative group">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors p-2">
              search
            </span>
          </Link>
          <Link href="/cart" className="relative group">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors p-2">
              shopping_cart
            </span>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-surface">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/account" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2">
            account_circle
          </Link>
        </div>
      </div>
    </header>
  );
}
