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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('category'); // peraturan, ebook, edukasi
            $table->string('sub_category'); // uud, tap-mpr, uu-perppu, pp, perpres, permen, etc
            $table->string('cover')->nullable(); // URL cover image
            $table->string('file')->nullable(); // URL file or path
            $table->text('description')->nullable();
            $table->enum('type', ['pdf', 'video', 'ebook', 'other'])->default('pdf');
            $table->string('video_url')->nullable(); // untuk video dari youtube
            $table->enum('status', ['draft', 'published', 'rejected'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
