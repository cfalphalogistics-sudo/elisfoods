<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'name', 'price', 'quantity', 'size',
        'spice_level', 'variation_label', 'instructions', 'add_ons',
    ];

    protected $casts = [
        'price' => 'integer',
        'quantity' => 'integer',
        'add_ons' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
