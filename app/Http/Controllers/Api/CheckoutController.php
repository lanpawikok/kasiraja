<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    /**
     * Proses checkout transaksi
     * Middleware: role:kasir, ensure.shift.is.open
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,qris,transfer,debit',
            'customer_name' => 'nullable|string',
            'table_number' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        // Hitung total
        $subtotal = 0;
        foreach ($request->items as $item) {
            $subtotal += $item['quantity'] * $item['price'];
        }

        $tax = $subtotal * 0.10; // Pajak 10%
        $total = $subtotal + $tax;

        $paymentMethod = $request->payment_method;
        $cashPaid = $request->input('cash_paid', $total);

        // Hitung kembalian (jika cash)
        $change = 0;
        if ($paymentMethod === 'cash') {
            $change = $cashPaid - $total;
        }

        // Proses checkout dalam transaction
        $shift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->whereNull('end_time')
            ->first();

        $transaction = DB::transaction(function () use ($request, $subtotal, $tax, $total, $paymentMethod, $change) {
            $transaction = $request->user()->transactions()->create([
                'invoice_number' => 'INV-' . now()->format('Ymd-His') . '-' . rand(1000, 9999),
                'total_amount' => $total,
                'pay_amount' => $paymentMethod === 'cash' ? $cashPaid : $total,
                'change_amount' => $change,
                'payment_method' => $paymentMethod,
                'status' => 'completed',
                'notes' => $request->notes,
            ]);

            // Catat detail items di sini (jika ada tabel transaction_items)
            // foreach ($request->items as $item) {
            //     $transaction->items()->create($item);
            // }

            return $transaction;
        });

        return response()->json([
            'message' => 'Transaksi berhasil.',
            'data' => [
                'invoice_number' => $transaction->invoice_number,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $paymentMethod,
                'cash_paid' => $paymentMethod === 'cash' ? $cashPaid : null,
                'change' => $change,
                'created_at' => $transaction->created_at,
            ],
        ], 201);
    }
}
