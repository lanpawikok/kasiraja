<?php

namespace App\Http\Controllers;

use App\Models\Santri;
use App\Models\SantriBalanceEntry;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SantriController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('SantriBalances', [
            'santris' => Santri::query()
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'balance', 'updated_at']),
        ]);
    }

    public function balance(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $santri = Santri::whereRaw('LOWER(name) = ?', [strtolower(trim($data['name']))])
            ->where('active', true)
            ->first();

        if (!$santri) {
            return response()->json([
                'message' => 'Santri belum terdaftar.',
            ], 404);
        }

        return response()->json([
            'name' => $santri->name,
            'balance' => $santri->balance,
        ]);
    }

    public function history(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $santri = Santri::whereRaw('LOWER(name) = ?', [strtolower(trim($data['name']))])
            ->where('active', true)
            ->firstOrFail();

        return response()->json([
            'name' => $santri->name,
            'balance' => $santri->balance,
            'entries' => $santri->balanceEntries()
                ->whereDate('created_at', Carbon::today())
                ->latest()
                ->get(['id', 'type', 'amount', 'balance_after', 'details', 'created_at']),
        ]);
    }

    public function exportHistory(Request $request): StreamedResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $santri = Santri::whereRaw('LOWER(name) = ?', [strtolower(trim($data['name']))])
            ->where('active', true)
            ->firstOrFail();

        $entriesQuery = $santri->balanceEntries()->oldest();
        if ($request->boolean('today')) {
            $entriesQuery->whereDate('created_at', Carbon::today());
        }
        $entries = $entriesQuery->get();
        $filename = 'riwayat-saldo-'.str($santri->name)->slug().'-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($santri, $entries): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Riwayat Saldo Santri']);
            fputcsv($handle, ['Nama', $santri->name]);
            fputcsv($handle, ['Saldo Saat Ini', $santri->balance]);
            fputcsv($handle, []);
            fputcsv($handle, ['Tanggal', 'Jenis', 'Barang', 'Jumlah', 'Nominal', 'Saldo Setelah']);

            foreach ($entries as $entry) {
                $details = $entry->details ?? [];
                $items = collect($details['items'] ?? []);

                if ($entry->type === 'purchase' && $items->isNotEmpty()) {
                    foreach ($items as $item) {
                        fputcsv($handle, [
                            $entry->created_at->format('d/m/Y H:i'),
                            'Belanja',
                            $item['name'] ?? '-',
                            $item['qty'] ?? 0,
                            $item['price'] * ($item['qty'] ?? 0),
                            $entry->balance_after,
                        ]);
                    }
                } else {
                    fputcsv($handle, [
                        $entry->created_at->format('d/m/Y H:i'),
                        $entry->type === 'deposit' ? 'Deposit' : 'Penyesuaian',
                        $entry->notes ?? '-',
                        1,
                        $entry->amount,
                        $entry->balance_after,
                    ]);
                }
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function deposit(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        DB::transaction(function () use ($request, $data): void {
            $santri = Santri::whereRaw('LOWER(name) = ?', [strtolower(trim($data['name']))])
                ->lockForUpdate()
                ->first();

            if (!$santri) {
                $santri = Santri::create(['name' => trim($data['name'])]);
            }

            $santri->balance += $data['amount'];
            $santri->save();

            SantriBalanceEntry::create([
                'santri_id' => $santri->id,
                'user_id' => $request->user()->id,
                'type' => 'deposit',
                'amount' => $data['amount'],
                'balance_after' => $santri->balance,
                'notes' => 'Deposit saldo santri',
                'details' => null,
            ]);
        });

        return back()->with('status', 'deposit-created');
    }
}
