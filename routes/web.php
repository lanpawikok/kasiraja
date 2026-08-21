<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OrderController; // Jangan lupa import controller ini
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

// 1. Route POST untuk memproses data keranjang dari tombol bayar di dashboard
Route::post('/process-checkout', [OrderController::class, 'processCheckout'])
    ->middleware(['auth', 'verified']);

// 2. Route GET untuk menampilkan halaman preview struk dengan data dinamis dari Controller
Route::get('/receipt-preview', [OrderController::class, 'previewReceipt'])
    ->middleware(['auth', 'verified'])
    ->name('receipt.preview');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';