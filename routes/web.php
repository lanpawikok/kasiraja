<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AttendanceController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // === ROUTE ADMIN ABSENSI BREWMASTER PRO ===
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/store', [AttendanceController::class, 'store'])->name('attendance.store');
});

// === ROUTE PUBLIC UNTUK HP / SCAN QR (Tanpa Auth) ===
Route::get('/attendance/scan', [AttendanceController::class, 'showScanForm'])->name('attendance.scan.form');
Route::post('/attendance/scan/store', [AttendanceController::class, 'storeFromScan'])->name('attendance.scan.store');

require __DIR__.'/auth.php';