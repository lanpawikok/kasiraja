<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->text('description')->nullable();
            $table->decimal('qty', 10, 2)->default(0);
            $table->string('unit')->default('pcs');
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('status')->default('aman'); // aman / menipis
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};