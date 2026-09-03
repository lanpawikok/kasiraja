<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
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

// Route Public Scan QR Absensi (Tanpa Auth untuk Akses dari HP Karyawan)
Route::prefix('attendance')->name('attendance.scan.')->group(function () {
    Route::get('/scan', [AttendanceController::class, 'showScanForm'])->name('form');
    Route::post('/scan/store', [AttendanceController::class, 'storeFromScan'])->name('store');
});


// --- AUTHENTICATED & VERIFIED ROUTES ---
Route::middleware(['auth', 'verified'])->group(function () {

    // === HALAMAN OPERASIONAL KASIR ===
    // Admin tetap dapat mengakses halaman ini melalui RoleMiddleware.
    Route::middleware('role:kasir')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Dashboard');
        })->name('dashboard');

        Route::prefix('checkout')->name('checkout.')->group(function () {
            Route::post('/process', [OrderController::class, 'processCheckout'])->name('process');
        });

        Route::get('/receipt-preview', [OrderController::class, 'previewReceipt'])->name('receipt.preview');
    });

    // === HALAMAN MANAJEMEN ADMIN ===
    Route::middleware('role:admin')->group(function () {
        Route::get('/manage-inventory', function () {
            return Inertia::render('ManageInventory');
        })->name('manage-inventory');

        Route::prefix('attendance')->name('attendance.')->group(function () {
            Route::get('/', [AttendanceController::class, 'index'])->name('index');
            Route::post('/', [AttendanceController::class, 'store'])->name('store');
            Route::delete('/{id}', [AttendanceController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('laporan')->name('laporan.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
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
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });
});

require __DIR__.'/auth.php';
