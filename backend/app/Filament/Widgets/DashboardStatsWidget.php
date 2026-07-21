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
                ->description('New orders since midnight'),
            Stat::make('Revenue today', 'GH₵ ' . number_format($todayRevenue / 100, 2))
                ->icon(Heroicon::OutlinedBanknotes)
                ->description('Total paid/placed orders'),
            Stat::make('Pending orders', $pendingOrders)
                ->icon(Heroicon::OutlinedClock)
                ->description('Awaiting fulfilment')
                ->color('warning'),
            Stat::make('Low stock items', $lowStock)
                ->icon(Heroicon::OutlinedExclamationTriangle)
                ->description('Products with 5 or fewer in stock')
                ->color($lowStock > 0 ? 'danger' : 'success'),
            Stat::make('Store status', $isOpen ? 'Open' : 'Closed')
                ->icon($isOpen ? Heroicon::OutlinedCheckCircle : Heroicon::OutlinedXCircle)
                ->description($isOpen ? 'Accepting orders' : 'Not accepting orders')
                ->color($isOpen ? 'success' : 'danger'),
        ];
    }
}
