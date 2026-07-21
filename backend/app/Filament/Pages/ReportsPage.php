<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\ReportPaymentMethodChart;
use App\Filament\Widgets\ReportRevenueChart;
use App\Filament\Widgets\ReportStatusChart;
use App\Filament\Widgets\ReportTopProductsChart;
use App\Models\DeliveryArea;
use App\Models\Order;
use App\Models\OrderItem;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Pages\Page;
use Filament\Schemas\Components\Html;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;
use Symfony\Component\HttpFoundation\StreamedResponse;
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
        return 'Analytics & Sales Reports';
    }

    public function getWidgets(): array
    {
        return [
            ReportRevenueChart::class,
            ReportTopProductsChart::class,
            ReportStatusChart::class,
            ReportPaymentMethodChart::class,
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('exportCsv')
                ->label('Export Sales CSV')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('success')
                ->action(fn (): StreamedResponse => $this->exportSalesReportCsv()),
        ];
    }

    public function exportSalesReportCsv(): StreamedResponse
    {
        $orders = Order::with('items')->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="elisfood-sales-report-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Reference', 'Customer Name', 'Phone', 'Method', 'Payment Method', 'Status', 'Subtotal (GHS)', 'Packaging Fee (GHS)', 'Delivery Fee (GHS)', 'Total (GHS)', 'Date']);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->reference,
                    $order->customer_name,
                    $order->phone,
                    ucfirst($order->method),
                    ucfirst($order->payment_method),
                    ucfirst($order->status),
                    number_format($order->subtotal / 100, 2),
                    number_format($order->packaging_fee / 100, 2),
                    number_format($order->delivery_fee / 100, 2),
                    number_format($order->total / 100, 2),
                    $order->created_at->format('Y-m-d H:i'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function content(Schema $schema): Schema
    {
        $totalRevenue = Order::sum('total');
        $totalOrders = Order::count();
        $averageOrderValue = $totalOrders ? $totalRevenue / $totalOrders : 0;
        $totalPackagingFees = Order::sum('packaging_fee');
        $totalDeliveryFees = Order::sum('delivery_fee');

        $topProductsList = OrderItem::selectRaw('name, sum(quantity) as total_quantity, sum(price * quantity) as total_sales')
            ->groupBy('name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        $deliveryAreaBreakdown = DeliveryArea::withCount('orders')
            ->get()
            ->map(function ($area) {
                $revenue = Order::where('delivery_area_id', $area->id)->sum('total');
                return [
                    'name' => $area->name,
                    'orders_count' => $area->orders_count,
                    'revenue' => number_format($revenue / 100, 2),
                ];
            });

        $stat = function (string $label, string $value, string $subtext = ''): string {
            $subtextHtml = $subtext ? '<div class="text-xs text-gray-400 mt-1">' . $subtext . '</div>' : '';
            return '<div class="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">' .
                '<div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">' . $label . '</div>' .
                '<div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">' . $value . '</div>' .
                $subtextHtml .
                '</div>';
        };

        $topProductsHtml = $topProductsList->count()
            ? '<div class="divide-y divide-gray-100 dark:divide-gray-700">' . $topProductsList->map(function ($p, $index) {
                $rank = $index + 1;
                $sales = number_format($p->total_sales / 100, 2);
                return "<div class=\"py-2.5 flex items-center justify-between\">
                    <div class=\"flex items-center space-x-3\">
                        <span class=\"flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-xs font-bold\">#{$rank}</span>
                        <span class=\"font-medium text-sm text-gray-900 dark:text-white\">{$p->name}</span>
                    </div>
                    <div class=\"text-right\">
                        <span class=\"font-semibold text-sm text-gray-900 dark:text-white\">{$p->total_quantity} sold</span>
                        <span class=\"block text-xs text-gray-500\">GH₵ {$sales}</span>
                    </div>
                </div>";
            })->join('') . '</div>'
            : '<p class="text-sm text-gray-500 py-4">No order items recorded yet.</p>';

        $deliveryAreaHtml = $deliveryAreaBreakdown->count()
            ? '<div class="divide-y divide-gray-100 dark:divide-gray-700">' . $deliveryAreaBreakdown->map(function ($a) {
                return "<div class=\"py-2.5 flex items-center justify-between\">
                    <div>
                        <span class=\"font-medium text-sm text-gray-900 dark:text-white\">{$a['name']}</span>
                        <span class=\"block text-xs text-gray-500\">{$a['orders_count']} total orders</span>
                    </div>
                    <div class=\"text-right font-semibold text-sm text-gray-900 dark:text-white\">
                        GH₵ {$a['revenue']}
                    </div>
                </div>";
            })->join('') . '</div>'
            : '<p class="text-sm text-gray-500 py-4">No delivery areas configured.</p>';

        return $schema
            ->components([
                Section::make('Financial Performance Overview')
                    ->columns(4)
                    ->schema([
                        Html::make($stat('Gross Revenue', 'GH₵ ' . number_format($totalRevenue / 100, 2), 'Total value of all placed orders')),
                        Html::make($stat('Total Orders', number_format($totalOrders), 'All-time completed & active orders')),
                        Html::make($stat('Avg Order Value', 'GH₵ ' . number_format($averageOrderValue / 100, 2), 'Average spent per transaction')),
                        Html::make($stat('Total Packaging & Fees', 'GH₵ ' . number_format(($totalPackagingFees + $totalDeliveryFees) / 100, 2), 'Packaging + Delivery fees collected')),
                    ]),

                Section::make('Leaderboards & Performance Breakdown')
                    ->columns(2)
                    ->schema([
                        Section::make('Top 5 Selling Items')
                            ->columnSpan(1)
                            ->schema([
                                Html::make($topProductsHtml),
                            ]),

                        Section::make('Revenue by Delivery Area')
                            ->columnSpan(1)
                            ->schema([
                                Html::make($deliveryAreaHtml),
                            ]),
                    ]),
            ]);
    }
}
