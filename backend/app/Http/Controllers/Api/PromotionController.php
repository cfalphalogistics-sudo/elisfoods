<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;

class PromotionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Promotion::where('is_active', true)->get(['slot', 'eyebrow', 'headline', 'body', 'image', 'primary_label', 'primary_url', 'secondary_label', 'secondary_url'])
        );
    }
}
