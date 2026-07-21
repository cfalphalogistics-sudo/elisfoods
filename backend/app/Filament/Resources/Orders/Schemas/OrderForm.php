<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('reference')
                    ->required(),
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
                TextInput::make('method')
                    ->required(),
                Textarea::make('address')
                    ->columnSpanFull(),
                TextInput::make('ghana_post_gps'),
                TextInput::make('landmark'),
                Textarea::make('delivery_instructions')
                    ->columnSpanFull(),
                Select::make('delivery_area_id')
                    ->relationship('deliveryArea', 'name'),
                TextInput::make('preferred_time'),
                TextInput::make('payment_method')
                    ->required(),
                TextInput::make('status')
                    ->required()
                    ->default('placed'),
                TextInput::make('subtotal')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('add_ons_total')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('packaging_fee')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('delivery_fee')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('discount')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('total')
                    ->required()
                    ->numeric()
                    ->default(0),
                Textarea::make('notes')
                    ->columnSpanFull(),
                DateTimePicker::make('paid_at'),
            ]);
    }
}
