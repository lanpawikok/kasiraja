<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureShiftIsOpen
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Cek apakah user terautentikasi
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthorized. Please login first.',
            ], 401);
        }

        // Cek apakah user memiliki shift aktif (status 'open')
        $hasActiveShift = \App\Models\Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->whereNull('end_time')
            ->exists();

        if (!$hasActiveShift) {
            return response()->json([
                'message' => 'Shift belum dibuka. Silakan buka shift terlebih dahulu.',
                'hint' => 'Gunakan endpoint POST /api/shifts/open untuk membuka shift.',
            ], 400);
        }

        return $next($request);
    }
}
