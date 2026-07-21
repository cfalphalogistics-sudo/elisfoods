<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Order summary')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('reference')
                            ->placeholder('-'),
                        TextEntry::make('status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'placed' => 'gray',
                                'confirmed' => 'info',
                                'preparing' => 'warning',
                                'out-for-delivery' => 'primary',
                                'delivered' => 'success',
                                'cancelled' => 'danger',
                                default => 'gray',
                            }),
                        TextEntry::make('payment_method')
                            ->placeholder('-'),
                        TextEntry::make('method')
                            ->placeholder('-'),
                        TextEntry::make('paid_at')
                            ->dateTime()
                            ->placeholder('Not paid'),
                        TextEntry::make('created_at')
                            ->dateTime(),
                    ]),

                Section::make('Customer')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('customer_name'),
                        TextEntry::make('phone'),
                        TextEntry::make('alt_phone')
                            ->placeholder('-'),
                        TextEntry::make('email')
                            ->placeholder('-'),
                        TextEntry::make('deliveryArea.name')
                            ->label('Delivery area')
                            ->placeholder('-'),
                        TextEntry::make('preferred_time')
                            ->placeholder('-'),
                    ]),

                Section::make('Address')
                    ->schema([
                        TextEntry::make('address')
                            ->columnSpanFull()
                            ->placeholder('-'),
                        Grid::make(2)
                            ->schema([
                                TextEntry::make('ghana_post_gps')
                                    ->placeholder('-'),
                                TextEntry::make('landmark')
                                    ->placeholder('-'),
                            ]),
                        TextEntry::make('delivery_instructions')
                            ->columnSpanFull()
                            ->placeholder('-'),
                    ]),

                Section::make('Totals')
                    ->columns(3)
                    ->schema([
                        TextEntry::make('subtotal')->money('GHS', 100),
                        TextEntry::make('add_ons_total')->money('GHS', 100),
                        TextEntry::make('packaging_fee')->money('GHS', 100),
                        TextEntry::make('delivery_fee')->money('GHS', 100),
                        TextEntry::make('discount')->money('GHS', 100),
                        TextEntry::make('total')->money('GHS', 100),
                    ]),

                Section::make('Notes')
                    ->schema([
                        TextEntry::make('notes')
                            ->columnSpanFull()
                            ->placeholder('-'),
                    ]),
            ]);
    }
}
