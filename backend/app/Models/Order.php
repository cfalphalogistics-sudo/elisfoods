<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function deliveryArea(): BelongsTo
    {
        return $this->belongsTo(DeliveryArea::class);
    }
}
