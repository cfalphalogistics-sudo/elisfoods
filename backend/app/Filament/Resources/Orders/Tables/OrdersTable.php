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
                Stack::make([
                    Split::make([
                        Stack::make([
                            TextColumn::make('customer_name')
                                ->weight(FontWeight::Bold)
                                ->searchable(),
                            TextColumn::make('phone')
                                ->color('gray')
                                ->searchable(),
                        ]),
                        TextColumn::make('reference')
                            ->color('primary')
                            ->weight(FontWeight::Bold)
                            ->searchable(),
                        SelectColumn::make('status')
                            ->options([
                                'placed' => 'Placed',
                                'confirmed' => 'Confirmed',
                                'preparing' => 'Preparing',
                                'out-for-delivery' => 'Out for delivery',
                                'delivered' => 'Delivered',
                                'cancelled' => 'Cancelled',
                            ])
                            ->selectablePlaceholder(false)
                            ->grow(false),
                    ]),
                    Split::make([
                        Stack::make([
                            TextColumn::make('total_label')
                                ->default('Total Order')
                                ->color('gray'),
                            TextColumn::make('total')
                                ->money('GHS', 100)
                                ->weight(FontWeight::Bold),
                        ]),
                        Stack::make([
                            TextColumn::make('method')
                                ->badge()
                                ->color(fn (string $state): string => match ($state) {
                                    'delivery' => 'info',
                                    'pickup' => 'success',
                                    default => 'gray',
                                })
                                ->grow(false),
                        ]),
                        Stack::make([
                            TextColumn::make('payment_method')
                                ->badge()
                                ->color(fn (string $state): string => match ($state) {
                                    'hubtel' => 'primary',
                                    'cash' => 'success',
                                    'whatsapp' => 'warning',
                                    default => 'gray',
                                })
                                ->grow(false),
                        ]),
                    ]),
                ])->space(3),
            ])
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
                SelectFilter::make('status')
                    ->options([
                        'placed' => 'Placed',
                        'confirmed' => 'Confirmed',
                        'preparing' => 'Preparing',
                        'out-for-delivery' => 'Out for delivery',
                        'delivered' => 'Delivered',
                        'cancelled' => 'Cancelled',
                    ]),
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
            ->contentGrid([
                'default' => 1,
                'md' => 2,
                'xl' => 3,
            ]);
    }
}
