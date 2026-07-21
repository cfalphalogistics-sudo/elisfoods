<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class ReportRevenueChart extends ChartWidget
{
    protected ?string $heading = 'Revenue Trend (Last 30 Days)';

    protected int | string | array $columnSpan = 'full';

    protected function getData(): array
    {
        $data = Trend::model(Order::class)
            ->between(
                start: now()->subDays(30),
                end: now(),
            )
            ->perDay()
            ->sum('total');

        return [
            'datasets' => [
                [
                    'label' => 'Daily Revenue (GH₵)',
                    'data' => $data->map(fn (TrendValue $value) => $value->aggregate / 100),
                    'borderColor' => '#10b981',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.15)',
                    'fill' => 'start',
                    'tension' => 0.4,
                ],
            ],
            'labels' => $data->map(fn (TrendValue $value) => $value->date),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
