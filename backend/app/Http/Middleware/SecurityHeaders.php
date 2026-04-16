<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response instanceof Response) {
            $response->headers->set('X-Frame-Options', 'DENY');
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
            $response->headers->set('X-XSS-Protection', '1; mode=block');
            $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

            if ($request->isSecure()) {
                $response->headers->set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
            }

            $frontend = env('FRONTEND_URL', 'http://localhost:5173');
            $backend = $request->getSchemeAndHttpHost();
            $csp = implode(' ', [
                "default-src 'self';",
                "connect-src 'self' {$frontend} {$backend} http://localhost:* https://localhost:* http://127.0.0.1:* https://127.0.0.1:*;",
                "img-src 'self' data: https: http: blob:;",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
                "font-src 'self' data: https://fonts.gstatic.com;",
                "frame-ancestors 'none';",
                "base-uri 'self';",
                "form-action 'self';",
            ]);

            $response->headers->set('Content-Security-Policy', $csp);
        }

        return $response;
    }
}
