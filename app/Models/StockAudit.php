<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockAudit extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_name',
        'sku',
        'icon',
        'system_stock',
        'physical_stock',
        'unit',
        'reason',
    ];
}
