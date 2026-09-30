<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SantriBalanceEntry extends Model
{
    protected $fillable = [
        'santri_id',
        'user_id',
        'transaction_id',
        'type',
        'amount',
        'balance_after',
        'notes',
        'details',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'details' => 'array',
    ];

    public function santri(): BelongsTo
    {
        return $this->belongsTo(Santri::class);
    }
}
