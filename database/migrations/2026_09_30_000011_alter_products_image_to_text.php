<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE `products` MODIFY `image` TEXT NULL');
        } else {
            Schema::table('products', function ($table) {
                $table->text('image')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE `products` MODIFY `image` VARCHAR(255) NULL');
        } else {
            Schema::table('products', function ($table) {
                $table->string('image')->nullable()->change();
            });
        }
    }
};
