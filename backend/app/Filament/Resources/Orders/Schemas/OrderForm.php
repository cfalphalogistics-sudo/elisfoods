<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Models\StoreSetting;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        $moneyToPesewas = fn (?float $state): int => (int) round(($state ?? 0) * 100);
        $pesewasToMoney = fn (?int $state): float => ($state ?? 0) / 100;

        return $schema
            ->components([
                Section::make('Customer & delivery')
                    ->columns(2)
                    ->schema([
                        TextInput::make('reference')
                            ->required()
                            ->unique('orders', 'reference', ignoreRecord: true),
                        TextInput::make('customer_name')
                            ->required(),
                        TextInput::make('phone')
                            ->tel()
                            ->required(),
                        TextInput::make('alt_phone')
                            ->tel(),
                        TextInput::make('email')
                            ->label('Email address')
                            ->email(),
                        Select::make('method')
                            ->options([
                                'delivery' => 'Delivery',
                                'pickup' => 'Pickup',
                            ])
                            ->required(),
                        Select::make('delivery_area_id')
                            ->relationship('deliveryArea', 'name'),
                        TextInput::make('preferred_time'),
                    ]),

                Section::make('Address')
                    ->schema([
                        Textarea::make('address')
                            ->columnSpanFull(),
                        Grid::make(2)
                            ->schema([
                                TextInput::make('ghana_post_gps'),
                                TextInput::make('landmark'),
                            ]),
                        Textarea::make('delivery_instructions')
                            ->columnSpanFull(),
                    ]),

                Section::make('Payment & status')
                    ->columns(2)
                    ->schema([
                        Select::make('payment_method')
                            ->options(function () {
                                $enabled = StoreSetting::paymentMethods();

                                return array_intersect_key([
                                    'hubtel' => 'Hubtel',
                                    'cash' => 'Cash on delivery',
                                    'whatsapp' => 'WhatsApp / manual',
                                ], array_flip($enabled));
                            })
                            ->required(),
                        Select::make('status')
                            ->options([
                                'placed' => 'Placed',
                                'confirmed' => 'Confirmed',
                                'preparing' => 'Preparing',
                                'out-for-delivery' => 'Out for delivery',
                                'delivered' => 'Delivered',
                                'cancelled' => 'Cancelled',
                            ])
                            ->required()
                            ->default('placed'),
                        DateTimePicker::make('paid_at')
                            ->placeholder('Leave empty until paid'),
                    ]),

                Section::make('Totals')
                    ->columns(3)
                    ->schema([
                        TextInput::make('subtotal')
                            ->numeric()
                            ->prefix('GH₵')
                            ->default(0)
                            ->formatStateUsing($pesewasToMoney)
                            ->dehydrateStateUsing($moneyToPesewas),
                        TextInput::make('add_ons_total')
                            ->numeric()
                            ->prefix('GH₵')
                            ->default(0)
                            ->formatStateUsing($pesewasToMoney)
                            ->dehydrateStateUsing($moneyToPesewas),
                        TextInput::make('packaging_fee')
                            ->numeric()
                            ->prefix('GH₵')
                            ->default(0)
                            ->formatStateUsing($pesewasToMoney)
                            ->dehydrateStateUsing($moneyToPesewas),
                        TextInput::make('delivery_fee')
                            ->numeric()
                            ->prefix('GH₵')
                            ->default(0)
                            ->formatStateUsing($pesewasToMoney)
                            ->dehydrateStateUsing($moneyToPesewas),
                        TextInput::make('discount')
                            ->numeric()
                            ->prefix('GH₵')
                            ->default(0)
                            ->formatStateUsing($pesewasToMoney)
                            ->dehydrateStateUsing($moneyToPesewas),
                        TextInput::make('total')
                            ->numeric()
                            ->prefix('GH₵')
                            ->default(0)
                            ->formatStateUsing($pesewasToMoney)
                            ->dehydrateStateUsing($moneyToPesewas),
                    ]),

                Section::make('Notes')
                    ->schema([
                        Textarea::make('notes')
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
