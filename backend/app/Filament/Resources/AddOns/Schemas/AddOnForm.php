<?php

namespace App\Filament\Resources\AddOns\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class AddOnForm
{
    public static function configure(Schema $schema): Schema
    {
        $pesewasToMoney = fn (?int $state): float => ($state ?? 0) / 100;
        $moneyToPesewas = fn (?float $state): int => (int) round(($state ?? 0) * 100);

        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(function (Set $set, ?string $state, ?string $old) {
                        if (filled($state) && blank($old)) {
                            $set('slug', Str::slug($state));
                        }
                    }),
                TextInput::make('slug')
                    ->required()
                    ->unique('add_ons', 'slug', ignoreRecord: true),
                Select::make('category')
                    ->options([
                        'side' => 'Side',
                        'sauce' => 'Sauce',
                        'protein' => 'Protein',
                        'drink' => 'Drink',
                    ])
                    ->placeholder('Select a category'),
                TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->prefix('GH₵')
                    ->hint('Enter amount in GH₵; stored as pesewas')
                    ->formatStateUsing($pesewasToMoney)
                    ->dehydrateStateUsing($moneyToPesewas),
                Toggle::make('is_active')
                    ->required()
                    ->default(true),
            ]);
    }
}
