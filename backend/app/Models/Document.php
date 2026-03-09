<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'category',
        'sub_category',
        'cover',
        'file',
        'description',
        'type',
        'video_url',
        'status',
        'rejection_reason',
    ];

    // Relationship: document belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
