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
            'cart' => 'required|array',
            'subtotal' => 'required|numeric',
            'tax' => 'required|numeric',
            'total' => 'required|numeric',
            'customerName' => 'required|string',
            'tableNumber' => 'required|string',
            'paymentMethod' => 'required|in:cash,deposit',
        ]);

        $orderData = DB::transaction(function () use ($request) {
            foreach ($request->input('cart') as $item) {
                $product = Product::whereKey($item['id'] ?? null)
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    continue;
                }

                $quantity = (int) $item['qty'];
                if ($product->stock < $quantity) {
                    abort(422, "Stok {$product->name} tidak mencukupi.");
                }

                $product->decrement('stock', $quantity);
            }

            $santri = null;
            if ($request->input('paymentMethod') === 'deposit') {
                $santri = Santri::whereRaw('LOWER(name) = ?', [strtolower(trim($request->input('customerName')))])
                    ->lockForUpdate()
                    ->first();

                if (!$santri) {
                    $santri = Santri::create(['name' => trim($request->input('customerName'))]);
                }

                $santri->balance -= $request->input('total');
                $santri->save();

                SantriBalanceEntry::create([
                    'santri_id' => $santri->id,
                    'user_id' => $request->user()->id,
                    'type' => 'purchase',
                    'amount' => -$request->input('total'),
                    'balance_after' => $santri->balance,
                    'notes' => 'Pembelian kantin dari saldo deposit',
                    'details' => [
                        'items' => collect($request->input('cart'))->map(fn (array $item) => [
                            'name' => $item['name'],
                            'qty' => $item['qty'],
                            'price' => $item['price'],
                        ])->values()->all(),
                        'subtotal' => $request->input('subtotal'),
                        'tax' => $request->input('tax'),
                        'total' => $request->input('total'),
                    ],
                ]);
            }

            return [
            'id' => 'ORD-' . rand(1000, 9999),
            'date' => now()->format('d M Y, H:i'),
            'cashier' => $request->user()->name,
            'customerName' => $request->input('customerName'), // Diambil dinamis dari form POS
            'santriBalance' => $santri?->balance,
            'table' => $request->input('tableNumber'),       // Diambil dinamis dari form POS
            'items' => collect($request->input('cart'))->map(function ($item) use ($request) {
                // Tentukan tipe item untuk Dapur atau Bar berdasarkan kategori produk
                $category = strtolower($item['category'] ?? '');
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
            'cashPaid' => $request->input('total'), 
            'subtotal' => $request->input('subtotal'),
            'tax' => $request->input('tax'),
            'total' => $request->input('total'),
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