<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Basic details')
                    ->columns(2)
                    ->schema([
                        Select::make('category_id')
                            ->relationship('category', 'name')
                            ->required(),
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
                            ->unique('products', 'slug', ignoreRecord: true),
                        Select::make('type')
                            ->options([
                                'prepared' => 'Prepared',
                                'fried' => 'Fried',
                                'marinated' => 'Marinated',
                                'frozen' => 'Frozen',
                                'side' => 'Side',
                                'drink' => 'Drink',
                                'combo' => 'Combo',
                            ])
                            ->required(),
                        TextInput::make('prep_time')
                            ->numeric()
                            ->suffix('mins'),
                        TextInput::make('rating')
                            ->required()
                            ->numeric()
                            ->default(4.5)
                            ->minValue(0)
                            ->maxValue(5)
                            ->step(0.1),
                        TextInput::make('badge'),
                        Grid::make(2)
                            ->schema([
                                Toggle::make('available')
                                    ->required()
                                    ->default(true),
                                Toggle::make('is_featured')
                                    ->required()
                                    ->default(false),
                            ]),
                    ]),

                Section::make('Pricing')
                    ->columns(2)
                    ->schema([
                        TextInput::make('price')
                            ->required()
                            ->numeric()
                            ->prefix('GH₵')
                            ->hint('Enter amount in GH₵; stored as pesewas')
                            ->formatStateUsing(fn (?int $state): float => ($state ?? 0) / 100)
                            ->dehydrateStateUsing(fn (?float $state): int => (int) round(($state ?? 0) * 100)),
                        TextInput::make('compare_price')
                            ->numeric()
                            ->prefix('GH₵')
                            ->hint('Enter amount in GH₵; stored as pesewas')
                            ->formatStateUsing(fn (?int $state): float => ($state ?? 0) / 100)
                            ->dehydrateStateUsing(fn (?float $state): int => (int) round(($state ?? 0) * 100)),
                    ]),

                Section::make('Media & descriptions')
                    ->schema([
                        FileUpload::make('image')
                            ->image()
                            ->directory('products')
                            ->maxSize(2048)
                            ->columnSpanFull(),
                        Textarea::make('description')
                            ->columnSpanFull(),
                        Textarea::make('long_description')
                            ->columnSpanFull(),
                    ]),

                Section::make('Add-ons & variations')
                    ->schema([
                        CheckboxList::make('addOns')
                            ->relationship('addOns', 'name')
                            ->columns(3)
                            ->searchable()
                            ->bulkToggleable(),
                        Repeater::make('variations')
                            ->relationship()
                            ->schema([
                                TextInput::make('label')
                                    ->required(),
                                TextInput::make('price')
                                    ->numeric()
                                    ->prefix('GH₵')
                                    ->hint('GH₵; stored as pesewas')
                                    ->formatStateUsing(fn (?int $state): float => ($state ?? 0) / 100)
                                    ->dehydrateStateUsing(fn (?float $state): int => (int) round(($state ?? 0) * 100)),
                                TextInput::make('stock_quantity')
                                    ->numeric()
                                    ->default(0),
                            ])
                            ->columns(3)
                            ->addActionLabel('Add variation')
                            ->reorderable(false)
                            ->collapsible(),
                        Textarea::make('options')
                            ->hint('JSON options shown on the product page')
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
