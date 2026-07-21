<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'long_description', 'price',
        'compare_price', 'image', 'type', 'prep_time', 'rating', 'badge',
        'available', 'is_featured', 'options',
    ];

    protected $casts = [
        'price' => 'integer',
        'compare_price' => 'integer',
        'rating' => 'float',
        'available' => 'boolean',
        'is_featured' => 'boolean',
        'options' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function addOns(): BelongsToMany
    {
        return $this->belongsToMany(AddOn::class);
    }

    public function variations(): HasMany
    {
        return $this->hasMany(Variation::class);
    }

    public function scopeActive($query)
    {
        return $query->where('available', true);
    }
}
