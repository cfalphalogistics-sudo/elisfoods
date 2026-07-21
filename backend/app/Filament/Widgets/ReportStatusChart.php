<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;

class ReportStatusChart extends ChartWidget
{
    protected ?string $heading = 'Order Status Distribution';

    protected int | string | array $columnSpan = 1;

    protected function getData(): array
    {
        $statuses = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $labels = array_map('ucfirst', array_keys($statuses));
        $counts = array_values($statuses);

        return [
            'datasets' => [
                [
                    'label' => 'Orders',
                    'data' => $counts,
                    'backgroundColor' => [
                        '#6b7280', // placed (gray)
                        '#0284c7', // confirmed (sky)
                        '#f59e0b', // preparing (amber)
                        '#3b82f6', // out-for-delivery (blue)
                        '#10b981', // delivered (emerald)
                        '#ef4444', // cancelled (rose)
                    ],
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
