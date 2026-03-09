<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthWebController;

Route::get('/', function () {
    return view('welcome');
});

// SPA login endpoint to create web session (for Filament access)
Route::post('/login', [AuthWebController::class, 'login']);
Route::post('/register', [AuthWebController::class, 'register']);
