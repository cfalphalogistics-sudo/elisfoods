<?php

namespace App\Models;

use App\Mail\OrderStatusMail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class Order extends Model
{
    protected $fillable = [
        'reference', 'customer_name', 'phone', 'alt_phone', 'email', 'method',
        'address', 'ghana_post_gps', 'landmark', 'delivery_instructions',
        'delivery_area_id', 'preferred_time', 'payment_method', 'status',
        'subtotal', 'add_ons_total', 'packaging_fee', 'delivery_fee', 'discount',
        'total', 'notes', 'paid_at',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'add_ons_total' => 'integer',
        'packaging_fee' => 'integer',
        'delivery_fee' => 'integer',
        'discount' => 'integer',
        'total' => 'integer',
        'paid_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updated(function (Order $order): void {
            if (! $order->wasChanged('status') || ! $order->email) {
                return;
            }

            try {
                Mail::to($order->email)->send(new OrderStatusMail($order));
            } catch (\Throwable $e) {
                Log::warning('Order status email failed', [
                    'order' => $order->reference,
                    'error' => $e->getMessage(),
                ]);
            }
        });
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function whatsappUrl(): ?string
    {
        $phone = preg_replace('/\D+/', '', (string) $this->phone);

        if ($phone === '') {
            return null;
        }

        if (str_starts_with($phone, '0')) {
            $phone = '233' . substr($phone, 1);
        }

        return 'https://wa.me/' . $phone . '?text=' . rawurlencode($this->whatsappMessage());
    }

    public function whatsappMessage(): string
    {
        $name = explode(' ', trim($this->customer_name))[0] ?: 'there';
        $trackUrl = rtrim(config('app.frontend_url', ''), '/') . '/track?ref=' . $this->reference;

        $statusLine = match ($this->status) {
            'placed' => "we've received your order and will confirm it shortly.",
            'confirmed' => "your order is confirmed! We'll start preparing it shortly.",
            'preparing' => "our kitchen has started preparing your order. It won't be long now!",
            'out-for-delivery' => 'your order is on its way to you! 🛵',
            'delivered' => 'your order has been delivered. Enjoy your meal! 🎉',
            'cancelled' => 'your order has been cancelled. Please contact us if this is unexpected.',
            default => "there's an update on your order.",
        };

        return "Hello {$name}, this is Eli's Food 🍗\n\n"
            . "Order *{$this->reference}*: {$statusLine}\n\n"
            . "Track it here: {$trackUrl}";
    }

    public function deliveryArea(): BelongsTo
    {
        return $this->belongsTo(DeliveryArea::class);
    }
}
