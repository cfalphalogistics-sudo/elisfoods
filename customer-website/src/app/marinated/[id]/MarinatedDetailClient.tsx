"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice, type Product } from "@/lib/data";
import {
  fetchProductReviews,
  submitProductReview,
  type ProductReviewsData,
} from "@/lib/services/productService";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";

interface Props {
  product: Product;
}

export default function MarinatedDetailClient({ product: initialProduct }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const storeSettings = useStoreSettings();

  const [product, setProduct] = useState<Product>(initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(product.variations?.[0] || null);
  const [instructions, setInstructions] = useState("");

  // Reviews State
  const [reviewsData, setReviewsData] = useState<ProductReviewsData>({
    average_rating: initialProduct.rating || 5.0,
    total_reviews: 0,
    rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: [],
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(user?.name || "");
  const [orderRef, setOrderRef] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user?.name && !reviewerName) {
      setReviewerName(user.name);
    }
  }, [user, reviewerName]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await fetchProductReviews(initialProduct.slug || initialProduct.id);
      setReviewsData(res);
      setReviewsLoading(false);
    };
    loadReviews();
  }, [initialProduct]);

  const price = selectedVariation?.price || product.price;
  const itemTotal = price * quantity;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price,
      quantity,
      variation: selectedVariation || undefined,
      instructions,
      addOns: [],
    });
    showToast(`${product.name} added to cart`, "success");
    router.push("/cart");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await submitProductReview(
        product.slug || product.id,
        {
          rating: userRating,
          comment: reviewComment,
          customer_name: reviewerName,
          order_reference: orderRef,
        },
        token
      );

      showToast("Thank you for your rating and review!", "success");
      setReviewComment("");
      setOrderRef("");

      const updatedReviews = await fetchProductReviews(product.slug || product.id);
      setReviewsData(updatedReviews);
      setProduct((prev) => ({ ...prev, rating: res.new_product_rating }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review.";
      showToast(msg, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-card bg-surface">
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          {product.badge && (
            <div className="absolute top-4 left-4 bg-primary text-white px-4 py-1 rounded-full font-label-bold text-label-sm">{product.badge}</div>
          )}
        </div>

        <div className="space-y-stack-md">
          <div>
            <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-label-sm mb-3">
              {product.type === "frozen" ? "Frozen Product" : "Marinated Meat"}
            </span>
            <h1 className="font-heading text-headline-xl mb-2">{product.name}</h1>
            <p className="text-body-lg text-on-surface-variant">{product.longDescription || product.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-secondary font-bold text-headline-lg">{formatPrice(itemTotal)}</span>
            <span className="ml-auto flex items-center text-secondary-container bg-secondary-container/10 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="ml-1 font-label-bold text-on-surface">{product.rating}</span>
            </span>
          </div>

          {product.weight && (
            <div className="grid grid-cols-2 gap-4 text-body-md">
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <span className="block text-on-surface-variant text-label-sm font-label-bold uppercase">Weight</span>
                {product.weight}
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <span className="block text-on-surface-variant text-label-sm font-label-bold uppercase">Packaging</span>
                {product.packageInfo || "Sealed pack"}
              </div>
            </div>
          )}

          {product.variations && product.variations.length > 0 && (
            <div>
              <h3 className="font-label-bold text-label-bold mb-3 uppercase tracking-wider text-on-surface-variant">Select Pack Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v)}
                    className={`px-4 py-2 rounded-xl font-label-bold text-label-bold border transition-all ${
                      selectedVariation?.id === v.id
                        ? "bg-primary text-white border-primary"
                        : "bg-surface-container-low text-on-surface border-outline-variant hover:border-primary"
                    }`}
                  >
                    {v.label} — {formatPrice(v.price)}
                  </button>
                ))}
              </div>
              {selectedVariation && (
                <p className="text-label-sm text-on-surface-variant mt-2">{selectedVariation.stock} packs in stock</p>
              )}
            </div>
          )}

          <div className="bg-tertiary/10 text-tertiary p-4 rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined">ac_unit</span>
            <div>
              <p className="font-label-bold text-label-bold">Keep frozen until ready to prepare</p>
              <p className="text-body-md">{product.storage}</p>
            </div>
          </div>

          {product.cookingInstructions && (
            <div>
              <h3 className="font-label-bold text-label-bold mb-2 uppercase tracking-wider text-on-surface-variant">Cooking Instructions</h3>
              <p className="text-body-md text-on-surface">{product.cookingInstructions}</p>
            </div>
          )}

          <div>
            <h3 className="font-label-bold text-label-bold mb-3 uppercase tracking-wider text-on-surface-variant">Special Instructions</h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any delivery or packaging requests..."
              className="w-full bg-surface-container-low rounded-2xl p-4 border-none focus:ring-2 focus:ring-primary font-body-md text-body-md"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container-low rounded-full">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center material-symbols-outlined text-primary hover:bg-surface-container rounded-l-full">remove</button>
              <span className="w-12 text-center font-heading font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-12 h-12 flex items-center justify-center material-symbols-outlined text-primary hover:bg-surface-container rounded-r-full">add</button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all"
            >
              Add to Cart — {formatPrice(itemTotal)}
            </button>
          </div>

          {!storeSettings.isOpen && (
            <div className="p-4 bg-error-container rounded-2xl text-error text-body-md">
              The store is currently closed. You can still add this to your cart and schedule an order.
            </div>
          )}
        </div>
      </div>

      {/* Ratings & Customer Reviews Section */}
      <section className="mt-stack-lg bg-surface rounded-3xl p-6 sm:p-8 shadow-card">
        <h2 className="font-heading text-headline-lg mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          Customer Ratings & Reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 pb-8 border-b border-outline-variant/40">
          <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="font-heading text-6xl text-on-surface mb-2">{reviewsData.average_rating.toFixed(1)}</span>
            <div className="flex gap-1 text-amber-500 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: star <= Math.round(reviewsData.average_rating) ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-on-surface-variant font-label-bold text-label-sm">
              Based on {reviewsData.total_reviews} customer review{reviewsData.total_reviews === 1 ? "" : "s"}
            </p>
          </div>

          <div className="lg:col-span-2 space-y-2 flex flex-col justify-center">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsData.rating_breakdown[star] || 0;
              const percent = reviewsData.total_reviews > 0 ? (count / reviewsData.total_reviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 font-bold text-on-surface flex items-center gap-1">
                    {star} <span className="material-symbols-outlined text-xs text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </span>
                  <div className="flex-1 h-3 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-on-surface-variant font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-10 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
          <h3 className="font-heading text-headline-md mb-4">Rate & Review this Product</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Select Your Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(star)}
                    className="p-2 text-amber-500 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ fontVariationSettings: star <= (hoverRating || userRating) ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
                <span className="self-center font-bold text-on-surface ml-2 text-sm">
                  {userRating === 5 ? "Excellent 5/5" : userRating === 4 ? "Very Good 4/5" : userRating === 3 ? "Good 3/5" : userRating === 2 ? "Fair 2/5" : "Poor 1/5"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Kwesi Boateng"
                  className="w-full p-3 rounded-xl bg-surface border border-outline-variant focus:border-primary focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Order Reference (Optional)</label>
                <input
                  type="text"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  placeholder="e.g. EF-2307-1234 (For Verified Badge)"
                  className="w-full p-3 rounded-xl bg-surface border border-outline-variant focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Your Review / Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Share your experience with the freshness, seasoning, or packaging..."
                className="w-full p-3 rounded-xl bg-surface border border-outline-variant focus:border-primary focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-3 bg-primary text-white rounded-full font-label-bold text-label-sm hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {submittingReview ? "Submitting..." : "Submit Rating & Review"}
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="font-heading text-headline-md mb-2">Recent Customer Comments</h3>

          {reviewsLoading ? (
            <p className="text-on-surface-variant text-center py-6">Loading reviews...</p>
          ) : reviewsData.reviews.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">rate_review</span>
              <p>No customer comments yet. Be the first to leave a review!</p>
            </div>
          ) : (
            reviewsData.reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-surface-container-low rounded-2xl space-y-2 border border-outline-variant/20">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface text-base">{rev.customer_name}</span>
                      {rev.is_verified_purchase && (
                        <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary rounded-full text-[11px] font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant">{new Date(rev.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: star <= rev.rating ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>

                {rev.comment && <p className="text-on-surface text-body-md pt-1">{rev.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
