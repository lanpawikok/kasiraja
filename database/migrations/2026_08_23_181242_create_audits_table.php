<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_audits', function (Blueprint $table) {
            $table->id();
            $table->string('item_name');
            $table->string('sku')->unique();
            $table->string('icon')->default('inventory_2');
            $table->decimal('system_stock', 10, 2);
            $table->decimal('physical_stock', 10, 2);
            $table->string('unit')->default('pcs');
            $table->string('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_audits');
    }
};
