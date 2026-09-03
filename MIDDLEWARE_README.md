# Middleware Setup - BrewMaster Pro

## Quick Start

Setelah membuat project Laravel baru, jalankan perintah berikut:

```bash
# 1. Jalankan migrations
php artisan migrate

# 2. Jalankan seeders (untuk create user admin dan kasir)
php artisan db:seed --class=UserSeeder

# 3. Mulai server development
php artisan serve
```

## Setup Laravel Sanctum (untuk API Authentication)

Jika belum menggunakan Laravel Sanctum:

```bash
# Install Laravel Sanctum
composer require laravel/sanctum

# Publish config
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Jalankan migrations Sanctum
php artisan migrate
```

## Konfigurasi .env

Pastikan .env sudah dikonfigurasi:

```env
API_URL=http://localhost:8000/api
APP_URL=http://localhost:8000
```

## Testing Middleware dengan Postman/cURL

### 1. Login sebagai Admin
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@brewmaster.pro",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Login sebagai Kasir
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kasir@brewmaster.pro",
    "password": "admin123",
    "role": "kasir"
  }'
```

### 3. Buka Shift (sebagai Kasir)
```bash
curl -X POST http://localhost:8000/api/shifts/open \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "opening_balance": 500000
  }'
```

### 4. Checkout (sebagai Kasir)
```bash
curl -X POST http://localhost:8000/api/checkout \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## Struktur File

```
app/
├── Http/
│   └── Middleware/
│       ├── RoleMiddleware.php
│       ├── EnsureShiftIsOpen.php
│       └── AuditLogMiddleware.php
├── Models/
│   ├── User.php (updated)
│   ├── Shift.php (new)
│   └── AuditLog.php (new)
├── Http/
│   └── Controllers/
│       └── Api/
│           ├── ShiftController.php (new)
│           └── CheckoutController.php (new)
database/
├── migrations/
│   ├── 2026_09_03_000000_create_shifts_table.php (new)
│   ├── 2026_09_03_000001_create_audit_logs_table.php (new)
│   └── 0001_01_01_000000_create_users_table.php (updated)
└── seeders/
    └── UserSeeder.php (updated)
routes/
├── api.php (new)
└── web.php (existing)
```

## Middleware Alias

Middleware sudah didaftarkan di `bootstrap/app.php` dengan alias:

| Alias | Class | Keterangan |
|-------|-------|------------|
| `role` | RoleMiddleware | RBAC untuk role admin/kasir |
| `ensure.shift.is.open` | EnsureShiftIsOpen | Validasi shift aktif |
| `audit.log` | AuditLogMiddleware | Logging aktivitas |

## Troubleshooting

### Error: "Class 'App\Models\Shift' not found"
**Solution:** Pastikan file `app/Models/Shift.php` sudah dibuat.

### Error: "Undefined variable $middleware"
**Solution:** Pastikan Anda menggunakan Laravel 11 dan file `bootstrap/app.php` sudah benar.

### Error: "SQLSTATE[42S02]: Base table or view not found"
**Solution:** Jalankan `php artisan migrate` untuk membuat tabel yang diperlukan.

### Error: "Token expired"
**Solution:** Refresh token atau login ulang.

---

**Catatan:** Middleware ini dirancang untuk Laravel 11. Jika menggunakan Laravel 10, gunakan `app/Http/Kernel.php` untuk mendaftarkan middleware.
