<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'slot', 'eyebrow', 'headline', 'body', 'image',
        'primary_label', 'primary_url', 'secondary_label', 'secondary_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value
                ? (str_starts_with($value, 'http') ? $value : asset('storage/' . $value))
                : null,
        );
    }
}
