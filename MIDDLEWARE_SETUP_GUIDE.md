# Middleware Setup Guide - BrewMaster Pro

## Daftar Isi

1. [File Kode Middleware](#1-file-kode-middleware)
2. [Contoh File Migrasi Database](#2-contoh-file-migrasi-database)
3. [Cara Pendaftaran Middleware](#3-cara-pendaftaran-middleware)
4. [Contoh Penerapan di routes/api.php](#4-contoh-penerapan-di-routesapiphpphp)

---

## 1. File Kode Middleware

### 1.1 RoleMiddleware.php

**Path:** `app/Http/Middleware/RoleMiddleware.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Cek apakah user terautentikasi
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthorized. Please login first.',
            ], 401);
        }

        // Cek apakah user memiliki role yang sesuai
        $userRole = $request->user()->role ?? null;

        if (!$this->canAccess($userRole, $role)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission to access this resource.',
                'required_role' => $role,
                'your_role' => $userRole,
            ], 403);
        }

        return $next($request);
    }

    /**
     * Cek apakah role user bisa mengakses endpoint yang diminta
     */
    private function canAccess(?string $userRole, string $requiredRole): bool
    {
        // Jika user belum login
        if ($userRole === null) {
            return false;
        }

        // Admin memiliki akses penuh
        if ($userRole === 'admin') {
            return true;
        }

        // Kasir hanya bisa akses endpoint dengan role 'kasir'
        if ($userRole === 'kasir' && $requiredRole === 'kasir') {
            return true;
        }

        return false;
    }
}
```

---

### 1.2 EnsureShiftIsOpen.php

**Path:** `app/Http/Middleware/EnsureShiftIsOpen.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureShiftIsOpen
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Cek apakah user terautentikasi
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthorized. Please login first.',
            ], 401);
        }

        // Cek apakah user memiliki shift aktif (status 'open')
        $hasActiveShift = \App\Models\Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->whereNull('end_time')
            ->exists();

        if (!$hasActiveShift) {
            return response()->json([
                'message' => 'Shift belum dibuka. Silakan buka shift terlebih dahulu.',
                'hint' => 'Gunakan endpoint POST /api/shifts/open untuk membuka shift.',
            ], 400);
        }

        return $next($request);
    }
}
```

---

### 1.3 AuditLogMiddleware.php

**Path:** `app/Http/Middleware/AuditLogMiddleware.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Catat log hanya untuk user yang terautentikasi
        if ($request->user()) {
            \App\Models\AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => $this->determineAction($request),
                'endpoint' => $request->path(),
                'ip_address' => $request->ip(),
                'request_payload' => $this->getPayload($request),
                'response_code' => $response->getStatusCode(),
            ]);
        }

        return $response;
    }

    /**
     * Tentukan aksi berdasarkan endpoint dan method request
     */
    private function determineAction(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();

        // Definisi aksi berdasarkan endpoint
        $actions = [
            'checkout' => 'Checkout Transaksi',
            'transactions' => 'Manajemen Transaksi',
            'products' => 'Manajemen Produk',
            'inventory' => 'Manajemen Inventory',
            'shifts/open' => 'Buka Shift',
            'shifts/close' => 'Tutup Shift',
            'users' => 'Manajemen User',
            'reports' => 'Laporan',
        ];

        foreach ($actions as $endpoint => $action) {
            if (str_contains($path, $endpoint)) {
                return $action;
            }
        }

        // Default action berdasarkan HTTP method
        $methodActions = [
            'POST' => 'Create',
            'PUT' => 'Update',
            'PATCH' => 'Update',
            'DELETE' => 'Delete',
            'GET' => 'Read',
        ];

        return $methodActions[$method] ?? 'Access';
    }

    /**
     * Ambil payload request (tanpa password)
     */
    private function getPayload(Request $request): ?string
    {
        $payload = $request->all();

        // Hapus field password dari payload jika ada
        unset($payload['password']);
        unset($payload['password_confirmation']);

        // Hapus file upload dari payload
        foreach ($payload as $key => $value) {
            if (is_object($value) && $value instanceof \Illuminate\Http\UploadedFile) {
                unset($payload[$key]);
            }
        }

        return count($payload) > 0 ? json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) : null;
    }
}
```

---

## 2. Contoh File Migrasi Database

### 2.1 Tabel `shifts`

**Path:** `database/migrations/2026_09_03_000000_create_shifts_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('closing_balance', 15, 2)->default(0);
            $table->string('status')->default('open')->comment('open, closed');
            $table->string('ip_address', 45)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
```

---

### 2.2 Tabel `audit_logs`

**Path:** `database/migrations/2026_09_03_000001_create_audit_logs_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action');
            $table->string('endpoint');
            $table->string('ip_address', 45)->nullable();
            $table->text('request_payload')->nullable();
            $table->string('response_code')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
```

---

### 2.3 Tabel `users` (Updated)

**Path:** `database/migrations/0001_01_01_000000_create_users_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role')->default('kasir')->comment('admin, kasir'); // <-- Tambah kolom role
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
```

---

## 3. Cara Pendaftaran Middleware

### 3.1 Laravel 11 (via bootstrap/app.php)

**Path:** `bootstrap/app.php`

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        api: __DIR__.'/../routes/api.php', // <-- Tambahkan ini untuk API routes
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // <-- Daftarkan middleware di sini
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'ensure.shift.is.open' => \App\Http\Middleware\EnsureShiftIsOpen::class,
            'audit.log' => \App\Http\Middleware\AuditLogMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
```

### 3.2 Laravel 10 (via app/Http/Kernel.php)

Jika menggunakan Laravel 10, tambahkan di `app/Http/Kernel.php`:

```php
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    // ... middleware lain

    protected $routeMiddleware = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
        'signed' => \App\Http\Middleware\ValidateSignature::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
        
        // <-- Tambahkan middleware custom di sini
        'role' => \App\Http\Middleware\RoleMiddleware::class,
        'ensure.shift.is.open' => \App\Http\Middleware\EnsureShiftIsOpen::class,
        'audit.log' => \App\Http\Middleware\AuditLogMiddleware::class,
    ];
}
```

---

## 4. Contoh Penerapan di routes/api.php

**Path:** `routes/api.php`

```php
<?php

use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==================== AUTH ====================
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'role' => 'required|in:admin,kasir',
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    $user = $request->user();
    
    // Verifikasi role sesuai yang dipilih
    if ($user->role !== $request->role) {
        return response()->json(['message' => 'Role tidak sesuai'], 403);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login berhasil',
        'data' => [
            'user' => $user,
            'token' => $token,
        ],
    ]);
})->name('api.login');

Route::post('/logout', function (Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logout berhasil']);
})->middleware('auth:sanctum')->name('api.logout');

// ==================== SHIFT ====================
Route::prefix('shifts')->group(function () {
    Route::post('/open', [ShiftController::class, 'open'])->middleware(['auth:sanctum']);
    Route::post('/close', [ShiftController::class, 'close'])->middleware(['auth:sanctum']);
    Route::get('/current', [ShiftController::class, 'current'])->middleware(['auth:sanctum']);
    Route::get('/history', [ShiftController::class, 'history'])->middleware(['auth:sanctum']);
});

// ==================== CHECKOUT ====================
Route::post('/checkout', CheckoutController::class)
    ->middleware(['auth:sanctum', 'role:kasir', 'ensure.shift.is.open'])
    ->name('api.checkout');

// ==================== PRODUCTS ====================
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index'])->middleware(['auth:sanctum', 'role:admin,kasir']);
    Route::post('/', [ProductController::class, 'store'])->middleware(['auth:sanctum', 'role:admin']);
    Route::get('/{id}', [ProductController::class, 'show'])->middleware(['auth:sanctum', 'role:admin,kasir']);
    Route::put('/{id}', [ProductController::class, 'update'])->middleware(['auth:sanctum', 'role:admin']);
    Route::delete('/{id}', [ProductController::class, 'destroy'])->middleware(['auth:sanctum', 'role:admin']);
});

// ==================== USERS ====================
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index'])->middleware(['auth:sanctum', 'role:admin']);
    Route::post('/', [UserController::class, 'store'])->middleware(['auth:sanctum', 'role:admin']);
    Route::get('/{id}', [UserController::class, 'show'])->middleware(['auth:sanctum', 'role:admin']);
    Route::put('/{id}', [UserController::class, 'update'])->middleware(['auth:sanctum', 'role:admin']);
    Route::delete('/{id}', [UserController::class, 'destroy'])->middleware(['auth:sanctum', 'role:admin']);
});

// ==================== REPORTS ====================
Route::prefix('reports')->group(function () {
    Route::get('/sales', [ReportController::class, 'sales'])->middleware(['auth:sanctum', 'role:admin']);
    Route::get('/inventory', [ReportController::class, 'inventory'])->middleware(['auth:sanctum', 'role:admin']);
    Route::get('/transactions', [ReportController::class, 'transactions'])->middleware(['auth:sanctum', 'role:admin']);
});

// ==================== AUDIT LOGS ====================
Route::prefix('audit-logs')->group(function () {
    Route::get('/', [ReportController::class, 'auditLogs'])->middleware(['auth:sanctum', 'role:admin']);
    Route::get('/{id}', [ReportController::class, 'auditLog'])->middleware(['auth:sanctum', 'role:admin']);
});
```

---

## Ringkasan Middleware

| Middleware | Alias | Fungsi | Error Code |
|------------|-------|--------|------------|
| RoleMiddleware | `role` | RBAC admin/kasir | 401, 403 |
| EnsureShiftIsOpen | `ensure.shift.is.open` | Validasi shift aktif | 400, 401 |
| AuditLogMiddleware | `audit.log` | Logging aktivitas | - |

## Instalasi Cepat

```bash
# 1. Jalankan migrations
php artisan migrate

# 2. Jalankan seeders
php artisan db:seed --class=UserSeeder

# 3. Install Laravel Sanctum (jika belum)
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate

# 4. Mulai server
php artisan serve
```

## Testing dengan Postman

1. Import file `routes/api.php` ke Postman
2. Login dengan `admin@brewmaster.pro` atau `kasir@brewmaster.pro`
3. Buka shift sebagai kasir
4. Test endpoint checkout
