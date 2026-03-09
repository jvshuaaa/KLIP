<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Auth\Notifications\ResetPassword;
use App\Models\User;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_request_password_reset_link()
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->postJson('/api/forgot-password', ['email' => $user->email]);

        $response->assertStatus(200)->assertJson(['status' => trans(ResetPassword::RESET_LINK_SENT)]);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    /** @test */
    public function can_reset_password_with_valid_token()
    {
        Notification::fake();

        $user = User::factory()->create();

        // send link and capture token from notification
        $this->postJson('/api/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification, $channels) use ($user, &$token) {
            $token = $notification->token;
            return true;
        });

        $newPassword = 'newpassword123';

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ]);

        $response->assertStatus(200)->assertJson(['status' => trans(ResetPassword::PASSWORD_RESET)]);

        $this->assertTrue(
            \Hash::check($newPassword, $user->fresh()->password)
        );
    }
}
