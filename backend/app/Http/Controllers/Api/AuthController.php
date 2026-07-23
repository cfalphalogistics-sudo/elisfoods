<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Otp;
use App\Models\User;
use App\Services\SmsOnlineGhService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $formattedPhone = SmsOnlineGhService::formatPhone($request->input('phone'));

        // Check rate limit: 1 request per 45 seconds
        $recentOtp = Otp::where('phone', $formattedPhone)
            ->where('created_at', '>', now()->subSeconds(45))
            ->first();

        if ($recentOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait 45 seconds before requesting another code.',
            ], 429);
        }

        // Generate 6-digit numeric OTP
        $code = sprintf('%06d', random_int(100000, 999999));

        Otp::create([
            'phone' => $formattedPhone,
            'otp' => $code,
            'expires_at' => now()->addMinutes(10),
            'verified' => false,
        ]);

        $message = "Your Eli's Food verification code is {$code}. It is valid for 10 minutes. Do not share this code.";
        $sent = $this->smsService->sendSms($formattedPhone, $message);

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent successfully.',
            'phone' => $formattedPhone,
            // Include OTP in debug mode / log fallback for easy testing
            'debug_code' => config('app.debug') || empty(env('SMSONLINEGH_API_KEY')) ? $code : null,
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
