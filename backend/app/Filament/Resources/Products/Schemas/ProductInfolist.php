<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProductInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Overview')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('category.name')
                            ->label('Category')
                            ->placeholder('-'),
                        TextEntry::make('name'),
                        TextEntry::make('slug'),
                        TextEntry::make('type')
                            ->badge(),
                        TextEntry::make('prep_time')
                            ->numeric()
                            ->suffix(' mins')
                            ->placeholder('-'),
                        TextEntry::make('rating')
                            ->numeric(),
                        TextEntry::make('badge')
                            ->placeholder('-'),
                        Grid::make(2)
                            ->schema([
                                IconEntry::make('available')
                                    ->boolean(),
                                IconEntry::make('is_featured')
                                    ->boolean(),
                            ]),
                    ]),

                Section::make('Pricing')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('price')
                            ->money('GHS', 100),
                        TextEntry::make('compare_price')
                            ->money('GHS', 100)
                            ->placeholder('-'),
                    ]),

                Section::make('Media & descriptions')
                    ->schema([
                        ImageEntry::make('image')
                            ->placeholder('-')
                            ->columnSpanFull(),
                        TextEntry::make('description')
                            ->placeholder('-')
                            ->columnSpanFull(),
                        TextEntry::make('long_description')
                            ->placeholder('-')
                            ->columnSpanFull(),
                        TextEntry::make('options')
                            ->placeholder('-')
                            ->columnSpanFull(),
                    ]),

                Section::make('Add-ons')
                    ->schema([
                        TextEntry::make('addOns.name')
                            ->label('Add-ons')
                            ->listWithLineBreaks()
                            ->placeholder('No add-ons linked'),
                    ])
                    ->collapsible(),

                Section::make('Variations')
                    ->schema([
                        RepeatableEntry::make('variations')
                            ->schema([
                                TextEntry::make('label'),
                                TextEntry::make('price')->money('GHS', 100),
                                TextEntry::make('stock_quantity'),
                            ])
                            ->columns(3)
                            ->placeholder('No variations'),
                    ])
                    ->collapsible(),

                Section::make('Timestamps')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('created_at')
                            ->dateTime(),
                        TextEntry::make('updated_at')
                            ->dateTime(),
                    ])
                    ->collapsible(),
            ]);
    }
}
