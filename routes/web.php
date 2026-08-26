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

    // === DASHBOARD & INVENTORY ===
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/manage-inventory', function () {
        return Inertia::render('ManageInventory');
    })->name('manage-inventory');

    // === FITUR TRANSACTION & ORDERS ===
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::post('/process', [OrderController::class, 'processCheckout'])->name('process');
    });

    Route::get('/receipt-preview', [OrderController::class, 'previewReceipt'])->name('receipt.preview');

    // === FITUR ATTENDANCE (ABSENSI - 2 FITUR) ===
    Route::prefix('attendance')->name('attendance.')->group(function () {
        // Fitur 1: Kelola / Rekap Data Absensi (misal: Admin / Manager View)
        Route::get('/', [AttendanceController::class, 'index'])->name('index');

        // Fitur 2 (BARU): Halaman Absen Mandiri / Self Check-in (misal: Karyawan Mandiri / User View)
        Route::get('/checkin', [AttendanceController::class, 'checkin'])->name('checkin');

        // Action Process
        Route::post('/', [AttendanceController::class, 'store'])->name('store');
        Route::delete('/{id}', [AttendanceController::class, 'destroy'])->name('destroy');
    });

    // === FITUR LAPORAN & AUDIT (REPORTS) ===
    Route::prefix('laporan')->name('laporan.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::post('/audit', [ReportController::class, 'storeAudit'])->name('audit.store');
        Route::get('/export/pdf', [ReportController::class, 'exportPdf'])->name('export.pdf');
        Route::get('/export/excel', [ReportController::class, 'exportExcel'])->name('export.excel');
        Route::get('/{id}', [ReportController::class, 'show'])->name('laporan.show');
    });

    // === FITUR USER PROFILE ===
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });
});

require __DIR__.'/auth.php';
