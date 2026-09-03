<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'sku',
        'icon',
        'price',
        'stock',
        'category',
        'unit',
        'description',
        'image',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'created_at' => 'datetime',
    ];

    /**
     * Get the transaction items for the product.
     */
    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /**
     * Scope untuk filter berdasarkan kategori
     */
    public function scopeForCategory($query, string $category)
    {
        return $query->where('category', 'like', "%{$category}%");
    }

    /**
     * Scope untuk filter berdasarkan stok minimum
     */
    public function scopeLowStock($query, int $minStock = 5)
    {
        return $query->where('stock', '<=', $minStock);
    }
}
