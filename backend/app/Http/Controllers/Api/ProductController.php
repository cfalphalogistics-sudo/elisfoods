<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'addOns', 'variations'])
            ->where('available', true);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (int) $request->min_price * 100);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (int) $request->max_price * 100);
        }

        $sort = $request->get('sort', 'popular');
        if ($sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } elseif ($sort === 'newest') {
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('is_featured', 'desc')->orderBy('rating', 'desc');
        }

        return response()->json($query->paginate($request->get('per_page', 20)));
    }

    public function show($slug)
    {
        $product = Product::with(['category', 'addOns', 'variations'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($product);
    }
}
