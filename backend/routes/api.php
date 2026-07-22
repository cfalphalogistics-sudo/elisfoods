<?php

use App\Http\Controllers\Api\AddOnController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\DeliveryAreaController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\StoreSettingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

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
