<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('attendances', function (Blueprint $table) {
        $table->id();
        $table->string('staff_id'); // Menyimpan ID Karyawan dari QR Code
        $table->date('date');       // Tanggal absen
        $table->time('time');       // Jam absen
        $table->string('status')->default('Hadir'); // Status kehadiran
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
