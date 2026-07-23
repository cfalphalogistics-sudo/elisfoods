<?php

namespace App\Services;

use App\Models\StoreSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsOnlineGhService
{
    /**
     * Normalize Ghana phone number to format 233XXXXXXXXX.
     */
    public static function formatPhone(string $phone): string
    {
        $cleaned = preg_replace('/\D+/', '', $phone);

        if (str_starts_with($cleaned, '0')) {
            return '233' . substr($cleaned, 1);
        }

        if (str_starts_with($cleaned, '233')) {
            return $cleaned;
        }

        return '233' . $cleaned;
    }

    /**
     * Send SMS using SMSOnlineGH API v4.
     */
    public function sendSms(string $phone, string $message): bool
    {
        $formattedPhone = self::formatPhone($phone);

        // Check StoreSetting first (Admin UI), fallback to .env config
        $apiKey = StoreSetting::get('sms_api_key') ?: config('services.smsonlinegh.key', env('SMSONLINEGH_API_KEY'));
        $senderId = StoreSetting::get('sms_sender_id') ?: config('services.smsonlinegh.sender', env('SMSONLINEGH_SENDER_ID', 'ELIS FOODS'));

        if (empty($apiKey)) {
            Log::info("SMSOnlineGH (Log Fallback - No API Key Set) - To: {$formattedPhone} | Message: {$message}");
            return true;
        }

        try {
            $response = Http::acceptJson()->post('https://api.smsonlinegh.com/v4/message/send', [
                'key' => $apiKey,
                'to' => $formattedPhone,
                'msg' => $message,
                'sender' => $senderId,
            ]);

            if ($response->successful()) {
                Log::info("SMSOnlineGH Sent to {$formattedPhone}: {$response->body()}");
                return true;
            }

            Log::error("SMSOnlineGH Failed for {$formattedPhone}: Status {$response->status()} - {$response->body()}");
            return false;
        } catch (\Throwable $e) {
            Log::error("SMSOnlineGH Exception for {$formattedPhone}: {$e->getMessage()}");
            return false;
        }
    }
}
