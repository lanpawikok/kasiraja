<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Santri extends Model
{
    protected $fillable = ['name', 'balance', 'active'];

    protected $casts = [
        'balance' => 'decimal:2',
        'active' => 'boolean',
    ];

    public function balanceEntries(): HasMany
    {
        return $this->hasMany(SantriBalanceEntry::class);
    }
}
