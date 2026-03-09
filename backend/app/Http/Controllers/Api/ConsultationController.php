<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ConsultationController extends Controller
{
    private function psikologBaseQuery()
    {
        return User::query()
            ->whereRaw('LOWER(COALESCE(status_pengguna, "")) = ?', ['psikolog'])
            ->select([
                'id',
                'name',
                'email',
                'no_wa',
                'foto',
                'is_available',
                'organization_detail',
            ]);
    }

    private function getExportableConsultations($user)
    {
        if ($this->isAdmin($user)) {
            return Consultation::with(['user', 'psikolog'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        if ($this->isPsikolog($user)) {
            return Consultation::with(['user', 'psikolog'])
                ->where('psikolog_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return collect([]);
    }

    private function isPsikolog($user): bool
    {
        if (!$user) {
            return false;
        }

        return strtolower((string) ($user->status_pengguna ?? '')) === 'psikolog'
            || strtolower((string) ($user->daftar_sebagai ?? '')) === 'psikolog';
    }

    private function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }

        return strtolower((string) ($user->status_pengguna ?? '')) === 'admin'
            || strtolower((string) ($user->daftar_sebagai ?? '')) === 'admin';
    }

    /**
     * Get all consultations for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($this->isPsikolog($user)) {
            $consultations = Consultation::with(['user', 'psikolog'])
                ->where('psikolog_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($this->isAdmin($user)) {
            $consultations = Consultation::with(['user', 'psikolog'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $consultations = Consultation::with(['user', 'psikolog'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($consultations);
    }

    /**
     * Store a new consultation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'q1' => 'required|string',
            'q2' => 'required|string',
            'q3' => 'required|string',
            'q4' => 'required|string',
            'q5' => 'required|string',
            'q6' => 'required|string',
            'q7' => 'required|string',
            'psikolog_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id'),
            ],
        ]);

        $psikolog = $this->psikologBaseQuery()
            ->where('id', $validated['psikolog_id'])
            ->first();

        if (!$psikolog) {
            return response()->json([
                'message' => 'Psikolog yang dipilih tidak ditemukan.',
            ], 422);
        }

        if (!$psikolog->is_available) {
            return response()->json([
                'message' => 'Psikolog yang dipilih sedang tidak tersedia. Silakan pilih psikolog lain.',
            ], 422);
        }

        $consultation = Consultation::create([
            'user_id' => $request->user()->id,
            'q1' => $validated['q1'],
            'q2' => $validated['q2'],
            'q3' => $validated['q3'],
            'q4' => $validated['q4'],
            'q5' => $validated['q5'],
            'q6' => $validated['q6'],
            'q7' => $validated['q7'],
            'status' => 'pending',
            'psikolog_id' => $validated['psikolog_id'],
        ]);

        return response()->json([
            'message' => 'Konsultasi berhasil dikirim',
            'consultation' => $consultation->load(['user', 'psikolog'])
        ], 201);
    }

    /**
     * Get a specific consultation
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $consultation = Consultation::with(['user', 'psikolog'])->findOrFail($id);

        if ($this->isAdmin($user)) {
            return response()->json($consultation);
        }

        if ($consultation->user_id === $user->id) {
            return response()->json($consultation);
        }

        if ($this->isPsikolog($user)) {
            if ($consultation->psikolog_id === $user->id) {
                return response()->json($consultation);
            }
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Update consultation (only for psikolog/admin to add notes or change status)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        if (!$this->isPsikolog($user) && !$this->isAdmin($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultation = Consultation::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,reviewed,in_progress,completed,needs_referral',
            'notes' => 'sometimes|string|nullable',
            'psikolog_id' => 'sometimes|exists:users,id|nullable',
        ]);

        if ($this->isPsikolog($user)) {
            if ($consultation->psikolog_id !== null && $consultation->psikolog_id !== $user->id) {
                return response()->json(['message' => 'Laporan ini sudah ditangani psikolog lain'], 403);
            }

            if ($consultation->psikolog_id === null) {
                $validated['psikolog_id'] = $user->id;
            }
        }

        $consultation->update($validated);

        return response()->json([
            'message' => 'Konsultasi berhasil diperbarui',
            'consultation' => $consultation->load(['user', 'psikolog'])
        ]);
    }

    /**
     * Allow the consultation owner to mark a needs_referral consultation as completed.
     */
    public function markCompleted(Request $request, $id)
    {
        $user = $request->user();
        $consultation = Consultation::findOrFail($id);

        if ($consultation->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($consultation->status !== 'needs_referral') {
            return response()->json([
                'message' => 'Hanya konsultasi dengan status "Perlu Rujukan" yang dapat ditandai selesai.'
            ], 422);
        }

        $consultation->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Konsultasi berhasil ditandai selesai.',
            'consultation' => $consultation->load(['user', 'psikolog'])
        ]);
    }

    /**
     * Delete a consultation (only own consultations)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $consultation = Consultation::findOrFail($id);

        if ($consultation->user_id !== $user->id && !$this->isAdmin($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultation->delete();

        return response()->json(['message' => 'Konsultasi berhasil dihapus']);
    }

    /**
     * Get pending consultations (for psikolog/admin)
     */
    public function pending(Request $request)
    {
        $user = $request->user();

        if (!$this->isPsikolog($user) && !$this->isAdmin($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultationsQuery = Consultation::with(['user', 'psikolog'])
            ->where('status', 'pending');

        if ($this->isPsikolog($user)) {
            $consultationsQuery->where('psikolog_id', $user->id);
        }

        $consultations = $consultationsQuery
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($consultations);
    }

    public function psychologists(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $psychologists = $this->psikologBaseQuery()
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($psikolog) {
                return [
                    'id' => $psikolog->id,
                    'name' => $psikolog->name,
                    'email' => $psikolog->email,
                    'no_wa' => $psikolog->no_wa,
                    'foto' => $psikolog->foto,
                    'organization_detail' => $psikolog->organization_detail,
                    'is_available' => (bool) $psikolog->is_available,
                    'availability_label' => $psikolog->is_available ? 'Tersedia' : 'Tidak Tersedia',
                ];
            });

        return response()->json($psychologists);
    }

    public function updateAvailability(Request $request)
    {
        $user = $request->user();

        if (!$this->isPsikolog($user)) {
            return response()->json(['message' => 'Hanya psikolog yang dapat mengubah status ketersediaan.'], 403);
        }

        $validated = $request->validate([
            'is_available' => 'required|boolean',
        ]);

        $user->is_available = (bool) $validated['is_available'];
        $user->save();

        return response()->json([
            'message' => 'Status ketersediaan berhasil diperbarui.',
            'is_available' => (bool) $user->is_available,
            'availability_label' => $user->is_available ? 'Tersedia' : 'Tidak Tersedia',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = $request->user();

        if (!$this->isPsikolog($user) && !$this->isAdmin($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultations = $this->getExportableConsultations($user);

        $pdf = Pdf::loadView('exports.consultations', [
            'consultations' => $consultations,
            'generatedAt' => now(),
            'generatedBy' => $user,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('laporan-konsultasi-' . now()->format('Ymd-His') . '.pdf');
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $user = $request->user();

        if (!$this->isPsikolog($user) && !$this->isAdmin($user)) {
            abort(403, 'Unauthorized');
        }

        $consultations = $this->getExportableConsultations($user);
        $filename = 'laporan-konsultasi-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($consultations) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID Konsultasi',
                'Tanggal',
                'Nama Konsultan',
                'Email Konsultan',
                'Status',
                'Psikolog',
                'Keluhan (Q3)',
                'Catatan Psikolog',
            ]);

            foreach ($consultations as $consultation) {
                fputcsv($handle, [
                    $consultation->id,
                    optional($consultation->created_at)->format('Y-m-d H:i:s'),
                    $consultation->user->name ?? '-',
                    $consultation->user->email ?? '-',
                    $consultation->status,
                    $consultation->psikolog->name ?? '-',
                    trim((string) $consultation->q3),
                    trim((string) ($consultation->notes ?? '')),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
