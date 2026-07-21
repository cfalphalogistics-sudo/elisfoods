<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size' => 'nullable|string',
            'items.*.spice_level' => 'nullable|string',
            'items.*.variation_label' => 'nullable|string',
            'items.*.instructions' => 'nullable|string',
            'items.*.add_ons' => 'nullable|array',
            'items.*.add_ons.*.name' => 'required_with:items.*.add_ons|string',
            'items.*.add_ons.*.price' => 'required_with:items.*.add_ons|numeric|min:0',
            'customer' => 'required|array',
            'customer.name' => 'required|string',
            'customer.phone' => 'required|string',
            'customer.alt_phone' => 'nullable|string',
            'customer.email' => 'nullable|email',
            'customer.method' => 'required|in:delivery,pickup',
            'customer.address' => 'nullable|string',
            'customer.ghana_post_gps' => 'nullable|string',
            'customer.landmark' => 'nullable|string',
            'customer.delivery_instructions' => 'nullable|string',
            'customer.area' => 'nullable|string',
            'customer.preferred_time' => 'nullable|string',
            'payment_method' => 'required|in:hubtel,cash,whatsapp',
            'totals' => 'required|array',
            'totals.subtotal' => 'required|numeric|min:0',
            'totals.add_ons_total' => 'required|numeric|min:0',
            'totals.packaging_fee' => 'required|numeric|min:0',
            'totals.delivery_fee' => 'required|numeric|min:0',
            'totals.discount' => 'required|numeric|min:0',
            'totals.total' => 'required|numeric|min:0',
            'coupon_code' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $reference = $this->generateReference();

            $order = Order::create([
                'reference' => $reference,
                'customer_name' => $validated['customer']['name'],
                'phone' => $validated['customer']['phone'],
                'alt_phone' => $validated['customer']['alt_phone'] ?? null,
                'email' => $validated['customer']['email'] ?? null,
                'method' => $validated['customer']['method'],
                'address' => $validated['customer']['address'] ?? null,
                'ghana_post_gps' => $validated['customer']['ghana_post_gps'] ?? null,
                'landmark' => $validated['customer']['landmark'] ?? null,
                'delivery_instructions' => $validated['customer']['delivery_instructions'] ?? null,
                'delivery_area_id' => null,
                'preferred_time' => $validated['customer']['preferred_time'] ?? null,
                'payment_method' => $validated['payment_method'],
                'status' => 'placed',
                'subtotal' => $this->toPesewas($validated['totals']['subtotal']),
                'add_ons_total' => $this->toPesewas($validated['totals']['add_ons_total']),
                'packaging_fee' => $this->toPesewas($validated['totals']['packaging_fee']),
                'delivery_fee' => $this->toPesewas($validated['totals']['delivery_fee']),
                'discount' => $this->toPesewas($validated['totals']['discount']),
                'total' => $this->toPesewas($validated['totals']['total']),
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => null,
                    'name' => $item['name'],
                    'price' => $this->toPesewas($item['price']),
                    'quantity' => $item['quantity'],
                    'size' => $item['size'] ?? null,
                    'spice_level' => $item['spice_level'] ?? null,
                    'variation_label' => $item['variation_label'] ?? null,
                    'instructions' => $item['instructions'] ?? null,
                    'add_ons' => collect($item['add_ons'] ?? [])->map(fn ($a) => [
                        'name' => $a['name'],
                        'price' => $this->toPesewas($a['price']),
                    ])->values()->all(),
                ]);
            }

            return response()->json($order->load('items'), 201);
        });
    }

    public function show(string $reference): JsonResponse
    {
        $order = Order::with('items')->where('reference', $reference)->firstOrFail();
        return response()->json($order);
    }

    private function generateReference(): string
    {
        $date = now();
        $suffix = $date->format('dm-Hi');
        $base = "EF-{$suffix}";
        $count = Order::where('reference', 'like', $base.'%')->count();
        return "{$base}-".str_pad((string) ($count + 1), 3, '0', STR_PAD_LEFT);
    }

    private function toPesewas(float|int|string $amount): int
    {
        return (int) round((float) $amount * 100);
    }
}
