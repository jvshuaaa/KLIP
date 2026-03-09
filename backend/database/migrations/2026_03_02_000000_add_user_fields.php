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
        Schema::table('users', function (Blueprint $table) {
            $table->string('nip')->nullable()->unique();
            $table->string('no_wa')->nullable();
            $table->string('daftar_sebagai')->nullable();
            $table->string('status_pengguna')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop unique constraint first (important for SQLite)
            $table->dropUnique('users_nip_unique');
            $table->dropColumn(['nip', 'no_wa', 'daftar_sebagai', 'status_pengguna']);
        });
    }
};
