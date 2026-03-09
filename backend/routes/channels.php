<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Consultation;

/*
|--------------------------------------------------------------------------
| Broadcast Channel Authorization
|--------------------------------------------------------------------------
|
| private-consultation.{consultationId}
|   - Admin: always allowed
|   - User / Psikolog: only if they are a participant of that consultation
|
*/

Broadcast::channel('consultation.{consultationId}', function ($user, $consultationId) {
    // Admins can join any consultation channel
    if ($user->status_pengguna === 'Admin') {
        return ['id' => $user->id, 'name' => $user->name, 'role' => 'Admin'];
    }

    $consultation = Consultation::find($consultationId);

    if (!$consultation) {
        return false;
    }

    if ((int) $consultation->user_id === $user->id || (int) $consultation->psikolog_id === $user->id) {
        return ['id' => $user->id, 'name' => $user->name, 'role' => $user->status_pengguna];
    }

    return false;
});
