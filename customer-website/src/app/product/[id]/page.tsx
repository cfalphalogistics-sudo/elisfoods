import { products } from "@/lib/data";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return (
      <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-lg text-center">
        <h1 className="font-heading text-headline-lg mb-4">Product not found</h1>
        <Link href="/menu" className="text-primary font-label-bold">Back to menu</Link>
      </main>
    );
  }

  return <ProductDetailClient product={product} />;
}
