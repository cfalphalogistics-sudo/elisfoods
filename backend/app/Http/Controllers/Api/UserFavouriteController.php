<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\UserFavourite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserFavouriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favourites = $request->user()->favourites()->with('product')->get();

        return response()->json([
            'success' => true,
            'favourites' => $favourites,
        ]);
    }

    public function toggle(Request $request, $productId): JsonResponse
    {
        $user = $request->user();
        $product = Product::findOrFail($productId);

        $existing = UserFavourite::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isFavourite = false;
        } else {
            UserFavourite::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
            $isFavourite = true;
        }

        return response()->json([
            'success' => true,
            'is_favourite' => $isFavourite,
            'favourites' => $user->favourites()->with('product')->get(),
        ]);
    }

    public function destroy(Request $request, $productId): JsonResponse
    {
        $user = $request->user();

        UserFavourite::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Removed from favourites.',
            'favourites' => $user->favourites()->with('product')->get(),
        ]);
    }
}
