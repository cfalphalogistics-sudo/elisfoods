<?php

namespace App\Filament\Resources\Orders\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Select;
use Filament\Support\Enums\FontWeight;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use App\Models\Order;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('reference')
                    ->color('primary')
                    ->weight(FontWeight::Bold)
                    ->copyable()
                    ->copyMessage('Reference copied')
                    ->description(fn (Order $record): string => $record->created_at->diffForHumans())
                    ->searchable(),
                TextColumn::make('customer_name')
                    ->label('Customer')
                    ->weight(FontWeight::SemiBold)
                    ->description(fn (Order $record): ?string => $record->phone)
                    ->searchable(['customer_name', 'phone']),
                TextColumn::make('deliveryArea.name')
                    ->label('Area')
                    ->placeholder('—')
                    ->searchable(),
                TextColumn::make('method')
                    ->badge()
                    ->icon(fn (string $state): string => match ($state) {
                        'delivery' => 'heroicon-m-truck',
                        'pickup' => 'heroicon-m-building-storefront',
                        default => 'heroicon-m-shopping-bag',
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'delivery' => 'info',
                        'pickup' => 'success',
                        default => 'gray',
                    }),
                TextColumn::make('payment_method')
                    ->label('Payment')
                    ->badge()
                    ->icon(fn (string $state): string => match ($state) {
                        'hubtel' => 'heroicon-m-device-phone-mobile',
                        'cash' => 'heroicon-m-banknotes',
                        'whatsapp' => 'heroicon-m-chat-bubble-left-right',
                        default => 'heroicon-m-credit-card',
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'hubtel' => 'primary',
                        'cash' => 'success',
                        'whatsapp' => 'warning',
                        default => 'gray',
                    }),
                SelectColumn::make('status')
                    ->options([
                        'placed' => 'Placed',
                        'confirmed' => 'Confirmed',
                        'preparing' => 'Preparing',
                        'out-for-delivery' => 'Out for delivery',
                        'delivered' => 'Delivered',
                        'cancelled' => 'Cancelled',
                    ])
                    ->selectablePlaceholder(false),
                TextColumn::make('total')
                    ->money('GHS', 100)
                    ->weight(FontWeight::Bold)
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Placed at')
                    ->dateTime('D, M j · g:i A')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->poll('30s')
            ->filters([
                Filter::make('date')
                    ->form([
                        Select::make('preset')
                            ->label('Date Range')
                            ->options([
                                'today' => 'Today (Default)',
                                'yesterday' => 'Yesterday',
                                'this_week' => 'This Week',
                                'this_month' => 'This Month',
                                'all' => 'All Time',
                            ])
                            ->default('today'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        $preset = $data['preset'] ?? 'today';
                        return match ($preset) {
                            'today' => $query->whereDate('created_at', now()->toDateString()),
                            'yesterday' => $query->whereDate('created_at', now()->subDay()->toDateString()),
                            'this_week' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
                            'this_month' => $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year),
                            default => $query,
                        };
                    }),
                SelectFilter::make('payment_method')
                    ->options([
                        'hubtel' => 'Hubtel',
                        'cash' => 'Cash on delivery',
                        'whatsapp' => 'WhatsApp / manual',
                    ]),
                SelectFilter::make('method')
                    ->options([
                        'delivery' => 'Delivery',
                        'pickup' => 'Pickup',
                    ]),
            ])
            ->actions([
                ViewAction::make(),
                Action::make('whatsapp')
                    ->label('WhatsApp')
                    ->icon('heroicon-o-chat-bubble-left-right')
                    ->color('success')
                    ->url(fn (Order $record): ?string => $record->whatsappUrl())
                    ->openUrlInNewTab()
                    ->visible(fn (Order $record): bool => $record->whatsappUrl() !== null)
                    ->tooltip('Send status update via WhatsApp'),
                Action::make('markPreparing')
                    ->label('Prepare')
                    ->icon('heroicon-o-fire')
                    ->color('warning')
                    ->visible(fn (Order $record): bool => in_array($record->status, ['placed', 'confirmed']))
                    ->action(fn (Order $record) => $record->update(['status' => 'preparing'])),
                Action::make('markDispatched')
                    ->label('Dispatch')
                    ->icon('heroicon-o-truck')
                    ->color('primary')
                    ->visible(fn (Order $record): bool => $record->status === 'preparing')
                    ->action(fn (Order $record) => $record->update(['status' => 'out-for-delivery'])),
                Action::make('markDelivered')
                    ->label('Complete')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Order $record): bool => in_array($record->status, ['preparing', 'out-for-delivery']))
                    ->action(fn (Order $record) => $record->update(['status' => 'delivered'])),
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateIcon('heroicon-o-shopping-bag')
            ->emptyStateHeading('No orders here yet')
            ->emptyStateDescription('New orders from the website will appear here the moment they are placed.')
            ->stackedOnMobile();
    }
}
