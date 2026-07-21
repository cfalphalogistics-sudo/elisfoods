<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function show(string $code): JsonResponse
    {
        $coupon = Coupon::where('code', strtoupper($code))
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function ($query) {
                $query->whereNull('usage_limit')->orWhereColumn('usage_count', '<', 'usage_limit');
            })
            ->first();

        if (! $coupon) {
            return response()->json(['valid' => false, 'message' => 'Coupon not found or expired.'], 404);
        }

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'min_order' => $coupon->min_order,
        ]);
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string', 'subtotal' => 'nullable|numeric']);

        return $this->show(strtoupper($request->code));
    }
}
