<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'invoice_number',
        'user_id',
        'total_amount',
        'pay_amount',
        'change_amount',
        'payment_method',
        'status',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'pay_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the transaction.
     */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /**
     * Scope untuk filter berdasarkan status
     */
    public function scopeForStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk filter berdasarkan date range
     */
    public function scopeForDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);
    }

    /**
     * Scope untuk filter transaksi selesai
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
