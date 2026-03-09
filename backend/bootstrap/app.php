<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        channels: __DIR__.'/../routes/channels.php',
        attributes: ['middleware' => ['auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable CORS for all routes
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Exclude CSRF from login/register and authenticated API routes that use token-based auth
        $middleware->validateCsrfTokens(except: [
            'api/login',
            'api/register',
            'sanctum/csrf-cookie',
            'api/forgot-password',
            'api/reset-password',
            'api/logout',
            'api/update-password',
            'api/profile/update',
            'api/consultations',
            'api/consultations/*',
            'api/documents',
            'api/documents/*',
            'api/chat/*',
            'broadcasting/auth',
        ]);

        // API uses Bearer token auth (Sanctum personal access tokens),
        // so stateful SPA/session CSRF middleware is not required.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
