<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthWebController extends Controller
{
    public function login(Request $request)
    {
        // Frontend implementations vary: some send `nip`, others send `email`,
        // or a generic `identifier` / `username`. Accept them all to avoid 422
        // validation errors when the payload key differs.
        $credentials = $request->validate([
            'nip' => ['nullable', 'string', 'required_without_all:email,identifier,username'],
            'email' => ['nullable', 'string', 'required_without_all:nip,identifier,username'],
            'identifier' => ['nullable', 'string', 'required_without_all:nip,email,username'],
            'username' => ['nullable', 'string', 'required_without_all:nip,email,identifier'],
            'password' => ['required'],
        ]);

        $identifier = trim((string) (
            $credentials['identifier']
            ?? $credentials['username']
            ?? $credentials['nip']
            ?? $credentials['email']
            ?? ''
        ));
        $password = trim((string) $credentials['password']);

        $user = User::where('nip', $identifier)
            ->orWhereRaw('LOWER(email) = ?', [mb_strtolower($identifier)])
            ->first();

        $storedPassword = $user?->password ?? '$2y$10$'.str_repeat('a', 53);
        if (! Hash::check($password, $storedPassword) || ! $user) {
            return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
        }

        // Check if user is approved
        if ($user->status_approval !== 'approved') {
            $approvalMessage = $user->status_approval === 'pending' 
                ? 'Your account is pending admin approval. Please wait for approval.'
                : 'Your account has been rejected by admin. Please contact administrator.';
            
            \Log::warning('Login attempt with non-approved user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'status_approval' => $user->status_approval,
                'status_pengguna' => $user->status_pengguna
            ]);
            
            return response()->json([
                'message' => $approvalMessage,
                'status_approval' => $user->status_approval,
            ], 403);
        }

        // Create API token for frontend
        $token = $user->createToken('api-token')->plainTextToken;

        \Log::info('User logged in successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
            'status_pengguna' => $user->status_pengguna,
            'status_approval' => $user->status_approval
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'nip' => array_merge(
                    ['required', 'string', 'unique:users,nip'],
                    strtolower($request->input('status_pengguna', '')) !== 'admin'
                        ? ['regex:/^\d{16}$/']
                        : []
                ),
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'pangkat_golongan' => ['required', 'string', 'max:255'],
                'jabatan' => ['required', 'string', 'max:255'],
                'instansi' => ['required', 'string', 'max:255'],
                'no_wa' => ['required', 'string'],
                'daftar_sebagai' => ['required', 'string', 'in:UPT,Kanwil,Ditjenpas'],
                'organization_detail' => ['nullable', 'string'],
                'status_pengguna' => ['required', 'string'],
            ]);

            $isAdminRegistration = mb_strtolower(trim((string) ($validated['status_pengguna'] ?? ''))) === 'admin';

            // Trim whitespace from all string fields to prevent login failures
            foreach (['name', 'nip', 'email', 'pangkat_golongan', 'jabatan', 'instansi', 'no_wa', 'daftar_sebagai', 'status_pengguna'] as $field) {
                if (isset($validated[$field])) {
                    $validated[$field] = trim($validated[$field]);
                }
            }
            if (isset($validated['organization_detail'])) {
                $validated['organization_detail'] = trim($validated['organization_detail']);
            }

            \Log::info('Register attempt', [
                'nip' => $validated['nip'],
                'email' => $validated['email'],
            ]);

            // Password will be automatically hashed by User model's cast
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],  // No manual hashing - let the cast handle it
                'nip' => $validated['nip'],
                'pangkat_golongan' => $validated['pangkat_golongan'],
                'jabatan' => $validated['jabatan'],
                'instansi' => $validated['instansi'],
                'no_wa' => $validated['no_wa'],
                'daftar_sebagai' => $validated['daftar_sebagai'],
                'organization_detail' => $validated['organization_detail'] ?? null,
                'status_pengguna' => $validated['status_pengguna'],
                // Admin has immediate access (no pending approval)
                'status_approval' => $isAdminRegistration ? 'approved' : 'pending',
            ]);

            \Log::info('User registered successfully', ['user_id' => $user->id, 'nip' => $user->nip]);

            return response()->json([
                'message' => $isAdminRegistration
                    ? 'Admin registered successfully.'
                    : 'User registered successfully. Please wait for admin approval.',
                'status' => $isAdminRegistration ? 'approved' : 'pending_approval',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('Validation failed on register', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Register error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Logout user and revoke tokens
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();

            if ($user) {
                // Revoke current access token
                $request->user()->currentAccessToken()->delete();

                \Log::info('User logged out', ['user_id' => $user->id, 'email' => $user->email]);
            }

            return response()->json([
                'message' => 'Logged out successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Logout error: ' . $e->getMessage());
            return response()->json(['message' => 'Logout failed'], 500);
        }
    }
}
