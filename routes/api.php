<?php

use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\CheckoutController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route untuk Open/Close Shift (tidak perlu auth)
Route::prefix('shifts')->group(function () {
    Route::post('/open', [ShiftController::class, 'open'])->middleware(['auth:sanctum']);
    Route::post('/close', [ShiftController::class, 'close'])->middleware(['auth:sanctum']);
    Route::get('/current', [ShiftController::class, 'current'])->middleware(['auth:sanctum']);
    Route::get('/history', [ShiftController::class, 'history'])->middleware(['auth:sanctum']);
});

// Route untuk Checkout (hanya kasir dengan shift aktif)
Route::post('/checkout', CheckoutController::class)
    ->middleware(['auth:sanctum', 'role:kasir', 'ensure.shift.is.open'])
    ->name('api.checkout');

// Route untuk Manajemen Produk (admin dan kasir)
Route::prefix('products')->group(function () {
    Route::get('/', function () {
        return response()->json([
            'message' => 'Daftar produk',
            'data' => [],
        ]);
    })->middleware(['auth:sanctum', 'role:admin,kasir']);

    Route::post('/', function () {
        return response()->json([
            'message' => 'Tambah produk baru',
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);

    Route::put('/{id}', function ($id) {
        return response()->json([
            'message' => 'Update produk ' . $id,
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);

    Route::delete('/{id}', function ($id) {
        return response()->json([
            'message' => 'Hapus produk ' . $id,
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);
});

// Route untuk Manajemen User (hanya admin)
Route::prefix('users')->group(function () {
    Route::get('/', function () {
        return response()->json([
            'message' => 'Daftar user',
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);

    Route::post('/', function () {
        return response()->json([
            'message' => 'Tambah user baru',
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);

    Route::put('/{id}', function ($id) {
        return response()->json([
            'message' => 'Update user ' . $id,
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);

    Route::delete('/{id}', function ($id) {
        return response()->json([
            'message' => 'Hapus user ' . $id,
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);
});

// Route untuk Laporan (hanya admin)
Route::prefix('reports')->group(function () {
    Route::get('/sales', function () {
        return response()->json([
            'message' => 'Laporan penjualan',
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);

    Route::get('/inventory', function () {
        return response()->json([
            'message' => 'Laporan stok',
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);

    Route::get('/transactions', function () {
        return response()->json([
            'message' => 'Laporan transaksi',
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);
});

// Route untuk Audit Logs (hanya admin)
Route::prefix('audit-logs')->group(function () {
    Route::get('/', function () {
        return response()->json([
            'message' => 'Daftar audit logs',
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);

    Route::get('/{id}', function ($id) {
        return response()->json([
            'message' => 'Detail audit log ' . $id,
        ]);
    })->middleware(['auth:sanctum', 'role:admin']);
});
