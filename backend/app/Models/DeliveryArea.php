<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryArea extends Model
{
    protected $fillable = ['name', 'slug', 'fee', 'min_order', 'is_active'];

    protected $casts = [
        'fee' => 'integer',
        'min_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
