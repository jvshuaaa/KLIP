<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserApprovalController extends Controller
{
    public function index()
    {
        $pendingUsers = User::where('status_approval', 'pending')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'nip', 'daftar_sebagai', 'organization_detail', 'status_pengguna', 'created_at']);

        return response()->json([
            'pending_users' => $pendingUsers
        ]);
    }

    public function approve($userId)
    {
        try {
            $user = User::findOrFail($userId);
            
            if ($user->status_approval !== 'pending') {
                return response()->json([
                    'message' => 'User is not in pending status'
                ], 400);
            }

            $user->update([
                'status_approval' => 'approved'
            ]);

            Log::info('User approved', [
                'user_id' => $user->id,
                'nip' => $user->nip,
                'email' => $user->email
            ]);

            return response()->json([
                'message' => 'User approved successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error approving user: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error approving user'
            ], 500);
        }
    }

    public function reject(Request $request, $userId)
    {
        try {
            $validated = $request->validate([
                'rejection_reason' => ['required', 'string', 'max:500']
            ]);

            $user = User::findOrFail($userId);
            
            if ($user->status_approval !== 'pending') {
                return response()->json([
                    'message' => 'User is not in pending status'
                ], 400);
            }

            $user->update([
                'status_approval' => 'rejected'
            ]);

            Log::info('User rejected', [
                'user_id' => $user->id,
                'nip' => $user->nip,
                'email' => $user->email,
                'rejection_reason' => $validated['rejection_reason']
            ]);

            return response()->json([
                'message' => 'User rejected successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error rejecting user: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error rejecting user'
            ], 500);
        }
    }

    public function getAllUsers()
    {
        $users = User::select(['id', 'name', 'email', 'nip', 'daftar_sebagai', 'organization_detail', 'status_pengguna', 'status_approval', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'users' => $users
        ]);
    }
}
