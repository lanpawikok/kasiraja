<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SantriController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// --- PUBLIC ROUTES ---
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Route Public Scan QR Absensi (Akses dari HP Karyawan)
Route::prefix('attendance')->name('attendance.scan.')->group(function () {
    Route::get('/scan', [AttendanceController::class, 'showScanForm'])->name('form');
    Route::post('/scan/store', [AttendanceController::class, 'storeFromScan'])->name('store');
});


// --- AUTHENTICATED & VERIFIED ROUTES ---
Route::middleware(['auth', 'verified'])->group(function () {

    // === ROUTE ABSENSI (Akses Admin & Kasir) ===
    Route::prefix('attendance')->name('attendance.')->group(function () {
        Route::get('/', [AttendanceController::class, 'index'])->name('index');
        Route::get('/export', [AttendanceController::class, 'export'])->name('export');
        Route::post('/', [AttendanceController::class, 'store'])->name('store');
        Route::delete('/{id}', [AttendanceController::class, 'destroy'])->name('destroy');
    });

    // === HALAMAN OPERASIONAL KASIR ===
    Route::middleware('role:kasir')->group(function () {
        Route::get('/dashboard', function () {
            $defaults = [
                ['name' => 'Espresso', 'sku' => 'POS-ESPRESSO', 'price' => 25000, 'category' => 'Kopi', 'stock' => 45, 'icon' => 'coffee', 'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9kt8BtdG1LE2CnWjM68q-A-UJRlREd--Bv9At4BC883NOWxy9abLJQAs6oNsh4JtkyUv91tH_NHgDjBnKBvbzgHe9XVxGPLnfiv-mZ9vsAhGgE7KU7rV6hF21HeMLopgFx8G8O5nrpY6BdnODRP8krq3y4_poRKZP3zuPnZV_scCCBcki4RTrkDI3llam6zEDuKhdfdtuUuDVQRJzDseIid5ckyGoXrLbWKhFdVuPnPCSB6jZWi9TgQ'],
                ['name' => 'Croissant Butter', 'sku' => 'POS-CROISSANT', 'price' => 30000, 'category' => 'Pastry', 'stock' => 12, 'icon' => 'bakery_dining', 'image' => null],
                ['name' => 'Iced Matcha Latte', 'sku' => 'POS-MATCHA', 'price' => 38000, 'category' => 'Non-Kopi', 'stock' => 20, 'icon' => 'local_cafe', 'image' => null],
                ['name' => 'Americano Hot', 'sku' => 'POS-AMERICANO', 'price' => 28000, 'category' => 'Kopi', 'stock' => 50, 'icon' => 'coffee', 'image' => null],
                ['name' => 'Cheesecake', 'sku' => 'POS-CHEESECAKE', 'price' => 45000, 'category' => 'Pastry', 'stock' => 8, 'icon' => 'cake', 'image' => null],
                ['name' => 'Nasi Goreng Spesial', 'sku' => 'POS-NASI-GORENG', 'price' => 50000, 'category' => 'Makanan', 'stock' => 15, 'icon' => 'lunch_dining', 'image' => null],
            ];
            foreach ($defaults as $default) {
                \App\Models\Product::firstOrCreate(['sku' => $default['sku']], $default);
            }

            return Inertia::render('Dashboard', [
                'catalogProducts' => \App\Models\Product::orderBy('id')->get()->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => (float) $product->price,
                        'category' => $product->category,
                        'stock' => $product->stock,
                        'icon' => $product->icon,
                        'image' => $product->image
                            ? (str_starts_with($product->image, 'http') ? $product->image : asset('storage/' . $product->image))
                            : null,
                    ];
                })->values(),
            ]);
        })->name('dashboard');

        Route::prefix('checkout')->name('checkout.')->group(function () {
            Route::post('/process', [OrderController::class, 'processCheckout'])->name('process');
        });
        Route::post('/santri/deposit', [SantriController::class, 'deposit'])->name('santri.deposit');
        Route::get('/santri/balance', [SantriController::class, 'balance'])->name('santri.balance');
        Route::get('/santri/history', [SantriController::class, 'history'])->name('santri.history');
        Route::get('/santri/history/export', [SantriController::class, 'exportHistory'])->name('santri.history.export');

        Route::get('/', [OrderController::class, 'previewReceipt'])->name('receipt.preview');
    });

    // === HALAMAN MANAJEMEN ADMIN ===
    Route::middleware('role:admin')->group(function () {
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::get('/manage-inventory', [InventoryController::class, 'index'])->name('manage-inventory');
        Route::post('/manage-inventory', [InventoryController::class, 'store'])->name('inventory.store');
        Route::put('/manage-inventory/{inventory}', [InventoryController::class, 'update'])->name('inventory.update');

        Route::prefix('laporan')->name('laporan.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::get('/export/monthly', [ReportController::class, 'exportMonthly'])->name('export.monthly');
            Route::post('/audit', [ReportController::class, 'storeAudit'])->name('audit.store');
            Route::get('/export/pdf', [ReportController::class, 'exportPdf'])->name('export.pdf');
            Route::get('/export/excel', [ReportController::class, 'exportExcel'])->name('export.excel');
            Route::get('/{id}', [ReportController::class, 'show'])->name('laporan.show');
        });
    });

    // === PROFIL (SEMUA PENGGUNA YANG LOGIN) ===
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::post('/photo', [ProfileController::class, 'updatePhoto'])->name('photo.update');
        Route::delete('/photo', [ProfileController::class, 'deletePhoto'])->name('photo.delete');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    Route::get('/santri/balances', [SantriController::class, 'index'])->name('santri.balances');
});

require __DIR__.'/auth.php';
