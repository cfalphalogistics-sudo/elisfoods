<?php

use App\Http\Controllers\Api\AddOnController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\DeliveryAreaController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\StoreSettingController;
use App\Http\Controllers\Api\UserAddressController;
use App\Http\Controllers\Api\UserFavouriteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Auth routes
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);

// Public Catalog & Store routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/add-ons', [AddOnController::class, 'index']);
Route::get('/delivery-areas', [DeliveryAreaController::class, 'index']);
Route::get('/store-settings', [StoreSettingController::class, 'index']);
Route::get('/promotions', [PromotionController::class, 'index']);
Route::get('/coupons/{code}', [CouponController::class, 'show']);
Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{reference}', [OrderController::class, 'show']);

// Authenticated User routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/user/addresses', [UserAddressController::class, 'index']);
    Route::post('/user/addresses', [UserAddressController::class, 'store']);
    Route::put('/user/addresses/{address}', [UserAddressController::class, 'update']);
    Route::delete('/user/addresses/{address}', [UserAddressController::class, 'destroy']);

    Route::get('/user/favourites', [UserFavouriteController::class, 'index']);
    Route::post('/user/favourites/{productId}/toggle', [UserFavouriteController::class, 'toggle']);
    Route::delete('/user/favourites/{productId}', [UserFavouriteController::class, 'destroy']);

    Route::get('/user/orders', [OrderController::class, 'userOrders']);
});
