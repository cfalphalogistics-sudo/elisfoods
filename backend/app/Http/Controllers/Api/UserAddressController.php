<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->latest()->get();

        return response()->json([
            'success' => true,
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'address' => 'required|string',
            'ghana_post_gps' => 'nullable|string|max:50',
            'landmark' => 'nullable|string|max:255',
            'delivery_instructions' => 'nullable|string',
            'is_default' => 'nullable|boolean',
        ]);

        $user = $request->user();

        if (! empty($validated['is_default'])) {
            $user->addresses()->update(['is_default' => false]);
        }

        // If this is the user's first address, set as default
        if ($user->addresses()->count() === 0) {
            $validated['is_default'] = true;
        }

        $address = $user->addresses()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Address saved successfully.',
            'address' => $address,
            'addresses' => $user->addresses()->orderBy('is_default', 'desc')->latest()->get(),
        ]);
    }

    public function update(Request $request, UserAddress $address): JsonResponse
    {
        $user = $request->user();

        if ($address->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'address' => 'required|string',
            'ghana_post_gps' => 'nullable|string|max:50',
            'landmark' => 'nullable|string|max:255',
            'delivery_instructions' => 'nullable|string',
            'is_default' => 'nullable|boolean',
        ]);

        if (! empty($validated['is_default'])) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Address updated successfully.',
            'address' => $address,
            'addresses' => $user->addresses()->orderBy('is_default', 'desc')->latest()->get(),
        ]);
    }

    public function destroy(Request $request, UserAddress $address): JsonResponse
    {
        $user = $request->user();

        if ($address->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Address deleted successfully.',
            'addresses' => $user->addresses()->orderBy('is_default', 'desc')->latest()->get(),
        ]);
    }
}
