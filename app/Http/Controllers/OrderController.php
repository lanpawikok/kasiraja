<?php

namespace App\Http\Controllers;

use App\Models\Santri;
use App\Models\SantriBalanceEntry;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    // Menerima data dari dashboard dan menyimpannya ke session
    public function processCheckout(Request $request)
    {
        // Validasi input dari frontend agar aman dan lengkap
        $request->validate([
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|integer',
            'cart.*.qty' => 'required|integer|min:1',
            'customerName' => 'required|string',
            'paymentMethod' => 'required|in:cash,deposit',
        ]);

        $orderData = DB::transaction(function () use ($request) {
            // Harga, nama, dan kategori selalu diambil dari database, bukan dari
            // payload browser, supaya total yang dipotong saldo tidak bisa dimanipulasi.
            $resolvedItems = [];
            $subtotal = 0;

            foreach ($request->input('cart') as $item) {
                $product = Product::whereKey($item['id'] ?? null)
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    abort(422, 'Produk di keranjang tidak ditemukan.');
                }

                $quantity = (int) $item['qty'];
                if ($quantity > $product->stock) {
                    abort(422, "Stok {$product->name} tidak mencukupi.");
                }

                $lineTotal = $quantity * $product->price;
                $lineTotal = round((float) $lineTotal, 2);

                $resolvedItems[] = [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'qty' => $quantity,
                    'line_total' => $lineTotal,
                ];

                $subtotal += $lineTotal;

                $product->decrement('stock', $quantity);
            }

            $subtotal = round($subtotal, 2);
            $total = $subtotal;

            $santri = null;
            if ($request->input('paymentMethod') === 'deposit') {
                $santri = Santri::whereRaw('LOWER(name) = ?', [strtolower(trim($request->input('customerName')))])
                    ->lockForUpdate()
                    ->first();

                if (!$santri) {
                    // Nama tidak ada di daftar Santri, jadi tidak ada saldo yang
                    // bisa dipotong. Balikin 422 supaya kasir diarahkan pakai Cash
                    // untuk warga atau pengunjung, bukan ikut tercatat punya utang.
                    abort(422, 'Nama belum terdaftar, tidak bisa bayar pakai saldo. Pakai Cash saja.');
                }

                $santri->balance -= $total;
                $santri->save();

                SantriBalanceEntry::create([
                    'santri_id' => $santri->id,
                    'user_id' => $request->user()->id,
                    'type' => 'purchase',
                    'amount' => -$total,
                    'balance_after' => $santri->balance,
                    'notes' => 'Pembelian kantin dari saldo deposit',
                    'details' => [
                        'items' => collect($resolvedItems)->map(fn (array $item) => [
                            'name' => $item['name'],
                            'qty' => $item['qty'],
                            'price' => $item['price'],
                        ])->values()->all(),
                        'subtotal' => $subtotal,
                        'total' => $total,
                    ],
                ]);
            }

            return [
            'id' => 'ORD-' . rand(1000, 9999),
            'date' => now()->format('d M Y, H:i'),
            'cashier' => $request->user()->name,
            'customerName' => $request->input('customerName'), // Diambil dinamis dari form POS
            'santriBalance' => $santri?->balance,
            'items' => collect($resolvedItems)->map(function ($item) use ($request) {
                // Tentukan tipe item untuk Dapur atau Bar berdasarkan kategori produk
                $category = strtolower((string) $item['category']);
                $type = in_array($category, ['kopi', 'non-kopi']) ? 'bar' : 'food';

                return [
                    'id' => $item['id'],
                    'name' => $item['name'],
                    'price' => $item['price'],
                    'qty' => $item['qty'],
                    'type' => $type, // 'food' untuk dapur, 'bar' untuk minuman
                    'notes' => $request->input('orderNote'),
                ];
            })->toArray(),
            'paymentMethod' => $request->input('paymentMethod') === 'deposit' ? 'DEPOSIT' : 'CASH',
            'cashPaid' => $total,
            'subtotal' => $subtotal,
            'total' => $total,
            ];
        });

        session(['current_order' => $orderData]);

        return redirect()->route('receipt.preview');
    }

    // Merender halaman preview struk dengan membawa data session
    public function previewReceipt()
    {
        $order = session('current_order', null);

        return Inertia::render('ReceiptPreview', [
            'order' => $order
        ]);
    }
}