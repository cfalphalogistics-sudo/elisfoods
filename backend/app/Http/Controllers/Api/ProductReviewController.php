<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    /**
     * Resolve product by ID or slug.
     */
    protected function resolveProduct(string $identifier): Product
    {
        return is_numeric($identifier)
            ? Product::findOrFail((int) $identifier)
            : Product::where('slug', $identifier)->firstOrFail();
    }

    public function index(string $productParam): JsonResponse
    {
        $product = $this->resolveProduct($productParam);

        $reviews = ProductReview::where('product_id', $product->id)
            ->approved()
            ->latest()
            ->get();

        $totalReviews = $reviews->count();
        $averageRating = $totalReviews > 0 ? round($reviews->avg('rating'), 1) : (float) ($product->rating ?: 5.0);

        $breakdown = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        return response()->json([
            'success' => true,
            'product_id' => $product->id,
            'average_rating' => $averageRating,
            'total_reviews' => $totalReviews,
            'rating_breakdown' => $breakdown,
            'reviews' => $reviews,
        ]);
    }

    public function store(Request $request, string $productParam): JsonResponse
    {
        $product = $this->resolveProduct($productParam);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'customer_name' => 'nullable|string|max:100',
            'order_reference' => 'nullable|string|max:100',
        ]);

        $user = $request->user();
        $customerName = trim($validated['customer_name'] ?? '');

        if (empty($customerName) && $user) {
            $customerName = $user->name;
        }

        if (empty($customerName)) {
            $customerName = 'Valued Customer';
        }

        $orderReference = trim($validated['order_reference'] ?? '');
        $isVerifiedPurchase = false;

        if (! empty($orderReference)) {
            $matchingOrder = Order::where('reference', $orderReference)->first();
            if ($matchingOrder) {
                $isVerifiedPurchase = true;
            }
        } elseif ($user && $user->orders()->where('status', 'delivered')->exists()) {
            $isVerifiedPurchase = true;
        }

        $review = ProductReview::create([
            'product_id' => $product->id,
            'user_id' => $user?->id,
            'customer_name' => $customerName,
            'rating' => (int) $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'order_reference' => $orderReference ?: null,
            'is_verified_purchase' => $isVerifiedPurchase,
            'status' => 'approved',
        ]);

        // Auto-recalculate Product rating score
        $newRating = $product->recalculateRating();

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your rating and review!',
            'review' => $review,
            'new_product_rating' => $newRating,
        ], 201);
    }
}
