<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;

class StoreSettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = [
            'phone' => StoreSetting::get('phone', ''),
            'whatsapp' => StoreSetting::get('whatsapp', ''),
            'email' => StoreSetting::get('email', ''),
            'social' => [
                'facebook' => StoreSetting::get('social_facebook', ''),
                'instagram' => StoreSetting::get('social_instagram', ''),
                'tiktok' => StoreSetting::get('social_tiktok', ''),
            ],
            'hours' => [
                'open' => StoreSetting::get('hours_open', '10:00'),
                'close' => StoreSetting::get('hours_close', '21:00'),
            ],
            'packagingFee' => (int) StoreSetting::get('packaging_fee', 0),
            'isOpen' => filter_var(StoreSetting::get('is_open', 'true'), FILTER_VALIDATE_BOOLEAN),
            'paymentMethods' => StoreSetting::paymentMethods(),
        ];

        return response()->json($settings);
    }
}
