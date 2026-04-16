<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthWebController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-api', function () {
   return response()->json(['message' => 'API test working']);
});

Route::get('/phpinfo', function () {
   phpinfo();
});

// SPA login endpoint to create web session (for Filament access)
Route::post('/login', [AuthWebController::class, 'login'])->name('login');
Route::post('/register', [AuthWebController::class, 'register'])->name('register');
