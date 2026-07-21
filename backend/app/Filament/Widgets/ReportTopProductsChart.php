<?php

namespace App\Filament\Widgets;

use App\Models\OrderItem;
use Filament\Widgets\ChartWidget;

class ReportTopProductsChart extends ChartWidget
{
    protected ?string $heading = 'Top Selling Dishes (Units Sold)';

    protected int | string | array $columnSpan = 'full';

    protected function getData(): array
    {
        $topProducts = OrderItem::selectRaw('name, sum(quantity) as total_quantity')
            ->groupBy('name')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Units Sold',
                    'data' => $topProducts->pluck('total_quantity')->all(),
                    'backgroundColor' => 'rgba(249, 115, 22, 0.85)',
                    'borderColor' => '#ea580c',
                ],
            ],
            'labels' => $topProducts->pluck('name')->all(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
