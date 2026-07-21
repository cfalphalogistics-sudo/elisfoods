<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('All'),
            'placed' => Tab::make('Placed')
                ->badge(Order::where('status', 'placed')->count() ?: null)
                ->badgeColor('info')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'placed')),
            'confirmed' => Tab::make('Confirmed')
                ->badge(Order::where('status', 'confirmed')->count() ?: null)
                ->badgeColor('info')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'confirmed')),
            'preparing' => Tab::make('Preparing')
                ->badge(Order::where('status', 'preparing')->count() ?: null)
                ->badgeColor('warning')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'preparing')),
            'out-for-delivery' => Tab::make('Out for delivery')
                ->badge(Order::where('status', 'out-for-delivery')->count() ?: null)
                ->badgeColor('primary')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'out-for-delivery')),
            'delivered' => Tab::make('Delivered')
                ->badgeColor('success')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'delivered')),
            'cancelled' => Tab::make('Cancelled')
                ->badgeColor('danger')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'cancelled')),
        ];
    }
}
