<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\StoreSetting;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class DashboardStatsWidget extends BaseWidget
{
    protected ?string $heading = "Today's overview";

    protected int | string | array $columnSpan = 'full';

    protected function getStats(): array
    {
        $today = now()->startOfDay();

        $todayOrders = Order::whereDate('created_at', $today)->count();
        $todayRevenue = Order::whereDate('created_at', $today)->sum('total');
        $pendingOrders = Order::whereIn('status', ['placed', 'confirmed', 'preparing'])->count();

        $lowStock = Product::where('available', true)
            ->whereHas('variations', function ($query) {
                $query->where('stock_quantity', '<=', 5);
            })
            ->count();

        $isOpen = filter_var(StoreSetting::get('is_open', 'true'), FILTER_VALIDATE_BOOLEAN);

        return [
            Stat::make('Orders today', $todayOrders)
                ->icon(Heroicon::OutlinedShoppingCart)
                ->description('New orders since midnight')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('primary')
                ->chart([3, 7, 5, 12, 8, 15, max(1, $todayOrders)]),
            Stat::make('Revenue today', 'GH₵ ' . number_format($todayRevenue / 100, 2))
                ->icon(Heroicon::OutlinedBanknotes)
                ->description('Total revenue earned today')
                ->descriptionIcon('heroicon-m-currency-dollar')
                ->color('success')
                ->chart([150, 300, 220, 480, 390, 620, max(10, (int)($todayRevenue / 100))]),
            Stat::make('Pending orders', $pendingOrders)
                ->icon(Heroicon::OutlinedClock)
                ->description('Awaiting kitchen fulfilment')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning')
                ->chart([2, 4, 3, 6, 5, max(1, $pendingOrders)]),
            Stat::make('Low stock items', $lowStock)
                ->icon(Heroicon::OutlinedExclamationTriangle)
                ->description('Products with 5 or fewer in stock')
                ->color($lowStock > 0 ? 'danger' : 'success'),
            Stat::make('Store status', $isOpen ? 'Open for Orders' : 'Store Closed')
                ->icon($isOpen ? Heroicon::OutlinedCheckCircle : Heroicon::OutlinedXCircle)
                ->description($isOpen ? 'Customers can order online' : 'Ordering is currently paused')
                ->color($isOpen ? 'success' : 'danger'),
        ];
    }
}
