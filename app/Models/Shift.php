<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shift extends Model
{
    protected $fillable = [
        'user_id',
        'start_time',
        'end_time',
        'opening_balance',
        'closing_balance',
        'status',
        'ip_address',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'opening_balance' => 'decimal:2',
        'closing_balance' => 'decimal:2',
    ];

    /**
     * Get the user that owns the shift.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope untuk shift aktif
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'open')->whereNull('end_time');
    }

    /**
     * Scope untuk shift yang sudah ditutup
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed')->whereNotNull('end_time');
    }
}
