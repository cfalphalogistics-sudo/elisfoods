<?php

namespace App\Filament\Resources\Orders\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use App\Models\Order;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('reference')
                    ->searchable(),
                TextColumn::make('customer_name')
                    ->searchable(),
                TextColumn::make('phone')
                    ->searchable(),
                TextColumn::make('deliveryArea.name')
                    ->label('Area')
                    ->searchable(),
                TextColumn::make('method')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'delivery' => 'info',
                        'pickup' => 'success',
                        default => 'gray',
                    }),
                TextColumn::make('payment_method')
                    ->badge()
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
                    ->sortable(),
                TextColumn::make('paid_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
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
            ]);
    }
}
