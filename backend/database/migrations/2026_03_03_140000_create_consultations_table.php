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
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('q1')->comment('Apa yang membuat Anda memutuskan untuk mengikuti konseling?');
            $table->text('q2')->comment('Rangkaian aktivitas dalam dua minggu terakhir');
            $table->text('q3')->comment('Keluhan/permasalahan yang ingin dikonsultasikan');
            $table->text('q4')->comment('Apa yang akan terjadi jika tidak segera ditangani?');
            $table->text('q5')->comment('Bentuk dukungan dari lingkungan sekitar');
            $table->text('q6')->comment('Tantangan yang membuat melanggar prinsip kepatuhan');
            $table->text('q7')->comment('Harapan setelah melakukan sesi konseling');
            $table->enum('status', ['pending', 'reviewed', 'completed'])->default('pending');
            $table->text('notes')->nullable()->comment('Catatan dari psikolog');
            $table->foreignId('psikolog_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
