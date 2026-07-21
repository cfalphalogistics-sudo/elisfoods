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

    public string $dateFilter = 'today';

    public function setDateFilter(string $filter): void
    {
        $this->dateFilter = $filter;
    }

    public function getTitle(): string | Htmlable
    {
        $label = match ($this->dateFilter) {
            'today' => 'Today',
            'yesterday' => 'Yesterday',
            'this_week' => 'This Week',
            'this_month' => 'This Month',
            default => 'All Time',
        };

        return "Reports · {$label}";
    }

    public function getFooterWidgets(): array
    {
        return [
            ReportRevenueChart::class,
            ReportTopProductsChart::class,
            ReportStatusChart::class,
            ReportPaymentMethodChart::class,
        ];
    }

    public function getFooterWidgetsColumns(): int | array
    {
        return 2;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('filterToday')
                ->label('Today')
                ->icon('heroicon-o-calendar')
                ->color($this->dateFilter === 'today' ? 'primary' : 'gray')
                ->action(fn () => $this->setDateFilter('today')),

            Action::make('filterYesterday')
                ->label('Yesterday')
                ->icon('heroicon-o-clock')
                ->color($this->dateFilter === 'yesterday' ? 'primary' : 'gray')
                ->action(fn () => $this->setDateFilter('yesterday')),

            Action::make('filterThisWeek')
                ->label('This Week')
                ->icon('heroicon-o-calendar-days')
                ->color($this->dateFilter === 'this_week' ? 'primary' : 'gray')
                ->action(fn () => $this->setDateFilter('this_week')),

            Action::make('filterThisMonth')
                ->label('This Month')
                ->icon('heroicon-o-chart-bar')
                ->color($this->dateFilter === 'this_month' ? 'primary' : 'gray')
                ->action(fn () => $this->setDateFilter('this_month')),

            Action::make('filterAll')
                ->label('All Time')
                ->icon('heroicon-o-table-cells')
                ->color($this->dateFilter === 'all_time' ? 'primary' : 'gray')
                ->action(fn () => $this->setDateFilter('all_time')),

            Action::make('exportCsv')
                ->label('Export CSV')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('success')
                ->action(fn (): StreamedResponse => $this->exportSalesReportCsv()),
        ];
    }

    public function exportSalesReportCsv(): StreamedResponse
    {
        $query = Order::with('items')->latest();

        if ($this->dateFilter === 'today') {
            $query->whereDate('created_at', now()->toDateString());
        } elseif ($this->dateFilter === 'yesterday') {
            $query->whereDate('created_at', now()->subDay()->toDateString());
        } elseif ($this->dateFilter === 'this_week') {
            $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($this->dateFilter === 'this_month') {
            $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
        }

        $orders = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="elisfood-sales-report-' . $this->dateFilter . '-' . now()->format('Y-m-d') . '.csv"',
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
        $query = Order::query();

        if ($this->dateFilter === 'today') {
            $query->whereDate('created_at', now()->toDateString());
        } elseif ($this->dateFilter === 'yesterday') {
            $query->whereDate('created_at', now()->subDay()->toDateString());
        } elseif ($this->dateFilter === 'this_week') {
            $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($this->dateFilter === 'this_month') {
            $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
        }

        $totalRevenue = (clone $query)->sum('total');
        $totalOrders = (clone $query)->count();
        $averageOrderValue = $totalOrders ? $totalRevenue / $totalOrders : 0;
        $totalPackagingFees = (clone $query)->sum('packaging_fee');
        $totalDeliveryFees = (clone $query)->sum('delivery_fee');

        $orderIds = (clone $query)->pluck('id');

        $topProductsList = OrderItem::whereIn('order_id', $orderIds)
            ->selectRaw('name, sum(quantity) as total_quantity, sum(price * quantity) as total_sales')
            ->groupBy('name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        $deliveryAreaBreakdown = DeliveryArea::withCount(['orders' => fn ($q) => $q->whereIn('id', $orderIds)])
            ->get()
            ->map(function ($area) use ($orderIds) {
                $revenue = Order::whereIn('id', $orderIds)->where('delivery_area_id', $area->id)->sum('total');
                return [
                    'name' => $area->name,
                    'orders_count' => $area->orders_count,
                    'revenue' => number_format($revenue / 100, 2),
                ];
            });

        $stat = function (string $label, string $value, string $subtext = ''): string {
            $subtextHtml = $subtext ? '<div class="text-xs text-gray-400 dark:text-gray-500 mt-1.5">' . $subtext . '</div>' : '';
            return '<div class="relative overflow-hidden p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-950/5 dark:ring-white/10">' .
                '<div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>' .
                '<div class="text-[0.68rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">' . $label . '</div>' .
                '<div class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-1.5">' . $value . '</div>' .
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
            : '<p class="text-sm text-gray-500 py-4">No order items recorded for this period.</p>';

        $deliveryAreaHtml = $deliveryAreaBreakdown->count()
            ? '<div class="divide-y divide-gray-100 dark:divide-gray-700">' . $deliveryAreaBreakdown->map(function ($a) {
                return "<div class=\"py-2.5 flex items-center justify-between\">
                    <div>
                        <span class=\"font-medium text-sm text-gray-900 dark:text-white\">{$a['name']}</span>
                        <span class=\"block text-xs text-gray-500\">{$a['orders_count']} orders</span>
                    </div>
                    <div class=\"text-right font-semibold text-sm text-gray-900 dark:text-white\">
                        GH₵ {$a['revenue']}
                    </div>
                </div>";
            })->join('') . '</div>'
            : '<p class="text-sm text-gray-500 py-4">No delivery areas recorded for this period.</p>';

        $periodLabel = match ($this->dateFilter) {
            'today' => 'Today',
            'yesterday' => 'Yesterday',
            'this_week' => 'This Week',
            'this_month' => 'This Month',
            default => 'All Time',
        };

        return $schema
            ->components([
                Section::make("Financial Performance Overview ({$periodLabel})")
                    ->columns(4)
                    ->schema([
                        Html::make($stat('Gross Revenue', 'GH₵ ' . number_format($totalRevenue / 100, 2), "Revenue for {$periodLabel}")),
                        Html::make($stat('Total Orders', number_format($totalOrders), "Orders placed {$periodLabel}")),
                        Html::make($stat('Avg Order Value', 'GH₵ ' . number_format($averageOrderValue / 100, 2), 'Average spent per order')),
                        Html::make($stat('Packaging & Delivery Fees', 'GH₵ ' . number_format(($totalPackagingFees + $totalDeliveryFees) / 100, 2), 'Fees collected')),
                    ]),

                Section::make('Leaderboards & Performance Breakdown')
                    ->columns(2)
                    ->schema([
                        Section::make("Top 5 Selling Items ({$periodLabel})")
                            ->columnSpan(1)
                            ->schema([
                                Html::make($topProductsHtml),
                            ]),

                        Section::make("Revenue by Delivery Area ({$periodLabel})")
                            ->columnSpan(1)
                            ->schema([
                                Html::make($deliveryAreaHtml),
                            ]),
                    ]),
            ]);
    }
}
