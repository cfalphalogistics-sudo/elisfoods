<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AddOn;
use Illuminate\Http\JsonResponse;

class AddOnController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            AddOn::where('is_active', true)->orderBy('category')->orderBy('name')->get()
        );
    }
}
