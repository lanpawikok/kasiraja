<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OrderController; 
use App\Http\Controllers\AttendanceController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Route untuk Manage Inventory
Route::get('/manage-inventory', function () {
    return Inertia::render('ManageInventory');
})->middleware(['auth', 'verified'])->name('manage-inventory');

// Route POST untuk memproses data keranjang dari tombol bayar di dashboard
Route::post('/process-checkout', [OrderController::class, 'processCheckout'])
    ->middleware(['auth', 'verified'])
    ->name('checkout.process');

// Route GET untuk menampilkan halaman preview struk
Route::get('/receipt-preview', [OrderController::class, 'previewReceipt'])
    ->middleware(['auth', 'verified'])
    ->name('receipt.preview');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// === FITUR ABSENSI FULL FIX ===
Route::get('/attendance', [AttendanceController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('attendance.index');

Route::post('/attendance/store', [AttendanceController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('attendance.store');

// Route untuk Menghapus Data Absensi
Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('attendance.destroy');

// Route Public untuk Scan QR dari HP (Tanpa Auth)
Route::get('/attendance/scan', [AttendanceController::class, 'showScanForm'])
    ->name('attendance.scan.form');

Route::post('/attendance/scan/store', [AttendanceController::class, 'storeFromScan'])
    ->name('attendance.scan.store');

require __DIR__.'/auth.php';