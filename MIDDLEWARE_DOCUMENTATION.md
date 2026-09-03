# Middleware Documentation - BrewMaster Pro

## Overview

Aplikasi kasir "BrewMaster Pro" menggunakan 3 middleware Laravel untuk manajemen akses dan logging:

1. **RoleMiddleware** - Role-Based Access Control (RBAC)
2. **EnsureShiftIsOpen** - Validasi shift kasir
3. **AuditLogMiddleware** - Pencatatan aktivitas transaksi

---

## 1. RoleMiddleware

### Fungsi
Membatasi hak akses API berdasarkan role user.

### Aturan Role

| Role | Akses |
|------|-------|
| `admin` | Akses penuh ke seluruh endpoint (manajemen user, stok, laporan audit, dan transaksi) |
| `kasir` | Hanya bisa mengakses endpoint transaksi checkout, daftar produk/menu, dan cetak struk |

### Response Error

#### 401 Unauthorized
```json
{
    "message": "Unauthorized. Please login first."
}
```

#### 403 Forbidden
```json
{
    "message": "Forbidden. You do not have permission to access this resource.",
    "required_role": "admin",
    "your_role": "kasir"
}
```

### Contoh Penggunaan

```php
// Hanya admin yang bisa akses
Route::get('/users', [UserController::class, 'index'])
    ->middleware(['auth:sanctum', 'role:admin']);

// Admin atau kasir bisa akses
Route::get('/products', [ProductController::class, 'index'])
    ->middleware(['auth:sanctum', 'role:admin,kasir']);
```

---

## 2. EnsureShiftIsOpen

### Fungsi
Memastikan kasir tidak bisa melakukan transaksi checkout sebelum mereka membuka/memulai shift kerja harian.

### Logika
Cek ke tabel `shifts` apakah ada record shift aktif untuk `user_id` terkait dengan status 'open'.

### Response Error

#### 400 Bad Request
```json
{
    "message": "Shift belum dibuka. Silakan buka shift terlebih dahulu.",
    "hint": "Gunakan endpoint POST /api/shifts/open untuk membuka shift."
}
```

#### 401 Unauthorized
```json
{
    "message": "Unauthorized. Please login first."
}
```

### Contoh Penggunaan

```php
// Middleware ini harus dipasang setelah auth
Route::post('/checkout', CheckoutController::class)
    ->middleware(['auth:sanctum', 'ensure.shift.is.open']);
```

---

## 3. AuditLogMiddleware

### Fungsi
Mengubah setiap request penting menjadi catatan log di database.

### Data yang Dicatat
- `user_id` - ID user yang melakukan aksi
- `action` - Aksi yang dilakukan (berdasarkan endpoint)
- `ip_address` - IP address client
- `request_payload` - Data request (tanpa password)
- `response_code` - HTTP response code
- `created_at` - Waktu aktivitas

### Contoh Penggunaan

```php
// Aplikasi otomatis mencatat log untuk semua endpoint yang mengirim request
Route::middleware(['auth:sanctum', 'audit.log'])->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/checkout', CheckoutController::class);
});
```

---

## Database Migrations

### 1. Tabel `shifts`
```sql
CREATE TABLE shifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    closing_balance DECIMAL(15,2) DEFAULT 0,
    status ENUM('open','closed') DEFAULT 'open',
    ip_address VARCHAR(45) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. Tabel `audit_logs`
```sql
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(255),
    endpoint VARCHAR(255),
    ip_address VARCHAR(45) NULL,
    request_payload TEXT NULL,
    response_code VARCHAR(10) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 3. Tabel `users` (updated)
```sql
ALTER TABLE users 
ADD COLUMN role VARCHAR(10) DEFAULT 'kasir' COMMENT 'admin,kasir' AFTER password;
```

---

## Cara Pendaftaran Middleware

### Laravel 11 (via bootstrap/app.php)

Middleware sudah didaftarkan di `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
        \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
    ]);

    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
        'ensure.shift.is.open' => \App\Http\Middleware\EnsureShiftIsOpen::class,
        'audit.log' => \App\Http\Middleware\AuditLogMiddleware::class,
    ]);
})
```

### Laravel 10 dan ke bawah (via app/Http/Kernel.php)

Jika menggunakan Laravel 10, tambahkan di `app/Http/Kernel.php`:

```php
protected $routeMiddleware = [
    // ... middleware lain
    'role' => \App\Http\Middleware\RoleMiddleware::class,
    'ensure.shift.is.open' => \App\Http\Middleware\EnsureShiftIsOpen::class,
    'audit.log' => \App\Http\Middleware\AuditLogMiddleware::class,
];
```

---

## Contoh Flow Lengkap

### 1. Login sebagai Kasir
```http
POST /api/login
{
    "email": "kasir@example.com",
    "password": "password",
    "role": "kasir"
}
```

### 2. Buka Shift
```http
POST /api/shifts/open
Authorization: Bearer {token}
{
    "opening_balance": 500000
}
```

Response:
```json
{
    "message": "Shift berhasil dibuka.",
    "data": {
        "id": 1,
        "user_id": 2,
        "start_time": "2026-09-03 08:00:00",
        "opening_balance": 500000.00,
        "status": "open"
    }
}
```

### 3. Checkout Transaksi
```http
POST /api/checkout
Authorization: Bearer {token}
{
    "items": [
        {
            "product_id": 1,
            "quantity": 2,
            "price": 25000
        }
    ],
    "payment_method": "cash",
    "cash_paid": 100000,
    "customer_name": "Budi",
    "table_number": "12"
}
```

Response:
```json
{
    "message": "Transaksi berhasil.",
    "data": {
        "invoice_number": "INV-20260903-081530-1234",
        "subtotal": 50000,
        "tax": 5000,
        "total": 55000,
        "payment_method": "cash",
        "cash_paid": 100000,
        "change": 45000
    }
}
```

### 4. Tutup Shift
```http
POST /api/shifts/close
Authorization: Bearer {token}
{
    "closing_balance": 550000
}
```

---

## Troubleshooting

### Issue: "Unauthorized. Please login first."
**Solution:** Pastikan token API valid dan tidak expired.

### Issue: "Forbidden. You do not have permission to access this resource."
**Solution:** 
- Cek role user di database
- Pastikan endpoint menggunakan middleware role yang sesuai

### Issue: "Shift belum dibuka. Silakan buka shift terlebih dahulu."
**Solution:** 
- Jalankan endpoint `POST /api/shifts/open` sebelum checkout
- Pastikan shift sebelumnya sudah ditutup (`POST /api/shifts/close`)

### Issue: Audit logs tidak tercatat
**Solution:** 
- Pastikan middleware `audit.log` sudah didaftarkan
- Pastikan user terautentikasi saat melakukan request

---

## Tips

1. **Gunakan Laravel Sanctum** untuk autentikasi API
2. **Buka shift setiap hari** sebelum mulai transaksi
3. **Tutup shift di akhir hari** untuk menutup aktivitas transaksi
4. **Audit logs** sangat berguna untuk tracking dan debugging
5. **Monitoring** - Gunakan endpoint `/api/reports/transactions` untuk monitoring transaksi real-time
