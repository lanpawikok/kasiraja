# Files Created - BrewMaster Pro Middleware

## Ringkasan File yang Dibuat

### Middleware (3 files)

| No | File | Path | Deskripsi |
|----|------|------|-----------|
| 1 | RoleMiddleware.php | `app/Http/Middleware/RoleMiddleware.php` | RBAC untuk role admin/kasir |
| 2 | EnsureShiftIsOpen.php | `app/Http/Middleware/EnsureShiftIsOpen.php` | Validasi shift kasir aktif |
| 3 | AuditLogMiddleware.php | `app/Http/Middleware/AuditLogMiddleware.php` | Logging aktivitas transaksi |

### Models (4 files)

| No | File | Path | Deskripsi |
|----|------|------|-----------|
| 1 | Shift.php | `app/Models/Shift.php` | Model untuk tabel shifts |
| 2 | AuditLog.php | `app/Models/AuditLog.php` | Model untuk tabel audit_logs |
| 3 | Product.php | `app/Models/Product.php` | Model untuk tabel products |
| 4 | Transaction.php | `app/Models/Transaction.php` | Model untuk tabel transactions |
| 5 | TransactionItem.php | `app/Models/TransactionItem.php` | Model untuk tabel transaction_items |

### Controllers (2 files)

| No | File | Path | Deskripsi |
|----|------|------|-----------|
| 1 | ShiftController.php | `app/Http/Controllers/Api/ShiftController.php` | Controller untuk shift management |
| 2 | CheckoutController.php | `app/Http/Controllers/Api/CheckoutController.php` | Controller untuk checkout transaksi |

### Migrations (6 files)

| No | File | Path | Deskripsi |
|----|------|------|-----------|
| 1 | create_shifts_table.php | `database/migrations/2026_09_03_000000_create_shifts_table.php` | Tabel shifts |
| 2 | create_audit_logs_table.php | `database/migrations/2026_09_03_000001_create_audit_logs_table.php` | Tabel audit_logs |
| 3 | create_products_table.php | `database/migrations/2026_09_03_000003_create_products_table.php` | Tabel products |
| 4 | create_transaction_items_table.php | `database/migrations/2026_09_03_000004_create_transaction_items_table.php` | Tabel transaction_items |

### Routes (1 file)

| No | File | Path | Deskripsi |
|----|------|------|-----------|
| 1 | api.php | `routes/api.php` | API Routes untuk aplikasi |

### Documentation (4 files)

| No | File | Path | Deskripsi |
|----|------|------|-----------|
| 1 | MIDDLEWARE_DOCUMENTATION.md | Root | Dokumentasi lengkap middleware |
| 2 | MIDDLEWARE_README.md | Root | Panduan setup middleware |
| 3 | MIDDLEWARE_SETUP_GUIDE.md | Root | Panduan setup dengan kode lengkap |
| 4 | FILES_CREATED.md | Root | File ini |

### Files yang Diupdate

| No | File | Path | Perubahan |
|----|------|------|-----------|
| 1 | bootstrap/app.php | Root | Menambahkan middleware alias |
| 2 | UserSeeder.php | `database/seeders/UserSeeder.php` | Menambahkan user admin dan kasir dengan role |
| 3 | User.php | `app/Models/User.php` | Menambahkan kolom role dan relasi |
| 4 | 0001_01_01_000000_create_users_table.php | `database/migrations/` | Menambahkan kolom role |

---

## Cara Menggunakan

### 1. Jalankan Migrations

```bash
php artisan migrate
```

### 2. Jalankan Seeders

```bash
php artisan db:seed --class=UserSeeder
```

### 3. Install Laravel Sanctum (untuk API)

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 4. Mulai Server

```bash
php artisan serve
```

### 5. Test API

```bash
# Login sebagai Admin
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@brewmaster.pro","password":"admin123","role":"admin"}'

# Login sebagai Kasir
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@brewmaster.pro","password":"admin123","role":"kasir"}'
```

---

## API Endpoint Summary

| Endpoint | Method | Middleware | Deskripsi |
|----------|--------|------------|-----------|
| `/api/login` | POST | None | Login user |
| `/api/logout` | POST | auth:sanctum | Logout user |
| `/api/shifts/open` | POST | auth:sanctum | Buka shift |
| `/api/shifts/close` | POST | auth:sanctum | Tutup shift |
| `/api/shifts/current` | GET | auth:sanctum | Shift aktif |
| `/api/shifts/history` | GET | auth:sanctum | History shift |
| `/api/checkout` | POST | auth:sanctum, role:kasir, ensure.shift.is.open | Checkout transaksi |
| `/api/products` | GET | auth:sanctum, role:admin,kasir | Daftar produk |
| `/api/products` | POST | auth:sanctum, role:admin | Tambah produk |
| `/api/products/{id}` | PUT | auth:sanctum, role:admin | Update produk |
| `/api/products/{id}` | DELETE | auth:sanctum, role:admin | Hapus produk |
| `/api/users` | GET | auth:sanctum, role:admin | Daftar user |
| `/api/reports/sales` | GET | auth:sanctum, role:admin | Laporan penjualan |
| `/api/audit-logs` | GET | auth:sanctum, role:admin | Daftar audit logs |

---

## Struktur Folder

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── ShiftController.php
│   │       └── CheckoutController.php
│   └── Middleware/
│       ├── RoleMiddleware.php
│       ├── EnsureShiftIsOpen.php
│       └── AuditLogMiddleware.php
└── Models/
    ├── Shift.php
    ├── AuditLog.php
    ├── Product.php
    ├── Transaction.php
    └── TransactionItem.php

database/
├── migrations/
│   ├── 2026_09_03_000000_create_shifts_table.php
│   ├── 2026_09_03_000001_create_audit_logs_table.php
│   ├── 2026_09_03_000003_create_products_table.php
│   ├── 2026_09_03_000004_create_transaction_items_table.php
│   └── 0001_01_01_000000_create_users_table.php (updated)

routes/
├── api.php (new)
└── web.php (existing)

app/Models/User.php (updated)

bootstrap/app.php (updated)
```

---

## Testing Middleware

### Test RoleMiddleware

```bash
# Login sebagai Admin
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@brewmaster.pro","password":"admin123","role":"admin"}'

# Coba akses endpoint users (hanya admin)
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer {token}"

# Login sebagai Kasir
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@brewmaster.pro","password":"admin123","role":"kasir"}'

# Coba akses endpoint users (seharusnya 403 Forbidden)
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer {token}"
```

### Test EnsureShiftIsOpen

```bash
# Login sebagai Kasir
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@brewmaster.pro","password":"admin123","role":"kasir"}'

# Coba checkout tanpa buka shift (seharusnya 400 Bad Request)
curl -X POST http://localhost:8000/api/checkout \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":1,"quantity":2,"price":25000}],"payment_method":"cash"}'

# Buka shift
curl -X POST http://localhost:8000/api/shifts/open \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"opening_balance":500000}'

# Coba checkout lagi (seharusnya berhasil)
curl -X POST http://localhost:8000/api/checkout \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":1,"quantity":2,"price":25000}],"payment_method":"cash"}'
```

### Test AuditLogMiddleware

```bash
# Cek audit logs
curl -X GET http://localhost:8000/api/audit-logs \
  -H "Authorization: Bearer {token}"

# Cek apakah aktivitas tercatat
```

---

## Troubleshooting

### Error: "Class not found"
**Solution:** Pastikan file middleware sudah dibuat dan namespace sudah benar.

### Error: "Middleware not registered"
**Solution:** Pastikan middleware sudah didaftarkan di `bootstrap/app.php`.

### Error: "SQLSTATE[42S02]: Base table or view not found"
**Solution:** Jalankan `php artisan migrate` untuk membuat tabel yang diperlukan.

### Error: "Token expired"
**Solution:** Login ulang untuk refresh token.

---

## Catatan

- Middleware ini dirancang untuk Laravel 11
- Menggunakan Laravel Sanctum untuk autentikasi API
- Role middleware menggunakan kolom `role` di tabel `users`
- Audit log mencatat semua aktivitas user terautentikasi
- Shift middleware memastikan kasir tidak bisa checkout tanpa membuka shift terlebih dahulu
