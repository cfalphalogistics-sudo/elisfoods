import { products } from "@/lib/data";
import MarinatedDetailClient from "./MarinatedDetailClient";
import Link from "next/link";

export function generateStaticParams() {
  return products
    .filter((p) => p.type === "marinated" || p.type === "frozen")
    .map((product) => ({ id: product.id }));
}

export default function MarinatedPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id && (p.type === "marinated" || p.type === "frozen"));

  if (!product) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center">
        <h1 className="font-heading text-headline-lg mb-4">Product not found</h1>
        <Link href="/menu" className="text-primary font-label-bold">Back to menu</Link>
      </main>
    );
  }

  return <MarinatedDetailClient product={product} />;
}
