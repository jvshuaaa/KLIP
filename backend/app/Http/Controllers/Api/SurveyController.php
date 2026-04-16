<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Survey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SurveyController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama' => ['nullable', 'string', 'max:255'],
                'nip' => ['nullable', 'string', 'max:255'],
                'kemudahanPenggunaan' => ['required', 'integer', 'min:1', 'max:5'],
                'kemudahanInformasi' => ['required', 'integer', 'min:1', 'max:5'],
                'tampilanWebsite' => ['required', 'integer', 'min:1', 'max:5'],
                'kenyamananPenggunaan' => ['required', 'integer', 'min:1', 'max:5'],
                'pemahamanInformasi' => ['required', 'integer', 'min:1', 'max:5'],
                'kesesuaianKebutuhan' => ['required', 'integer', 'min:1', 'max:5'],
                'kepuasanInformasi' => ['required', 'integer', 'min:1', 'max:5'],
                'tingkatKepuasan' => ['required', 'integer', 'min:1', 'max:5'],
                'keinginanMenggunakan' => ['required', 'integer', 'min:1', 'max:5'],
                'kemungkinanRekomendasi' => ['required', 'integer', 'min:1', 'max:5'],
                'saranHarapan' => ['nullable', 'string', 'max:1000'],
            ]);

            $survey = Survey::create([
                'nama' => $validated['nama'],
                'nip' => $validated['nip'],
                'kemudahan_penggunaan' => $validated['kemudahanPenggunaan'],
                'kemudahan_informasi' => $validated['kemudahanInformasi'],
                'tampilan_website' => $validated['tampilanWebsite'],
                'kenyamanan_penggunaan' => $validated['kenyamananPenggunaan'],
                'pemahaman_informasi' => $validated['pemahamanInformasi'],
                'kesesuaian_kebutuhan' => $validated['kesesuaianKebutuhan'],
                'kepuasan_informasi' => $validated['kepuasanInformasi'],
                'tingkat_kepuasan' => $validated['tingkatKepuasan'],
                'keinginan_menggunakan' => $validated['keinginanMenggunakan'],
                'kemungkinan_rekomendasi' => $validated['kemungkinanRekomendasi'],
                'saran_harapan' => $validated['saranHarapan'],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            Log::info('Survey submitted successfully', ['survey_id' => $survey->id]);

            return response()->json([
                'message' => 'Survey submitted successfully',
                'survey_id' => $survey->id
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Survey validation failed', $e->errors());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Survey submission error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error submitting survey'
            ], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            $surveys = Survey::orderBy('created_at', 'desc')
                ->get([
                    'id', 'nama', 'nip', 'kemudahan_penggunaan', 'kemudahan_informasi',
                    'tampilan_website', 'kenyamanan_penggunaan', 'pemahaman_informasi',
                    'kesesuaian_kebutuhan', 'kepuasan_informasi', 'tingkat_kepuasan',
                    'keinginan_menggunakan', 'kemungkinan_rekomendasi', 'saran_harapan',
                    'created_at'
                ]);

            return response()->json([
                'surveys' => $surveys
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching surveys: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching surveys'
            ], 500);
        }
    }

    public function statistics()
    {
        try {
            $surveys = Survey::all();
            $totalSurveys = $surveys->count();

            if ($totalSurveys === 0) {
                return response()->json([
                    'total_surveys' => 0,
                    'average_scores' => [],
                    'distribution' => []
                ]);
            }

            $averageScores = [
                'kemudahan_penggunaan' => $surveys->avg('kemudahan_penggunaan'),
                'kemudahan_informasi' => $surveys->avg('kemudahan_informasi'),
                'tampilan_website' => $surveys->avg('tampilan_website'),
                'kenyamanan_penggunaan' => $surveys->avg('kenyamanan_penggunaan'),
                'pemahaman_informasi' => $surveys->avg('pemahaman_informasi'),
                'kesesuaian_kebutuhan' => $surveys->avg('kesesuaian_kebutuhan'),
                'kepuasan_informasi' => $surveys->avg('kepuasan_informasi'),
                'tingkat_kepuasan' => $surveys->avg('tingkat_kepuasan'),
                'keinginan_menggunakan' => $surveys->avg('keinginan_menggunakan'),
                'kemungkinan_rekomendasi' => $surveys->avg('kemungkinan_rekomendasi'),
            ];

            $distribution = [];
            for ($i = 1; $i <= 5; $i++) {
                $distribution[$i] = [
                    'kemudahan_penggunaan' => $surveys->where('kemudahan_penggunaan', $i)->count(),
                    'kemudahan_informasi' => $surveys->where('kemudahan_informasi', $i)->count(),
                    'tampilan_website' => $surveys->where('tampilan_website', $i)->count(),
                    'kenyamanan_penggunaan' => $surveys->where('kenyamanan_penggunaan', $i)->count(),
                    'pemahaman_informasi' => $surveys->where('pemahaman_informasi', $i)->count(),
                    'kesesuaian_kebutuhan' => $surveys->where('kesesuaian_kebutuhan', $i)->count(),
                    'kepuasan_informasi' => $surveys->where('kepuasan_informasi', $i)->count(),
                    'tingkat_kepuasan' => $surveys->where('tingkat_kepuasan', $i)->count(),
                    'keinginan_menggunakan' => $surveys->where('keinginan_menggunakan', $i)->count(),
                    'kemungkinan_rekomendasi' => $surveys->where('kemungkinan_rekomendasi', $i)->count(),
                ];
            }

            return response()->json([
                'total_surveys' => $totalSurveys,
                'average_scores' => $averageScores,
                'distribution' => $distribution
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching survey statistics: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching survey statistics'
            ], 500);
        }
    }
}
