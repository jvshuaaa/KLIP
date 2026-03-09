<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ChatMessage $chatMessage) {}

    /**
     * Broadcast on the private channel for this consultation room.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('consultation.' . $this->chatMessage->consultation_id),
        ];
    }

    /**
     * Custom event name listened to on the frontend.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Payload sent to the client.
     */
    public function broadcastWith(): array
    {
        return [
            'id'              => $this->chatMessage->id,
            'consultation_id' => $this->chatMessage->consultation_id,
            'user_id'         => $this->chatMessage->user_id,
            'message'         => $this->chatMessage->message,
            'sender'          => [
                'id'               => $this->chatMessage->sender->id,
                'name'             => $this->chatMessage->sender->name,
                'status_pengguna'  => $this->chatMessage->sender->status_pengguna,
            ],
            'created_at' => $this->chatMessage->created_at->toISOString(),
        ];
    }
}
