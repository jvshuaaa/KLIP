<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('surveys', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->nullable();
            $table->string('nip')->nullable();
            $table->tinyInteger('kemudahan_penggunaan')->unsigned();
            $table->tinyInteger('kemudahan_informasi')->unsigned();
            $table->tinyInteger('tampilan_website')->unsigned();
            $table->tinyInteger('kenyamanan_penggunaan')->unsigned();
            $table->tinyInteger('pemahaman_informasi')->unsigned();
            $table->tinyInteger('kesesuaian_kebutuhan')->unsigned();
            $table->tinyInteger('kepuasan_informasi')->unsigned();
            $table->tinyInteger('tingkat_kepuasan')->unsigned();
            $table->tinyInteger('keinginan_menggunakan')->unsigned();
            $table->tinyInteger('kemungkinan_rekomendasi')->unsigned();
            $table->text('saran_harapan')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surveys');
    }
};
