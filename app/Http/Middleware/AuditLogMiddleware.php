<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Catat log hanya untuk user yang terautentikasi
        if ($request->user()) {
            \App\Models\AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => $this->determineAction($request),
                'endpoint' => $request->path(),
                'ip_address' => $request->ip(),
                'request_payload' => $this->getPayload($request),
                'response_code' => $response->getStatusCode(),
            ]);
        }

        return $response;
    }

    /**
     * Tentukan aksi berdasarkan endpoint dan method request
     */
    private function determineAction(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();

        // Definisi aksi berdasarkan endpoint
        $actions = [
            'checkout' => 'Checkout Transaksi',
            'transactions' => 'Manajemen Transaksi',
            'products' => 'Manajemen Produk',
            'inventory' => 'Manajemen Inventory',
            'shifts/open' => 'Buka Shift',
            'shifts/close' => 'Tutup Shift',
            'users' => 'Manajemen User',
            'reports' => 'Laporan',
        ];

        foreach ($actions as $endpoint => $action) {
            if (str_contains($path, $endpoint)) {
                return $action;
            }
        }

        // Default action berdasarkan HTTP method
        $methodActions = [
            'POST' => 'Create',
            'PUT' => 'Update',
            'PATCH' => 'Update',
            'DELETE' => 'Delete',
            'GET' => 'Read',
        ];

        return $methodActions[$method] ?? 'Access';
    }

    /**
     * Ambil payload request (tanpa password)
     */
    private function getPayload(Request $request): ?string
    {
        $payload = $request->all();

        // Hapus field password dari payload jika ada
        unset($payload['password']);
        unset($payload['password_confirmation']);

        // Hapus file upload dari payload
        foreach ($payload as $key => $value) {
            if (is_object($value) && $value instanceof \Illuminate\Http\UploadedFile) {
                unset($payload[$key]);
            }
        }

        return count($payload) > 0 ? json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) : null;
    }
}
