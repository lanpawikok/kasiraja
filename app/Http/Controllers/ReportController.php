<?php

namespace App\Http\Controllers;

use App\Models\StockAudit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $selectedMonth = $request->input('month', date('Y-m'));

        $auditItems = StockAudit::all();

        // Data dummy ringkasan keuangan
        $summary = [
            'total_income' => 42500000,
            'total_expense' => 18200000,
            'items_sold' => 1245,
        ];

        return Inertia::render('Reports/Index', [
            'auditItemsData' => $auditItems,
            'summary' => $summary,
            'selectedMonth' => $selectedMonth,
        ]);
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
