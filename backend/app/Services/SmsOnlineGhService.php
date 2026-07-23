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
            $response = Http::acceptJson()->get('https://api.smsonlinegh.com/v4/reports/balance', [
                'key' => $apiKey,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $code = $data['handshake']['code'] ?? null;

                if ($code !== null && (int) $code !== 1000) {
                    $desc = $data['handshake']['description'] ?? 'API authentication error';
                    return [
                        'success' => false,
                        'message' => "SMSOnlineGH Error (Code {$code}): {$desc}",
                    ];
                }

                // Extract credit from all possible SMSOnlineGH API response structures
                $credit = null;
                if (isset($data['data']['credit'])) {
                    $credit = $data['data']['credit'];
                } elseif (isset($data['data']['balance'])) {
                    $credit = $data['data']['balance'];
                } elseif (isset($data['credit'])) {
                    $credit = $data['credit'];
                } elseif (isset($data['balance'])) {
                    $credit = $data['balance'];
                } elseif (isset($data['data']) && (is_numeric($data['data']) || is_string($data['data']))) {
                    $credit = $data['data'];
                } elseif (isset($data['data'][0]['credit'])) {
                    $credit = $data['data'][0]['credit'];
                }

                if ($credit !== null) {
                    return [
                        'success' => true,
                        'credit' => $credit,
                        'message' => "Current SMS Credit Balance: {$credit} Credits",
                    ];
                }

                $jsonDetails = json_encode($data);
                return [
                    'success' => true,
                    'raw' => $jsonDetails,
                    'message' => "API Connection Successful! Response: {$jsonDetails}",
                ];
            }

            return [
                'success' => false,
                'message' => "Balance check failed: Status {$response->status()} - {$response->body()}",
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => "Exception checking balance: {$e->getMessage()}",
            ];
        }
    }

    /**
     * Send SMS using SMSOnlineGH API v4.
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
     * Dispatch HTTP request to SMSOnlineGH API v4.
     */
    protected function sendSmsWithSender(string $formattedPhone, string $message, string $apiKey, string $senderId): bool
    {
        try {
            // SMSOnlineGH accepts form parameters or query params
            $response = Http::acceptJson()->asForm()->post('https://api.smsonlinegh.com/v4/message/send', [
                'key' => $apiKey,
                'to' => $formattedPhone,
                'msg' => $message,
                'sender' => $senderId,
            ]);

            if (! $response->successful()) {
                // Try GET request as fallback
                $response = Http::acceptJson()->get('https://api.smsonlinegh.com/v4/message/send', [
                    'key' => $apiKey,
                    'to' => $formattedPhone,
                    'msg' => $message,
                    'sender' => $senderId,
                ]);
            }

            if ($response->successful()) {
                $data = $response->json();
                $code = $data['handshake']['code'] ?? null;

                if ($code !== null && (int) $code !== 1000) {
                    $description = $data['handshake']['description'] ?? 'SMS dispatch error';
                    Log::error("SMSOnlineGH API Handshake Error (Code {$code}): {$description} | Sender ID: {$senderId} | To: {$formattedPhone}");

                    // If custom Sender ID failed (Code 1003 = Sender ID Not Approved), retry with default 'ELIS FOODS'
                    if ((int) $code === 1003 && $senderId !== 'ELIS FOODS') {
                        Log::info("SMSOnlineGH Retrying dispatch with default Sender ID 'ELIS FOODS'...");
                        return $this->sendSmsWithSender($formattedPhone, $message, $apiKey, 'ELIS FOODS');
                    }

                    return false;
                }

                Log::info("SMSOnlineGH Sent successfully to {$formattedPhone}: {$response->body()}");
                $this->incrementDailySentCount();
                return true;
            }

            Log::error("SMSOnlineGH HTTP Failed for {$formattedPhone}: Status {$response->status()} - {$response->body()}");
            return false;
        } catch (\Throwable $e) {
            Log::error("SMSOnlineGH Exception for {$formattedPhone}: {$e->getMessage()}");
            return false;
        }
    }
}
