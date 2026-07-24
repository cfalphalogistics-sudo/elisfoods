<?php

namespace App\Services;

use App\Models\StoreSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
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
     * Get decrypted API Key from StoreSetting or fallback to env.
     */
    public static function getApiKey(): ?string
    {
        $rawKey = StoreSetting::get('sms_api_key');

        if (! empty($rawKey)) {
            try {
                return Crypt::decryptString($rawKey);
            } catch (\Throwable) {
                // Return raw key if not encrypted
                return $rawKey;
            }
        }

        return config('services.smsonlinegh.key', env('SMSONLINEGH_API_KEY'));
    }

    /**
     * Get Sender ID from StoreSetting or fallback to env.
     */
    public static function getSenderId(): string
    {
        $sender = StoreSetting::get('sms_sender_id');

        return ! empty($sender) ? $sender : config('services.smsonlinegh.sender', env('SMSONLINEGH_SENDER_ID', 'ELIS FOODS'));
    }

    /**
     * Get Daily SMS Limit from StoreSetting (default 100).
     */
    public static function getDailyLimit(): int
    {
        return (int) StoreSetting::get('sms_daily_limit', 100);
    }

    /**
     * Get count of SMS sent today.
     */
    public function getDailySentCount(): int
    {
        $key = 'sms_daily_count_' . date('Y-m-d');
        return (int) Cache::get($key, 0);
    }

    /**
     * Check if daily limit of sent SMS has been reached.
     */
    public function isDailyLimitReached(): bool
    {
        $limit = self::getDailyLimit();
        if ($limit <= 0) {
            return false; // Unlimited if set to 0
        }
        return $this->getDailySentCount() >= $limit;
    }

    /**
     * Increment daily SMS count.
     */
    protected function incrementDailySentCount(): void
    {
        $key = 'sms_daily_count_' . date('Y-m-d');
        if (Cache::has($key)) {
            Cache::increment($key);
        } else {
            Cache::put($key, 1, now()->endOfDay());
        }
    }

    /**
     * Check SMSOnlineGH balance live from API.
     *
     * Uses the v5 API (see https://dev.smsonlinegh.com/docs/v5/http/url/reporting/balance.html).
     * The account was previously integrated against v4 endpoints
     * (api.smsonlinegh.com/v4/...), which no longer exist — every v4 path,
     * including nonsense ones, now returns HTTP 200 with an empty body. That
     * silently broke both balance checks and SMS dispatch.
     */
    public function getBalance(): array
    {
        $apiKey = self::getApiKey();

        if (empty($apiKey)) {
            return [
                'success' => false,
                'message' => 'No SMSOnlineGH API key is configured. Please enter your API key first.',
            ];
        }

        try {
            $response = Http::acceptJson()->get('https://api.smsonlinegh.com/v5/report/balance', [
                'key' => $apiKey,
            ]);

            $status = $response->status();
            $data = $response->json();

            if (! is_array($data)) {
                return [
                    'success' => false,
                    'message' => "SMSOnlineGH returned HTTP {$status} with an unreadable body: " . trim($response->body()) ?: '(empty)',
                ];
            }

            $handshakeId = $data['handshake']['id'] ?? null;
            $handshakeLabel = $data['handshake']['label'] ?? 'Unknown error';

            if ($handshakeId !== 0) {
                return [
                    'success' => false,
                    'message' => "SMSOnlineGH Error ({$handshakeLabel}, id {$handshakeId})",
                ];
            }

            $balance = $data['data']['balance'] ?? null;
            $model = $data['data']['model'] ?? 'quantity';

            return [
                'success' => true,
                'credit' => $balance,
                'message' => "Current SMS Credit Balance: {$balance} ({$model})",
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => "Exception checking balance: {$e->getMessage()}",
            ];
        }
    }

    /**
     * Send SMS using the SMSOnlineGH v5 API.
     */
    public function sendSms(string $phone, string $message): bool
    {
        if ($this->isDailyLimitReached()) {
            Log::warning("SMSOnlineGH Aborted: Daily safety limit of {$this->getDailyLimit()} SMS reached.");
            return false;
        }

        $formattedPhone = self::formatPhone($phone);
        $apiKey = self::getApiKey();
        $senderId = self::getSenderId();

        if (empty($apiKey)) {
            Log::info("SMSOnlineGH (Log Fallback - No API Key Set) - To: {$formattedPhone} | Message: {$message}");
            $this->incrementDailySentCount();
            return true;
        }

        return $this->sendSmsWithSender($formattedPhone, $message, $apiKey, $senderId);
    }

    /**
     * Dispatch HTTP request to the SMSOnlineGH v5 API.
     *
     * See https://dev.smsonlinegh.com/docs/v5/http/url/sms/non_psnd.html.
     * `type` is required by the API; 0 is their documented example value for
     * a standard GSM text message.
     */
    protected function sendSmsWithSender(string $formattedPhone, string $message, string $apiKey, string $senderId): bool
    {
        try {
            $response = Http::acceptJson()->asForm()->post('https://api.smsonlinegh.com/v5/message/sms/send', [
                'key' => $apiKey,
                'text' => $message,
                'type' => 0,
                'sender' => $senderId,
                'to' => $formattedPhone,
            ]);

            $data = $response->json();

            if (! is_array($data)) {
                Log::error("SMSOnlineGH returned HTTP {$response->status()} with an unreadable body — treating as failed dispatch | Sender ID: {$senderId} | To: {$formattedPhone} | Raw body: " . $response->body());
                return false;
            }

            $handshakeId = $data['handshake']['id'] ?? null;
            $handshakeLabel = $data['handshake']['label'] ?? 'Unknown error';

            if ($handshakeId !== 0) {
                Log::error("SMSOnlineGH API Error ({$handshakeLabel}, id {$handshakeId}) | Sender ID: {$senderId} | To: {$formattedPhone}");
                return false;
            }

            Log::info("SMSOnlineGH Sent successfully to {$formattedPhone}: {$response->body()}");
            $this->incrementDailySentCount();
            return true;
        } catch (\Throwable $e) {
            Log::error("SMSOnlineGH Exception for {$formattedPhone}: {$e->getMessage()}");
            return false;
        }
    }
}
