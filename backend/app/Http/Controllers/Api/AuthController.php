<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Otp;
use App\Models\User;
use App\Services\SmsOnlineGhService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function __construct(protected SmsOnlineGhService $smsService)
    {
    }

    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $ip = $request->ip();
        $formattedPhone = SmsOnlineGhService::formatPhone($request->input('phone'));

        // 1. IP-based Rate Limiting: Max 3 requests per 10 minutes per IP
        $ipKey = 'send-otp-ip:' . $ip;
        if (RateLimiter::tooManyAttempts($ipKey, 3)) {
            $seconds = RateLimiter::availableIn($ipKey);
            return response()->json([
                'success' => false,
                'message' => "Too many verification requests from your device. Please try again in " . ceil($seconds / 60) . " minute(s).",
            ], 429);
        }

        // 2. Phone-based Rate Limiting: Max 5 requests per hour per Phone
        $phoneKey = 'send-otp-phone:' . $formattedPhone;
        if (RateLimiter::tooManyAttempts($phoneKey, 5)) {
            $seconds = RateLimiter::availableIn($phoneKey);
            return response()->json([
                'success' => false,
                'message' => "Too many verification requests for this phone number. Please try again in " . ceil($seconds / 60) . " minute(s).",
            ], 429);
        }

        // 3. Short Cooldown: 45 seconds between requests for the same phone
        $recentOtp = Otp::where('phone', $formattedPhone)
            ->where('created_at', '>', now()->subSeconds(45))
            ->first();

        if ($recentOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait 45 seconds before requesting another verification code.',
            ], 429);
        }

        // 4. Global Daily Circuit Breaker: Check if system daily SMS limit reached
        if ($this->smsService->isDailyLimitReached()) {
            return response()->json([
                'success' => false,
                'message' => 'System daily SMS dispatch limit reached. Please try logging in later or contact store support.',
            ], 429);
        }

        // Increment rate limit counters
        RateLimiter::hit($ipKey, 600); // 10 minutes
        RateLimiter::hit($phoneKey, 3600); // 1 hour

        // Generate 6-digit numeric OTP
        $code = sprintf('%06d', random_int(100000, 999999));

        Otp::create([
            'phone' => $formattedPhone,
            'otp' => $code,
            'expires_at' => now()->addMinutes(10),
            'verified' => false,
        ]);

        $message = "Your Eli's Food verification code is {$code}. It is valid for 10 minutes. Do not share this code.";
        $this->smsService->sendSms($formattedPhone, $message);

        $apiKey = SmsOnlineGhService::getApiKey();

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent successfully.',
            'phone' => $formattedPhone,
            // Include OTP in debug mode or when API key is missing
            'debug_code' => config('app.debug') || empty($apiKey) ? $code : null,
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string',
        ]);

        $formattedPhone = SmsOnlineGhService::formatPhone($request->input('phone'));
        $otpCode = trim($request->input('otp'));

        $otpRecord = Otp::where('phone', $formattedPhone)
            ->where('otp', $otpCode)
            ->where('verified', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otpRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code. Please request a new one.',
            ], 422);
        }

        $otpRecord->update(['verified' => true]);

        // Clear phone rate limiter on successful verification
        RateLimiter::clear('send-otp-phone:' . $formattedPhone);

        // Find existing user by phone or create new customer
        $user = User::where('phone', $formattedPhone)->first();

        if (! $user) {
            $shortPhone = substr($formattedPhone, -4);
            $user = User::create([
                'name' => 'Customer ' . $shortPhone,
                'phone' => $formattedPhone,
                'phone_verified_at' => now(),
            ]);
        } else if (! $user->phone_verified_at) {
            $user->update(['phone_verified_at' => now()]);
        }

        // Link past orders with matching phone number to this user ID if unassigned
        \App\Models\Order::where('phone', $formattedPhone)
            ->whereNull('user_id')
            ->update(['user_id' => $user->id]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user->load(['addresses', 'favourites.product']),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['addresses', 'favourites.product']);

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $user->load(['addresses', 'favourites.product']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
