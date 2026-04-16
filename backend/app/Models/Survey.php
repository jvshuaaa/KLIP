<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Survey extends Model
{
    protected $fillable = [
        'nama',
        'nip',
        'kemudahan_penggunaan',
        'kemudahan_informasi',
        'tampilan_website',
        'kenyamanan_penggunaan',
        'pemahaman_informasi',
        'kesesuaian_kebutuhan',
        'kepuasan_informasi',
        'tingkat_kepuasan',
        'keinginan_menggunakan',
        'kemungkinan_rekomendasi',
        'saran_harapan',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'kemudahan_penggunaan' => 'integer',
        'kemudahan_informasi' => 'integer',
        'tampilan_website' => 'integer',
        'kenyamanan_penggunaan' => 'integer',
        'pemahaman_informasi' => 'integer',
        'kesesuaian_kebutuhan' => 'integer',
        'kepuasan_informasi' => 'integer',
        'tingkat_kepuasan' => 'integer',
        'keinginan_menggunakan' => 'integer',
        'kemungkinan_rekomendasi' => 'integer',
    ];
}
