<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        // MySQL/MariaDB need enum alteration so new statuses can be saved.
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE consultations MODIFY COLUMN status ENUM('pending','reviewed','in_progress','completed','needs_referral') NOT NULL DEFAULT 'pending'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE consultations MODIFY COLUMN status ENUM('pending','reviewed','completed') NOT NULL DEFAULT 'pending'");
        }
    }
};
