<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StoreSetting;
use App\Models\User;
use App\Services\SmsOnlineGhService;
use Filament\Actions\Action as NotificationAction;
use Filament\Notifications\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
            'payment_method' => 'required|in:'.implode(',', StoreSetting::paymentMethods()),
            'totals' => 'required|array',
            'totals.subtotal' => 'required|numeric|min:0',
            'totals.add_ons_total' => 'required|numeric|min:0',
            'totals.packaging_fee' => 'required|numeric|min:0',
            'totals.delivery_fee' => 'required|numeric|min:0',
            'totals.discount' => 'required|numeric|min:0',
            'totals.total' => 'required|numeric|min:0',
            'coupon_code' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $reference = $this->generateReference();
            $formattedPhone = SmsOnlineGhService::formatPhone($validated['customer']['phone']);

            // Associate order with user if authenticated or by phone matching
            $userId = null;
            if ($request->user()) {
                $userId = $request->user()->id;
            } else {
                $matchingUser = User::where('phone', $formattedPhone)->first();
                if ($matchingUser) {
                    $userId = $matchingUser->id;
                }
            }

            $order = Order::create([
                'user_id' => $userId,
                'reference' => $reference,
                'customer_name' => $validated['customer']['name'],
                'phone' => $formattedPhone,
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

            $this->notifyAdmins($order);

            return response()->json($order->load('items'), 201);
        });
    }

    public function userOrders(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::with('items')
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('phone', $user->phone);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    private function notifyAdmins(Order $order): void
    {
        try {
            $itemsCount = collect($order->items ?? [])->count() ?: $order->items()->count();
            $total = 'GH₵ ' . number_format($order->total / 100, 2);

            Notification::make()
                ->title("New order {$order->reference}")
                ->body("{$order->customer_name} · {$itemsCount} item(s) · {$total} · " . ucfirst($order->method))
                ->icon('heroicon-o-shopping-bag')
                ->iconColor('primary')
                ->actions([
                    NotificationAction::make('view')
                        ->label('View order')
                        ->url("/admin/orders/{$order->id}")
                        ->markAsRead(),
                ])
                ->sendToDatabase(User::all());
        } catch (\Throwable $e) {
            Log::warning('Admin new-order notification failed', [
                'order' => $order->reference,
                'error' => $e->getMessage(),
            ]);
        }
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
