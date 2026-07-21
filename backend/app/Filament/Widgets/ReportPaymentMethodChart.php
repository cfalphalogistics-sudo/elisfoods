<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;

class ReportPaymentMethodChart extends ChartWidget
{
    protected ?string $heading = 'Payment Methods Breakdown';

    protected int | string | array $columnSpan = 1;

    protected function getData(): array
    {
        $methods = Order::selectRaw('payment_method, count(*) as count')
            ->groupBy('payment_method')
            ->pluck('count', 'payment_method')
            ->toArray();

        $labels = array_map(fn ($m) => match ($m) {
            'hubtel' => 'Hubtel Mobile Money/Card',
            'cash' => 'Cash on Delivery',
            'whatsapp' => 'WhatsApp / Manual',
            default => ucfirst($m),
        }, array_keys($methods));

        return [
            'datasets' => [
                [
                    'label' => 'Orders',
                    'data' => array_values($methods),
                    'backgroundColor' => [
                        '#f97316', // hubtel (orange)
                        '#10b981', // cash (emerald)
                        '#25d366', // whatsapp (green)
                    ],
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'pie';
    }
}
