<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    private function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }

        return strtolower((string) ($user->status_pengguna ?? '')) === 'admin'
            || strtolower((string) ($user->daftar_sebagai ?? '')) === 'admin';
    }

    public function index(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::orderBy('id', 'desc')->get();

        return response()->json($users);
    }

    public function store(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['required', 'string', 'max:255', 'unique:users,nip'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'no_wa' => ['nullable', 'string', 'max:25'],
            'daftar_sebagai' => ['nullable', 'string', 'max:255'],
            'organization_detail' => ['nullable', 'string', 'max:255'],
            'status_pengguna' => ['required', Rule::in(['User', 'Admin', 'Psikolog'])],
            'is_available' => ['nullable', 'boolean'],
        ]);

        if (!array_key_exists('is_available', $validated)) {
            $validated['is_available'] = true;
        }

        $user = User::create($validated);

        return response()->json([
            'message' => 'User berhasil ditambahkan',
            'user' => $user,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['required', 'string', 'max:255', Rule::unique('users', 'nip')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'no_wa' => ['nullable', 'string', 'max:25'],
            'daftar_sebagai' => ['nullable', 'string', 'max:255'],
            'organization_detail' => ['nullable', 'string', 'max:255'],
            'status_pengguna' => ['required', Rule::in(['User', 'Admin', 'Psikolog'])],
            'is_available' => ['nullable', 'boolean'],
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User berhasil diperbarui',
            'user' => $user,
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Admin tidak dapat menghapus akun sendiri'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus']);
    }
}
