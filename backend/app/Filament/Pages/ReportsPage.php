<?php

namespace App\Filament\Pages;

use App\Models\DeliveryArea;
use App\Models\Order;
use App\Models\OrderItem;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Schemas\Components\Html;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;
use UnitEnum;

class ReportsPage extends Page
{
    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedChartPie;

    protected static ?string $navigationLabel = 'Reports';

    protected static string | UnitEnum | null $navigationGroup = 'Management';

    protected static ?int $navigationSort = 1;

    protected static ?string $slug = 'reports';

    protected string $view = 'filament-panels::pages.page';

    public function getTitle(): string | Htmlable
    {
        return 'Reports';
    }

    public function content(Schema $schema): Schema
    {
        $orderStatuses = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $totalRevenue = Order::sum('total');
        $totalOrders = Order::count();
        $averageOrderValue = $totalOrders ? $totalRevenue / $totalOrders : 0;

        $topProducts = OrderItem::selectRaw('name, sum(quantity) as total_quantity')
            ->groupBy('name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get()
            ->map(fn ($item) => "<li>{$item->name} ({$item->total_quantity})</li>")
            ->join('');

        $deliveryAreas = DeliveryArea::withCount('orders')
            ->orderByDesc('orders_count')
            ->get()
            ->map(fn ($area) => "<li>{$area->name}: {$area->orders_count}</li>")
            ->join('');

        $stat = function (string $label, string $value): string {
            return <<<HTML
                <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{$label}</div>
                    <div class="text-2xl font-semibold tracking-tight">{$value}</div>
                </div>
            HTML;
        };

        return $schema
            ->components([
                Section::make('Sales summary')
                    ->columns(3)
                    ->schema([
                        Html::make($stat('Total revenue', 'GH₵ ' . number_format($totalRevenue / 100, 2))),
                        Html::make($stat('Total orders', (string) $totalOrders)),
                        Html::make($stat('Average order value', 'GH₵ ' . number_format($averageOrderValue / 100, 2))),
                    ]),

                Section::make('Orders by status')
                    ->columns(3)
                    ->schema(
                        collect($orderStatuses)
                            ->map(fn ($count, $status) => Html::make($stat(ucfirst($status), (string) $count)))
                            ->values()
                            ->all()
                    ),

                Section::make('Top products')
                    ->schema([
                        Html::make($topProducts ? "<ul class=\"list-disc pl-5 space-y-1\">{$topProducts}</ul>" : '<p class="text-gray-500">No orders yet</p>'),
                    ]),

                Section::make('Orders by delivery area')
                    ->schema([
                        Html::make($deliveryAreas ? "<ul class=\"list-disc pl-5 space-y-1\">{$deliveryAreas}</ul>" : '<p class="text-gray-500">No delivery areas yet</p>'),
                    ]),
            ]);
    }
}
