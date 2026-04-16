<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $statusPengguna = strtolower((string) ($user->status_pengguna ?? ''));
        $daftarSebagai = strtolower((string) ($user->daftar_sebagai ?? ''));
        
        if ($statusPengguna !== 'admin' && $daftarSebagai !== 'admin') {
            return response()->json(['error' => 'Forbidden - Admin access required'], 403);
        }
        
        return $next($request);
    }
}
