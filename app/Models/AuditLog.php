<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'endpoint',
        'ip_address',
        'request_payload',
        'response_code',
    ];

    protected $casts = [
        'request_payload' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that owns the audit log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope untuk filter berdasarkan action
     */
    public function scopeForAction($query, string $action)
    {
        return $query->where('action', 'like', "%{$action}%");
    }

    /**
     * Scope untuk filter berdasarkan date range
     */
    public function scopeForDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);
    }
}
