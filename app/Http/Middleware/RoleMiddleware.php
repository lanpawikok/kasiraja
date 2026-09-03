<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return $this->unauthorizedResponse($request);
        }

        if (!$this->canAccess($user->role, $roles)) {
            return $this->forbiddenResponse($request, $roles, $user->role);
        }

        return $next($request);
    }

    /**
     * Cek apakah role user bisa mengakses endpoint yang diminta
     */
    private function canAccess(?string $userRole, array $requiredRoles): bool
    {
        if ($userRole === null) {
            return false;
        }

        // Admin dapat mengakses seluruh fitur operasional.
        if ($userRole === 'admin') {
            return true;
        }

        return in_array($userRole, $requiredRoles, true);
    }

    private function unauthorizedResponse(Request $request): Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'Unauthorized. Please login first.',
            ], 401);
        }

        return redirect()->route('login');
    }

    private function forbiddenResponse(Request $request, array $requiredRoles, ?string $userRole): Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission to access this resource.',
                'required_roles' => $requiredRoles,
                'your_role' => $userRole,
            ], 403);
        }

        abort(403, 'Anda tidak memiliki akses ke halaman ini.');
    }
}
