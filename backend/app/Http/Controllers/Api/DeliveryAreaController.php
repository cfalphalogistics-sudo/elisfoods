<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryArea;
use Illuminate\Http\JsonResponse;

class DeliveryAreaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            DeliveryArea::where('is_active', true)->orderBy('name')->get()
        );
    }
}
