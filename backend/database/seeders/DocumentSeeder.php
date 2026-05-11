<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\SiteSetting;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        // Seed default site settings for logos
        SiteSetting::updateOrCreate(
            ['key' => 'home_logo'],
            ['value' => '/images/home_logo.png']
        );
        SiteSetting::updateOrCreate(
            ['key' => 'login_logo_kemenkumham'],
            ['value' => '/images/login_logo_kemenkumham.png']
        );
        SiteSetting::updateOrCreate(
            ['key' => 'login_logo_ditjen'],
            ['value' => '/images/login_logo_ditjen.png']
        );
        SiteSetting::updateOrCreate(
            ['key' => 'app_name'],
            ['value' => 'PATNAL Integrity Hub']
        );
        $adminId = DB::table('users')->where('status_pengguna', 'Admin')->value('id') ?? 1;
        $now = now();

        // Skip if default documents already seeded (check by title)
        $existingTitles = DB::table('documents')->pluck('title')->toArray();

        $peraturan = [
            [
                'title'        => 'Kode Etik Pegawai Pemasyarakatan',
                'category'     => 'peraturan',
                'sub_category' => 'permen',
                'cover'        => 'https://i.ibb.co.com/BH4xyT8j/Cover-Kode-Etik-Pegawai-Pemasyarakatan.jpg',
                'file'         => '/pdf/Kode Etik Pegawai Pemasyarakatan.pdf',
                'type'         => 'pdf',
            ],
            [
                'title'        => 'Netralitas ASN dalam Pilkada',
                'category'     => 'peraturan',
                'sub_category' => 'permen',
                'cover'        => 'https://i.ibb.co.com/xSfwxmzG/Cover-Pelanggaran-Netralitas-dan-Wewenang-ASN-dalam-Pilkada.jpg',
                'file'         => '/pdf/Netralitas ASN dalam Pilkada.pdf',
                'type'         => 'pdf',
            ],
            [
                'title'        => 'Permen Iminpas No. 1 Tahun 2024',
                'category'     => 'peraturan',
                'sub_category' => 'permen',
                'cover'        => 'https://i.ibb.co.com/XZmH47nT/Cover-Permen-Iminpas-No-1-Tahun-2024.jpg',
                'file'         => '/pdf/Permen Iminpas No. 1 Tahun 2024.pdf',
                'type'         => 'pdf',
            ],
            [
                'title'        => 'PP No. 94 Tahun 2021 tentang Disiplin PNS',
                'category'     => 'peraturan',
                'sub_category' => 'pp',
                'cover'        => 'https://i.ibb.co.com/zTM85KyH/Cover-PP-No-94-Tahun-2021-tentang-Disiplin-PNS.jpg',
                'file'         => '/pdf/PP No. 94 Tahun 2021 tentang Disiplin PNS.pdf',
                'type'         => 'pdf',
            ],
            [
                'title'        => 'Disiplin Berat ASN: Perspektif Hukum',
                'category'     => 'peraturan',
                'sub_category' => 'permen',
                'cover'        => 'https://i.ibb.co.com/tTZ0fRjh/Cover-Sanski.jpg',
                'file'         => '/pdf/Disiplin Berat ASN: Perspektif Hukum.pdf',
                'type'         => 'pdf',
            ],
            [
                'title'        => 'UU ASN No.20 Tahun 2023 Tentang ASN',
                'category'     => 'peraturan',
                'sub_category' => 'uu-perppu',
                'cover'        => 'https://i.ibb.co.com/1Gk7b2nc/Cover-UU-ASN-No-20-Tahun-2023-Tentang-ASN.jpg',
                'file'         => '/pdf/UU ASN No.20 Tahun 2023 Tentang ASN.pdf',
                'type'         => 'pdf',
            ],
        ];

        $videos = [
            ['video_url' => 'https://www.youtube.com/embed/bFmGdzeEV0s', 'title' => 'Video Edukasi 1'],
            ['video_url' => 'https://www.youtube.com/embed/6YOkAL8BoUU', 'title' => 'Video Edukasi 2'],
            ['video_url' => 'https://www.youtube.com/embed/aVgihMIhi6c', 'title' => 'Video Edukasi 3'],
            ['video_url' => 'https://www.youtube.com/embed/nP94bjzVUVY', 'title' => 'Video Edukasi 4'],
            ['video_url' => 'https://www.youtube.com/embed/OkgbKHkErjs', 'title' => 'Video Edukasi 5'],
            ['video_url' => 'https://www.youtube.com/embed/wygiJONYlQA', 'title' => 'Video Edukasi 6'],
            ['video_url' => 'https://www.youtube.com/embed/XyBxnqWxWns', 'title' => 'Video Edukasi 7'],
        ];

        foreach ($peraturan as $doc) {
            if (in_array($doc['title'], $existingTitles)) {
                continue;
            }
            DB::table('documents')->insert([
                'user_id'      => $adminId,
                'title'        => $doc['title'],
                'category'     => $doc['category'],
                'sub_category' => $doc['sub_category'],
                'cover'        => $doc['cover'],
                'file'         => $doc['file'],
                'description'  => null,
                'type'         => $doc['type'],
                'video_url'    => null,
                'status'       => 'published',
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);
        }

        foreach ($videos as $vid) {
            if (in_array($vid['title'], $existingTitles)) {
                continue;
            }
            DB::table('documents')->insert([
                'user_id'      => $adminId,
                'title'        => $vid['title'],
                'category'     => 'edukasi',
                'sub_category' => 'video-training',
                'cover'        => null,
                'file'         => null,
                'description'  => null,
                'type'         => 'video',
                'video_url'    => $vid['video_url'],
                'status'       => 'published',
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);
        }
    }
}
