<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    // Menerima data dari dashboard dan menyimpannya ke session
    public function processCheckout(Request $request)
    {
        // Petakan data dari request ke format yang dibaca oleh ReceiptPreview
        $orderData = [
            'id' => 'ORD-' . rand(1000, 9999),
            'date' => now()->format('d M Y, H:i'),
            'cashier' => 'Budi', 
            'table' => '12',     
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
            'paymentMethod' => 'CASH',
            'cashPaid' => $request->input('total'), 
            'subtotal' => $request->input('subtotal'),
            'tax' => $request->input('tax'),
            'total' => $request->input('total'),
        ];

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