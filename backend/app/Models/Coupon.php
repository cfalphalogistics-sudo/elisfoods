<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['code', 'type', 'value', 'min_order', 'usage_limit', 'usage_count', 'expires_at', 'is_active'];

    protected $casts = [
        'value' => 'integer',
        'min_order' => 'integer',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];
}
