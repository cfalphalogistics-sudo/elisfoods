import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { ToastProvider } from "@/contexts/ToastContext";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Eli's Food | Tasty Menu Everyday",
  description: "Order freshly fried turkey, fish, shrimp, marinated meats and frozen products from Eli's Food. Fast delivery in Accra and Tema.",
  keywords: ["Eli's Food", "fried turkey", "Ghana food", "food delivery", "marinated meat", "frozen seafood"],
};

export const viewport: Viewport = {
  themeColor: "#b90027",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground font-body min-h-screen flex flex-col">
        <ToastProvider>
          <OrderProvider>
            <CartProvider>
              <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileNav />
            <WhatsAppButton />
            </CartProvider>
          </OrderProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
