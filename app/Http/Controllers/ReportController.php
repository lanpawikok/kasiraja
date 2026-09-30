<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\SantriBalanceEntry;
use App\Models\StockAudit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $selectedMonth = $request->input('month', date('Y-m'));
        if (!preg_match('/^\d{4}-\d{2}$/', $selectedMonth)) {
            $selectedMonth = date('Y-m');
        }
        $month = Carbon::createFromFormat('Y-m', $selectedMonth);
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();

        $purchases = SantriBalanceEntry::where('type', 'purchase')
            ->whereBetween('created_at', [$start, $end])
            ->orderBy('created_at')
            ->get();
        $dailySales = $purchases->filter(fn (SantriBalanceEntry $entry) => $entry->created_at->isToday())
            ->groupBy(fn (SantriBalanceEntry $entry) => $entry->created_at->toDateString())
            ->map(function ($entries, $date) {
                $items = $entries
                    ->flatMap(fn (SantriBalanceEntry $entry) => $entry->details['items'] ?? [])
                    ->groupBy('name')
                    ->map(fn ($menuItems, $name) => [
                        'name' => $name,
                        'quantity' => $menuItems->sum('qty'),
                        'revenue' => $menuItems->sum(fn ($item) => ($item['price'] ?? 0) * ($item['qty'] ?? 0)),
                    ])
                    ->sortByDesc('quantity')
                    ->values();

                return [
                    'date' => $date,
                    'items_sold' => $items->sum('quantity'),
                    'revenue' => $entries->sum(fn (SantriBalanceEntry $entry) => abs((float) $entry->amount)),
                    'transactions' => $entries->count(),
                    'top_item' => $items->first()['name'] ?? '-',
                    'details' => $items->map(fn ($item) => "{$item['quantity']}x {$item['name']}")->implode(', '),
                ];
            })->values();

        $monthlyTrend = collect(range(3, 0))->map(function (int $monthsAgo) use ($month) {
            $period = $month->copy()->subMonths($monthsAgo);
            $startOfMonth = $period->copy()->startOfMonth();
            $endOfMonth = $period->copy()->endOfMonth();

            return [
                'label' => $period->translatedFormat('M'),
                'income' => (float) SantriBalanceEntry::where('type', 'purchase')
                    ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                    ->sum('amount') * -1,
                'expense' => (float) Inventory::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                    ->sum('total_price'),
            ];
        });

        $auditItems = StockAudit::all();

        // Menghitung total pengeluaran secara dinamis dari tabel inventaris
        $totalExpense = Inventory::whereBetween('created_at', [$start, $end])->sum('total_price');

        $summary = [
            'total_income' => $purchases->sum(fn (SantriBalanceEntry $entry) => abs((float) $entry->amount)),
            'total_expense' => $totalExpense,
            'items_sold' => $purchases->sum(fn (SantriBalanceEntry $entry) => collect($entry->details['items'] ?? [])->sum('qty')),
            'transactions' => $purchases->count(),
        ];

        return Inertia::render('Reports/Index', [
            'auditItemsData' => $auditItems,
            'summary' => $summary,
            'selectedMonth' => $selectedMonth,
            'dailySales' => $dailySales,
            'monthlyTrend' => $monthlyTrend,
        ]);
    }

    public function exportMonthly(Request $request): StreamedResponse
    {
        $monthInput = $request->input('month', now()->format('Y-m'));
        abort_unless(preg_match('/^\d{4}-\d{2}$/', $monthInput), 422, 'Format bulan tidak valid.');

        $month = Carbon::createFromFormat('Y-m', $monthInput);
        $purchases = SantriBalanceEntry::where('type', 'purchase')
            ->whereBetween('created_at', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
            ->orderBy('created_at')
            ->get();
        $expenses = Inventory::whereBetween('created_at', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
            ->orderBy('created_at')
            ->get();

        return response()->streamDownload(function () use ($purchases, $expenses, $month) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Laporan Keuangan Bulanan', $month->format('F Y')]);
            fputcsv($handle, []);
            fputcsv($handle, ['PENJUALAN']);
            fputcsv($handle, ['Tanggal', 'Transaksi', 'Item Terjual', 'Pendapatan', 'Detail Produk']);

            $purchases->groupBy(fn (SantriBalanceEntry $entry) => $entry->created_at->toDateString())
                ->each(function ($entries, $date) use ($handle) {
                    $items = $entries->flatMap(fn (SantriBalanceEntry $entry) => $entry->details['items'] ?? []);
                    fputcsv($handle, [
                        $date,
                        $entries->count(),
                        $items->sum('qty'),
                        $entries->sum(fn (SantriBalanceEntry $entry) => abs((float) $entry->amount)),
                        $items->groupBy('name')->map(fn ($group, $name) => $group->sum('qty') . 'x ' . $name)->implode(', '),
                    ]);
                });

            fputcsv($handle, []);
            fputcsv($handle, ['PENGELUARAN INVENTORY']);
            fputcsv($handle, ['Tanggal', 'Nama', 'Kategori', 'Jumlah', 'Total Pengeluaran']);
            $expenses->each(fn (Inventory $expense) => fputcsv($handle, [
                $expense->created_at->toDateString(),
                $expense->name,
                $expense->category,
                $expense->qty . ' ' . $expense->unit,
                $expense->total_price,
            ]));

            fputcsv($handle, []);
            fputcsv($handle, ['RINGKASAN']);
            fputcsv($handle, ['Total Pendapatan', $purchases->sum(fn (SantriBalanceEntry $entry) => abs((float) $entry->amount))]);
            fputcsv($handle, ['Total Pengeluaran', $expenses->sum('total_price')]);
            fclose($handle);
        }, "laporan-keuangan-{$monthInput}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function storeAudit(Request $request)
    {
        $validated = $request->validate([
            'audits' => 'required|array',
            'audits.*.id' => 'required|exists:stock_audits,id',
            'audits.*.physicalStock' => 'required|numeric',
            'audits.*.reason' => 'nullable|string',
        ]);

        foreach ($validated['audits'] as $item) {
            StockAudit::where('id', $item['id'])->update([
                'physical_stock' => $item['physicalStock'],
                'reason' => $item['reason'],
            ]);
        }

        return redirect()->back()->with('success', 'Audit stok berhasil disimpan.');
    }
}