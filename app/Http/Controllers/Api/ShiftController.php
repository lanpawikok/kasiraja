<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShiftController extends Controller
{
    /**
     * Buka shift untuk user yang sedang login
     */
    public function open(Request $request)
    {
        // Cek apakah user sudah punya shift aktif
        $activeShift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->whereNull('end_time')
            ->first();

        if ($activeShift) {
            return response()->json([
                'message' => 'Shift sudah aktif.',
                'data' => $activeShift,
            ], 200);
        }

        // Cek apakah ada shift yang belum ditutup
        $unclosedShift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->whereNotNull('end_time')
            ->first();

        if ($unclosedShift) {
            return response()->json([
                'message' => 'Ada shift yang belum ditutup. Silakan tutup shift terlebih dahulu.',
            ], 400);
        }

        // Buka shift baru
        $shift = Shift::create([
            'user_id' => $request->user()->id,
            'start_time' => now(),
            'opening_balance' => $request->input('opening_balance', 0),
            'status' => 'open',
            'ip_address' => $request->ip(),
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'message' => 'Shift berhasil dibuka.',
            'data' => $shift,
        ], 201);
    }

    /**
     * Tutup shift untuk user yang sedang login
     */
    public function close(Request $request)
    {
        // Cari shift aktif
        $shift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->whereNull('end_time')
            ->first();

        if (!$shift) {
            return response()->json([
                'message' => 'Tidak ada shift aktif yang bisa ditutup.',
            ], 400);
        }

        // Update shift
        $shift->update([
            'end_time' => now(),
            'closing_balance' => $request->input('closing_balance', $shift->opening_balance),
            'status' => 'closed',
            'notes' => $request->input('notes', $shift->notes),
        ]);

        return response()->json([
            'message' => 'Shift berhasil ditutup.',
            'data' => $shift,
        ], 200);
    }

    /**
     * Ambil detail shift aktif
     */
    public function current(Request $request)
    {
        $shift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->whereNull('end_time')
            ->first();

        if (!$shift) {
            return response()->json([
                'message' => 'Tidak ada shift aktif.',
            ], 404);
        }

        return response()->json([
            'data' => $shift,
        ], 200);
    }

    /**
     * Ambil history shift user
     */
    public function history(Request $request)
    {
        $shifts = Shift::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $shifts,
        ], 200);
    }
}
